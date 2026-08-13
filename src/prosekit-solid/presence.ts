/**
 * ProseMirror decorations for encoded @y/y relative-position presence.
 * Consumers supply collaboration data; ui-solid owns identity colours, DOM,
 * selection treatment and presentation.
 */

import type { EditorState } from '@prosekit/pm/state'
import { Plugin, PluginKey } from '@prosekit/pm/state'
import { Decoration, DecorationSet } from '@prosekit/pm/view'
import { relativePositionToAbsolutePosition, ySyncPluginKey } from '@y/prosemirror'
import { decodeRelativePosition } from '@y/y'
import { presenceColor, presenceSelectionColor } from '../atoms/presence/contract'

export interface RemoteCursorEntry {
	userId: string
	name: string
	anchor: Uint8Array
	head: Uint8Array
}

export const remoteCursorsKey = new PluginKey<DecorationSet>('ui-solid-remote-cursors')

export interface RemoteCursorsOptions {
	/** Name-label behavior. 'auto' (default) collapses each label to a small
	 *  nub after an idle delay, re-expanding while that user is ACTING and
	 *  while hovered; 'always' keeps labels permanently expanded. Activity
	 *  means the user's own relative position changed (typing or moving
	 *  their caret) — local edits that merely shift a remote caret's
	 *  absolute position do NOT re-expand its label. */
	labels?: 'auto' | 'always'
	/** How long a label stays expanded after its user's last action. */
	labelIdleMs?: number
}

const cursorSignature = (entry: RemoteCursorEntry): string =>
	`${entry.anchor.join(',')}|${entry.head.join(',')}`

const caretDom = (
	entry: RemoteCursorEntry,
	labels: 'auto' | 'always',
	active: boolean,
	anchorName: string,
): HTMLElement => {
	const caret = document.createElement('span')
	caret.className = 'aic-prosekit-remote-caret'
	caret.dataset.labels = labels
	if (active) caret.dataset.active = ''
	caret.style.setProperty('--ui-presence-color', presenceColor(entry.userId))
	caret.style.setProperty('anchor-name', anchorName)
	const label = document.createElement('span')
	label.className = 'aic-prosekit-remote-caret-label'
	label.textContent = entry.name
	label.style.setProperty('position-anchor', anchorName)
	caret.appendChild(label)
	return caret
}

