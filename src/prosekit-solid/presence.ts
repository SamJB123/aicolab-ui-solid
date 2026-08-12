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

const caretDom = (entry: RemoteCursorEntry): HTMLElement => {
	const caret = document.createElement('span')
	caret.className = 'aic-prosekit-remote-caret'
	caret.style.setProperty('--ui-presence-color', presenceColor(entry.userId))
	const label = document.createElement('span')
	label.className = 'aic-prosekit-remote-caret-label'
	label.textContent = entry.name
	caret.appendChild(label)
	return caret
}

export function remoteCursorsPlugin(getCursors: () => RemoteCursorEntry[]): Plugin {
	const build = (state: EditorState, oldState?: EditorState): DecorationSet => {
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
			decorations.push(
				Decoration.widget(headPosition, () => caretDom(cursor), {
					key: `ui-solid-remote-caret-${cursor.userId}`,
					ignoreSelection: true,
				}),
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
					return build(state, oldState)
				}
				return decorations.map(transaction.mapping, transaction.doc)
			},
		},
		props: {
			decorations: (state) => remoteCursorsKey.getState(state),
		},
	})
}
