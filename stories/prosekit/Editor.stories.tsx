/** @jsxImportSource @solidjs/web */
import '../../src/prosekit-solid/styles.css'

import {
	createEditor,
	defineBaseCommands,
	defineBaseKeymap,
	definePlugin,
	defineUpdateHandler,
	union,
} from '@prosekit/core'
import { defineBold } from '@prosekit/extensions/bold'
import { defineDoc } from '@prosekit/extensions/doc'
import { defineHeading } from '@prosekit/extensions/heading'
import { defineItalic } from '@prosekit/extensions/italic'
import { defineList } from '@prosekit/extensions/list'
import { defineParagraph } from '@prosekit/extensions/paragraph'
import { defineText } from '@prosekit/extensions/text'
import { configureYProsemirror, defaultMapAttributionToMark, syncPlugin } from '@y/prosemirror'
import { createRelativePositionFromTypeIndex, Doc, encodeRelativePosition, Type } from '@y/y'
import { onSettled } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Presence } from '../../src'
import {
	createEditorUi,
	createEditorUpdateSource,
	defineToolbarContribution,
	EditorToolbar,
	remoteCursorsKey,
	remoteCursorsPlugin,
	type RemoteCursorEntry,
	type ToolbarContribution,
} from '../../src/prosekit-solid'

const meta = {
	title: 'ProseKit/Editor',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Local-only editor exercising the package's toolbar system. */
function LocalEditor() {
	const updates = createEditorUpdateSource()
	let mounted = false
	let host!: HTMLDivElement

	const editor = createEditor({
		extension: union(
			defineDoc(),
			defineText(),
			defineParagraph(),
			defineHeading(),
			defineBold(),
			defineItalic(),
			defineList(),
			defineBaseKeymap(),
			defineBaseCommands(),
			defineUpdateHandler(() => updates.notify()),
		),
	})

	const heading = (level: 1 | 2): ToolbarContribution =>
		defineToolbarContribution(
			{
				id: `heading-${level}`,
				label: `H${level}`,
				title: `Heading ${level}`,
				run: () => editor.commands.toggleHeading({ level }),
			},
			() => ({ active: editor.nodes.heading.isActive({ level }), disabled: false }),
		)

	const toolbar = [
		defineToolbarContribution(
			{
				id: 'bold',
				label: 'B',
				title: 'Bold (⌘B)',
				run: () => editor.commands.toggleBold(),
				style: { 'font-weight': 700 },
			},
			() => ({ active: editor.marks.bold.isActive(), disabled: false }),
		),
		defineToolbarContribution(
			{
				id: 'italic',
				label: 'I',
				title: 'Italic (⌘I)',
				run: () => editor.commands.toggleItalic(),
				style: { 'font-style': 'italic' },
			},
			() => ({ active: editor.marks.italic.isActive(), disabled: false }),
		),
		heading(1),
		heading(2),
		defineToolbarContribution(
			{
				id: 'bullet-list',
				label: '•',
				title: 'Bullet list',
				run: () => editor.commands.toggleList({ kind: 'bullet' }),
			},
			() => ({ active: editor.nodes.list.isActive({ kind: 'bullet' }), disabled: false }),
		),
	] satisfies readonly ToolbarContribution[]

	const ui = createEditorUi({
		updates,
		toolbar,
		isMounted: () => mounted,
		canUndo: () => false,
		canRedo: () => false,
	})

	onSettled(() => {
		editor.mount(host)
		mounted = true
		updates.notify()
		return () => {
			mounted = false
			editor.mount(null)
		}
	})

	return (
		<div class="aic-prosekit" style={{ width: 'min(44rem, 90vw)' }}>
			<EditorToolbar items={ui().toolbar} />
			<div class="aic-prosekit-editor" ref={host} />
		</div>
	)
}

const SEED = 'Collaborative drafting happens here. Watch the remote carets as a peer types in bursts and idles between them. '

/** Y-bound editor with two SIMULATED collaborators: Ada is parked (her label
 * collapses and only shows on hover in auto mode); Grace types in bursts,
 * expanding her label while active and collapsing ~1.6s after each burst. */
function CollabEditor(props: { labels: 'auto' | 'always' }) {
	let host!: HTMLDivElement
	const doc = new Doc()
	const ytype = doc.get('')
	const cursors: RemoteCursorEntry[] = []

	const editor = createEditor({
		extension: union(
			defineDoc(),
			defineText(),
			defineParagraph(),
			defineHeading(),
			defineBold(),
			defineItalic(),
			defineBaseKeymap(),
			defineBaseCommands(),
			definePlugin(syncPlugin({ mapAttributionToMark: defaultMapAttributionToMark })),
			definePlugin(remoteCursorsPlugin(() => cursors, { labels: props.labels })),
		),
	})

	const relAt = (type: Type, index: number): Uint8Array =>
		encodeRelativePosition(createRelativePositionFromTypeIndex(type, index, 0))

	onSettled(() => {
		editor.mount(host)
		const view = editor.view
		if (!view) return
		configureYProsemirror({ ytype })(view.state, view.dispatch)
		view.dispatch(view.state.tr.insertText(SEED, 1))
		const child = ytype.get(0)
		if (!(child instanceof Type)) return
		const paragraph = child
		const poke = () => view.dispatch(view.state.tr.setMeta(remoteCursorsKey, true))

		cursors.push({
			userId: 'peer-ada',
			name: 'Ada Lovelace',
			anchor: relAt(paragraph, 14),
			head: relAt(paragraph, 14),
		})
		cursors.push({
			userId: 'peer-grace',
			name: 'Grace Hopper',
			anchor: relAt(paragraph, 40),
			head: relAt(paragraph, 40),
		})
		poke()

		/* Grace's life: 6 ticks typing (label expands, stays), 6 ticks idle
		 * (label collapses ~1.6s in), repeat. Ada never acts. */
		const letters = 'collab'
		let graceAt = 40
		let step = 0
		const interval = setInterval(() => {
			const cycle = step % 12
			step += 1
			if (cycle >= 6) return
			const letter = cycle === 5 ? ' ' : letters[cycle % letters.length]
			paragraph.insert(graceAt, letter)
			graceAt += 1
			cursors[1] = {
				userId: 'peer-grace',
				name: 'Grace Hopper',
				anchor: relAt(paragraph, graceAt),
				head: relAt(paragraph, graceAt),
			}
			poke()
		}, 800)

		return () => {
			clearInterval(interval)
			editor.mount(null)
		}
	})

	return (
		<Presence>
			<div class="aic-prosekit" style={{ width: 'min(44rem, 90vw)' }}>
				<div class="aic-prosekit-editor" ref={host} />
			</div>
		</Presence>
	)
}

export const Toolbar: Story = {
	render: () => <LocalEditor />,
}

export const RemoteCursors: Story = {
	name: 'Remote cursors (auto labels)',
	render: () => <CollabEditor labels="auto" />,
}

export const RemoteCursorsAlways: Story = {
	name: 'Remote cursors (always-visible labels)',
	render: () => <CollabEditor labels="always" />,
}
