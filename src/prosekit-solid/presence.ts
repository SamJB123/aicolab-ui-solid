/**
 * ProseMirror decorations for encoded @y/y relative-position presence.
 * Consumers supply collaboration data; ui-solid owns identity colours, DOM,
 * selection treatment and presentation.
 */

import type { EditorState } from '@prosekit/pm/state'
import { Plugin, PluginKey } from '@prosekit/pm/state'
import { Decoration, DecorationSet, type EditorView } from '@prosekit/pm/view'
import {
	relativePositionsToResolvedPositions,
	resolvedPositionsToRelativePositions,
	ySyncPluginKey,
} from '@y/prosemirror'
import {
	ContentType,
	createAbsolutePositionFromRelativePosition,
	createRelativePositionFromTypeIndex,
	decodeRelativePosition,
	encodeRelativePosition,
	getNodeChildren,
	type RelativePosition,
	type Node as YNode,
} from '@y/y'
import { presenceColor, presenceSelectionColor } from '../atoms/presence/contract.ts'

export interface RemoteCursorEntry {
	userId: string
	name: string
	anchor: Uint8Array
	head: Uint8Array
}

/** Encode the current selection through the live binding. Right-associated
 * endpoints follow the writer's next insertion, including at block ends.
 * Use the binding's renderer for both re-anchoring operations so filtered
 * render space is never mistaken for a raw Y node index. Unbound/unmappable
 * selections clear previously published presence instead of leaving ghosts. */
