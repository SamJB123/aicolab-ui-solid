/** @jsxImportSource @solidjs/web */
import { createSignal, For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { RichList, RichListItem, RichListMetadata } from '../../src/molecules/rich-list'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const DOCUMENTS = [
	{ id: 'charter', glyph: '§', title: 'Collective charter', description: 'Founding rules and amendment process', when: '2d ago' },
	{ id: 'season', glyph: '◫', title: 'Season 4 program', description: 'Voted slate with schedule', when: '6h ago' },
	{ id: 'budget', glyph: '¤', title: 'Budget worksheet', description: 'Member dues and venue costs', when: 'now' },
	{ id: 'minutes', glyph: '✎', title: 'Meeting minutes', description: 'Raw notes, unreviewed', when: '1w ago', muted: true },
]

const meta = {
	title: 'Molecules/RichList',
	component: RichList,
	argTypes: {
		...treatmentArgTypes,
		navigation: { control: 'boolean' },
		rowRadius: { control: 'text', table: { category: 'knobs' } },
		rowPadBlock: { control: 'text', table: { category: 'knobs' } },
		rowPadInline: { control: 'text', table: { category: 'knobs' } },
		rowGap: { control: 'text', table: { category: 'knobs' } },
		titleSize: { control: 'text', table: { category: 'knobs' } },
		titleInk: { control: 'text', table: { category: 'knobs' } },
		descriptionSize: { control: 'text', table: { category: 'knobs' } },
		descriptionInk: { control: 'text', table: { category: 'knobs' } },
		trailingInk: { control: 'text', table: { category: 'knobs' } },
		leadingInk: { control: 'text', table: { category: 'knobs' } },
		metadataPrimaryInk: { control: 'text', table: { category: 'knobs' } },
		metadataSecondaryInk: { control: 'text', table: { category: 'knobs' } },
		divider: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof RichList>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => {
		const [selected, setSelected] = createSignal('season')
		return (
			<div style={{ width: 'min(26rem, 90vw)' }}>
				<RichList {...args} label="Documents">
					<For each={DOCUMENTS}>
						{(doc) => (
							<RichListItem
								leading={<span aria-hidden="true">{doc.glyph}</span>}
								title={doc.title}
								description={doc.description}
								trailing={<RichListMetadata primary={doc.when} />}
								muted={doc.muted}
								selected={selected() === doc.id}
								onSelect={() => setSelected(doc.id)}
							/>
						)}
					</For>
				</RichList>
			</div>
		)
	},
}

export const Navigation: Story = {
	name: 'Navigation (shared sliding surface)',
	render: (args) => {
		const [selected, setSelected] = createSignal('season')
		return (
			<div style={{ width: 'min(18rem, 90vw)' }}>
				<RichList {...args} label="Sections" navigation>
					<For each={DOCUMENTS}>
						{(doc) => (
							<RichListItem
								title={doc.title}
								selected={selected() === doc.id}
								onSelect={() => setSelected(doc.id)}
							/>
						)}
					</For>
				</RichList>
			</div>
		)
	},
}

export const ItemOverride: Story = {
	name: 'Per-item treatment override',
	render: () => {
		const [selected, setSelected] = createSignal('budget')
		return (
			<div style={{ width: 'min(26rem, 90vw)' }}>
				<RichList label="Documents" colorBase="info">
					<For each={DOCUMENTS.slice(0, 3)}>
						{(doc, i) => (
							<RichListItem
								leading={<span aria-hidden="true">{doc.glyph}</span>}
								title={doc.title}
								description={i() === 2 ? 'This row overrides the collection with warning' : doc.description}
								colorBase={i() === 2 ? 'warning' : undefined}
								selected={selected() === doc.id}
								onSelect={() => setSelected(doc.id)}
							/>
						)}
					</For>
				</RichList>
			</div>
		)
	},
}
