/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Field } from '../../src/atoms/field'
import { Combobox } from '../../src/molecules/combobox'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const models = [
	{ id: 'house-04', name: 'SM_House_04', catalogue: 'Pixel3D-Town', category: 'Houses' },
	{ id: 'tree-01', name: 'SM_Tree_01', catalogue: 'Pixel3D-Grasslands', category: 'Trees' },
	{ id: 'tree-02', name: 'SM_DeadTree_02', catalogue: 'Pixel3D-Frostlands', category: 'Trees' },
	{ id: 'chair-01', name: 'SM_Chair_01', catalogue: 'Pixel3D-Town', category: 'Furniture' },
]

const meta = {
	title: 'Molecules/Combobox',
	component: Combobox,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		/* Composed-TextInput knobs, drilled through under their own names. */
		radius: { control: 'text', table: { category: 'knobs (input)' } },
		minHeight: { control: 'text', table: { category: 'knobs (input)' } },
		padBlock: { control: 'text', table: { category: 'knobs (input)' } },
		padInline: { control: 'text', table: { category: 'knobs (input)' } },
		hoverBorder: { control: 'text', table: { category: 'knobs (input)' } },
		focusBorder: { control: 'text', table: { category: 'knobs (input)' } },
		focusRing: { control: 'text', table: { category: 'knobs (input)' } },
		placeholderInk: { control: 'text', table: { category: 'knobs (input)' } },
		selectionSurface: { control: 'text', table: { category: 'knobs (input)' } },
		selectionInk: { control: 'text', table: { category: 'knobs (input)' } },
		caret: { control: 'text', table: { category: 'knobs (input)' } },
		/* Pop/list knobs. */
		listMaxHeight: { control: 'text', table: { category: 'knobs (list)' } },
		gap: { control: 'text', table: { category: 'knobs (list)' } },
		optionRadius: { control: 'text', table: { category: 'knobs (list)' } },
		optionPadBlock: { control: 'text', table: { category: 'knobs (list)' } },
		optionPadInline: { control: 'text', table: { category: 'knobs (list)' } },
		activeSurface: { control: 'text', table: { category: 'knobs (list)' } },
		activeInk: { control: 'text', table: { category: 'knobs (list)' } },
		selectedSurface: { control: 'text', table: { category: 'knobs (list)' } },
		selectedInk: { control: 'text', table: { category: 'knobs (list)' } },
	},
} satisfies Meta<typeof Combobox<(typeof models)[number]>>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		items: models,
		onChange: () => undefined,
		getKey: (model) => (model as (typeof models)[number]).id,
		getLabel: (model) => (model as (typeof models)[number]).name,
		label: 'Find a model',
	},
	render: (args) => {
		const [selected, setSelected] = createSignal('')
		return (
			<div style={{ width: 'min(28rem, 80vw)', 'min-height': '22rem' }}>
				<Combobox
					{...args}
					items={models}
					value={selected()}
					onChange={(value) => setSelected(value)}
					getKey={(model) => model.id}
					getLabel={(model) => model.name}
					getDescription={(model) => `${model.catalogue} / ${model.category}`}
					getSearchText={(model) => `${model.catalogue} ${model.category} ${model.name}`}
					label="Find a model"
					placeholder="Building, tree, furniture…"
				/>
			</div>
		)
	},
}

export const Interactive: Story = {
	args: {
		items: models,
		onChange: () => undefined,
		getKey: (model) => (model as (typeof models)[number]).id,
		getLabel: (model) => (model as (typeof models)[number]).name,
		label: 'Find a model',
	},
	render: () => {
		const [selected, setSelected] = createSignal('')
		return (
			<div style={{ width: 'min(28rem, 80vw)', 'min-height': '22rem' }}>
				<Field label="Find a model">
					<Combobox
						items={models}
						value={selected()}
						onChange={(value) => setSelected(value)}
						getKey={(model) => model.id}
						getLabel={(model) => model.name}
						getDescription={(model) => `${model.catalogue} / ${model.category}`}
						getSearchText={(model) =>
							`${model.catalogue} ${model.category} ${model.name}`
						}
						label="Find a model"
						placeholder="Building, tree, furniture…"
					/>
				</Field>
			</div>
		)
	},
}