export function encodeSelectionCursor(
	view: EditorView,
): Pick<RemoteCursorEntry, 'anchor' | 'head'> | null {
	const sync = ySyncPluginKey.getState(view.state)
	if (!sync?.ytype?.doc || !sync.binding) return null
	const doc = sync.ytype.doc
	const { $anchor, $head } = view.state.selection
	const positions = resolvedPositionsToRelativePositions(view, [$anchor, $head])
	const encode = (position: RelativePosition | null | undefined): Uint8Array | null => {
		if (!position) return null
		if (position.assoc >= 0) return encodeRelativePosition(position)
		const renderer = sync.renderer ?? null
		const absolute = createAbsolutePositionFromRelativePosition(position, doc, true, renderer)
		if (!absolute) return null
		return encodeRelativePosition(
			createRelativePositionFromTypeIndex(absolute.type, absolute.index, 0, renderer),
		)
	}
	const anchor = encode(positions[0])
	const head = encode(positions[1])
	return anchor && head ? { anchor, head } : null
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
	const decoded = new Map<
		string,
		{ signature: string; anchor: RelativePosition; head: RelativePosition }
	>()
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
			setTimeout(() => {
				liveCarets.get(userId)?.removeAttribute('data-active')
				idleTimers.delete(userId)
			}, idleMs),
		)
	}
	const forget = (userId: string) => {
		clearTimeout(idleTimers.get(userId))
		idleTimers.delete(userId)
		activeUntil.delete(userId)
		signatures.delete(userId)
		decoded.delete(userId)
		anchorNames.delete(userId)
		liveCarets.delete(userId)
	}
	const build = (
		view: EditorView,
		remoteChanges: readonly [number, number][] = [],
	): DecorationSet => {
		const state = view.state
		const cursors = getCursors()
		const present = new Set(cursors.map((cursor) => cursor.userId))
		for (const userId of decoded.keys()) if (!present.has(userId)) forget(userId)
		const sync = ySyncPluginKey.getState(state)
		const root = sync?.ytype
		if (!root?.doc) return DecorationSet.empty
		const doc = root.doc
		const renderer = sync.renderer ?? null
		// Upstream -12 can map a deleted containing node's ordinal onto its
		// replacement. Check reachability first, using exported Y node/item APIs.
		// Cache each parent's visible child set once per refresh (not per peer).
		// A renderer may intentionally keep deleted suggestion nodes visible.
		const visibleChildren = new Map<YNode, Set<YNode>>()
		const reachable = new Map<YNode, boolean>([[root, true]])
		const isReachable = (node: YNode): boolean => {
			const cached = reachable.get(node)
			if (cached !== undefined) return cached
			const parent = node.parent
			if (!parent || !isReachable(parent)) {
				reachable.set(node, false)
				return false
			}
			let children = visibleChildren.get(parent)
			if (!children) {
				children = new Set()
				for (const item of getNodeChildren(parent)) {
					if (
						item.content instanceof ContentType &&
						(renderer ? renderer.contentLength(item) > 0 : !item.deleted)
					)
						children.add(item.content.type)
				}
				visibleChildren.set(parent, children)
			}
			const visible = children.has(node)
			reachable.set(node, visible)
			return visible
		}
		const entries: {
			cursor: RemoteCursorEntry
			signature: string
			anchorIndex: number
			headIndex: number
		}[] = []
		const relative: RelativePosition[] = []
		// Collapsed selections and overlapping peers often have identical bytes.
		// Resolve each unique endpoint once, retaining per-peer DOM and activity.
		const endpointIndices = new Map<string, number | null>()
		const endpointIndex = (key: string, position: RelativePosition): number | null => {
			if (endpointIndices.has(key)) return endpointIndices.get(key) ?? null
			const node = createAbsolutePositionFromRelativePosition(position, doc, true, renderer)?.type
			const index = node && isReachable(node) ? relative.push(position) - 1 : null
			endpointIndices.set(key, index)
			return index
		}
		for (const cursor of cursors) {
			const signature = cursorSignature(cursor)
			try {
				let cached = decoded.get(cursor.userId)
				if (!cached || cached.signature !== signature) {
					cached = {
						signature,
						anchor: decodeRelativePosition(cursor.anchor),
						head: decodeRelativePosition(cursor.head),
					}
					decoded.set(cursor.userId, cached)
				}
				const [anchorKey, headKey] = signature.split('|')
				const anchorIndex = endpointIndex(anchorKey, cached.anchor)
				const headIndex = endpointIndex(headKey, cached.head)
				if (anchorIndex === null || headIndex === null) {
					forget(cursor.userId)
					continue
				}
				entries.push({ cursor, signature, anchorIndex, headIndex })
			} catch {
				// One malformed peer must not hide every other peer or abort dispatch.
				forget(cursor.userId)
			}
		}
		if (relative.length === 0) return DecorationSet.empty
		// One upstream Y resolution + transformer pass for all peers/endpoints.
		const positions = relativePositionsToResolvedPositions(view, relative)
		const decorations: Decoration[] = []
		for (const { cursor, signature, anchorIndex, headIndex } of entries) {
			const anchor = positions[anchorIndex]
			const head = positions[headIndex]
			if (!anchor || !head) continue
			const anchorPosition = anchor.pos
			const headPosition = head.pos
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
						key: `ui-solid-remote-caret-${JSON.stringify([cursor.userId, cursor.name])}`,
						ignoreSelection: true,
						/* Same-key widget swaps can destroy the OLD decoration after
						 * the replacement registered its element — only unregister
						 * when the node being destroyed is the one on record. */
						destroy: (node) => {
							if (liveCarets.get(cursor.userId) !== node) return
							liveCarets.delete(cursor.userId)
						},
					},
				),
			)
		}
		return DecorationSet.create(state.doc, decorations)
	}

	// Preserve the public PluginKey<DecorationSet> contract. Supplemental state
	// is keyed by immutable EditorState: speculative state.apply calls cannot
	// schedule work, alter activity timers, or contaminate the live view.
	type Pending = { revision: number; remoteChanges: [number, number][] }
	const pending = new WeakMap<EditorState, Pending>()
	const refreshKey = new PluginKey<DecorationSet>('ui-solid-remote-cursors-refresh')
	const initial: Pending = { revision: 0, remoteChanges: [] }
	return new Plugin({
		key: remoteCursorsKey,
		state: {
			init: () => DecorationSet.empty,
			apply(transaction, decorations, oldState, state) {
				const previous = pending.get(oldState) ?? initial
				const refreshed = transaction.getMeta(refreshKey) as DecorationSet | undefined
				if (refreshed) {
					pending.set(state, { revision: previous.revision, remoteChanges: [] })
					return refreshed
				}
				const changed =
					transaction.docChanged ||
					transaction.getMeta(remoteCursorsKey) === true ||
					transaction.getMeta(ySyncPluginKey) != null
				const remoteChanges: [number, number][] = previous.remoteChanges.map(([from, to]) => [
					transaction.mapping.map(from, -1),
					transaction.mapping.map(to, 1),
				])
				if (transaction.docChanged && transaction.getMeta('y-sync-transaction') != null) {
					transaction.mapping.maps.forEach((map, index) => {
						const rest = transaction.mapping.slice(index + 1)
						map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
							remoteChanges.push([rest.map(newStart, -1), rest.map(newEnd, 1)])
						})
					})
				}
				pending.set(state, { revision: previous.revision + Number(changed), remoteChanges })
				return decorations.map(transaction.mapping, transaction.doc)
			},
		},
		props: {
			decorations: (state) => remoteCursorsKey.getState(state),
		},
		view(view) {
			let destroyed = false
			let queued = false
			let renderedRevision = -1
			const schedule = () => {
				if (
					destroyed ||
					queued ||
					(pending.get(view.state) ?? initial).revision === renderedRevision
				)
					return
				queued = true
				queueMicrotask(() => {
					queued = false
					if (destroyed || view.isDestroyed) return
					const state = view.state
					const work = pending.get(state) ?? initial
					const decorations = build(view, work.remoteChanges)
					renderedRevision = work.revision
					// The binding can synchronously dispatch during view.update. Wait
					// until that stack settles, then map against the actual live view.
					// This dispatch does not change the document, selection, marks or undo.
					view.dispatch(
						state.tr
							.setMeta(refreshKey, decorations)
							.setMeta('addToHistory', false)
							.setStoredMarks(state.storedMarks),
					)
				})
			}
			schedule()
			return {
				update: schedule,
				destroy() {
					destroyed = true
					for (const timer of idleTimers.values()) clearTimeout(timer)
					idleTimers.clear()
					activeUntil.clear()
					signatures.clear()
					decoded.clear()
					anchorNames.clear()
					liveCarets.clear()
				},
			}
		},
	})
}