export function remoteCursorsPlugin(
	getCursors: () => RemoteCursorEntry[],
	options?: RemoteCursorsOptions,
): Plugin {
	const labels = options?.labels ?? 'auto'
	const idleMs = options?.labelIdleMs ?? 1600
	/* Activity tracking: a user's label is expanded while their RELATIVE
	 * position keeps changing. Live caret elements are registered so the
	 * idle timer can collapse a label without waiting for a transaction. */
	const signatures = new Map<string, string>()
	const liveCarets = new Map<string, HTMLElement>()
	/* Stable per-user CSS anchor names so each label can be a fixed-position
	 * anchored element that escapes the editor shell's overflow clip. */
	const anchorNames = new Map<string, string>()
	let anchorSeq = 0
	const anchorNameFor = (userId: string): string => {
		let name = anchorNames.get(userId)
		if (!name) {
			anchorSeq += 1
			name = `--aic-prosekit-caret-${anchorSeq}`
			anchorNames.set(userId, name)
		}
		return name
	}
	const idleTimers = new Map<string, ReturnType<typeof setTimeout>>()
	const activeUntil = new Map<string, number>()
	const markActive = (userId: string) => {
		activeUntil.set(userId, Date.now() + idleMs)
		liveCarets.get(userId)?.setAttribute('data-active', '')
		clearTimeout(idleTimers.get(userId))
		idleTimers.set(
			userId,
			setTimeout(() => liveCarets.get(userId)?.removeAttribute('data-active'), idleMs),
		)
	}
	const build = (
		state: EditorState,
		oldState?: EditorState,
		remoteChanges: readonly [number, number][] = [],
	): DecorationSet => {
		const sync =
			ySyncPluginKey.getState(state) ?? (oldState ? ySyncPluginKey.getState(oldState) : undefined)
		const ytype = sync?.ytype
		if (!ytype) return DecorationSet.empty
		const renderer = sync.renderer ?? null
		const clamp = (position: number) => Math.max(0, Math.min(position, state.doc.content.size))
		const decorations: Decoration[] = []
		for (const cursor of getCursors()) {
			const anchor = relativePositionToAbsolutePosition(
				decodeRelativePosition(cursor.anchor),
				ytype,
				state.doc,
				renderer,
			)
			const head = relativePositionToAbsolutePosition(
				decodeRelativePosition(cursor.head),
				ytype,
				state.doc,
				renderer,
			)
			if (anchor == null || head == null) continue
			const anchorPosition = clamp(anchor)
			const headPosition = clamp(head)
			const [from, to] =
				anchorPosition <= headPosition
					? [anchorPosition, headPosition]
					: [headPosition, anchorPosition]
			if (from < to) {
				decorations.push(
					Decoration.inline(from, to, {
						class: 'aic-prosekit-remote-selection',
						style: `--ui-presence-selection: ${presenceSelectionColor(cursor.userId)}`,
					}),
				)
			}
			/* Two activity signals. A changed SIGNATURE means the user jumped or
			 * selected (their relative position bytes changed). Typing in place
			 * never changes the bytes — yjs relative positions are designed to
			 * ride — so typing is detected as a REMOTE-origin change whose
			 * range touches this cursor's head. */
			const signature = cursorSignature(cursor)
			const jumped = signatures.get(cursor.userId) !== signature
			signatures.set(cursor.userId, signature)
			const typedHere = remoteChanges.some(
				([from, to]) => headPosition >= from - 1 && headPosition <= to + 1,
			)
			if (jumped || typedHere) markActive(cursor.userId)
			decorations.push(
				Decoration.widget(
					headPosition,
					() => {
						const caret = caretDom(
							cursor,
							labels,
							(activeUntil.get(cursor.userId) ?? 0) > Date.now(),
							anchorNameFor(cursor.userId),
						)
						liveCarets.set(cursor.userId, caret)
						return caret
					},
					{
						key: `ui-solid-remote-caret-${cursor.userId}`,
						ignoreSelection: true,
						/* Same-key widget swaps can destroy the OLD decoration after
						 * the replacement registered its element — only unregister
						 * when the node being destroyed is the one on record. */
						destroy: (node) => {
							if (liveCarets.get(cursor.userId) !== node) return
							liveCarets.delete(cursor.userId)
							clearTimeout(idleTimers.get(cursor.userId))
							idleTimers.delete(cursor.userId)
							activeUntil.delete(cursor.userId)
						},
					},
				),
			)
		}
		return DecorationSet.create(state.doc, decorations)
	}

	return new Plugin({
		key: remoteCursorsKey,
		state: {
			init: () => DecorationSet.empty,
			apply(transaction, decorations, oldState, state) {
				if (transaction.getMeta(remoteCursorsKey) === true || transaction.docChanged) {
					/* Ranges changed by REMOTE peers in this transaction (the RDT
					 * pipeline stamps its applied transactions with the
					 * y-sync-transaction meta; hydration and local edits carry no
					 * such meta and must not light labels up). */
					const remoteChanges: [number, number][] = []
					if (transaction.docChanged && transaction.getMeta('y-sync-transaction') != null) {
						transaction.mapping.maps.forEach((map, index) => {
							const rest = transaction.mapping.slice(index + 1)
							map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
								remoteChanges.push([rest.map(newStart, -1), rest.map(newEnd, 1)])
							})
						})
					}
					return build(state, oldState, remoteChanges)
				}
				return decorations.map(transaction.mapping, transaction.doc)
			},
		},
		props: {
			decorations: (state) => remoteCursorsKey.getState(state),
		},
	})
}
