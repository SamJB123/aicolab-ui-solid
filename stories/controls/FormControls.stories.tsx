/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Field, NumberInput, RangeInput, SelectControl, TextArea, TextInput } from '../../src'

const meta = {
	title: 'Atoms/Form controls',
	component: TextInput,
	argTypes: {
		colorBase: {
			control: 'select',
			options: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		},
		colorLevel: { control: 'select', options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
		variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
		radius: { control: 'text', table: { category: 'knobs' } },
		minHeight: { control: 'text', table: { category: 'knobs' } },
		padBlock: { control: 'text', table: { category: 'knobs' } },
		padInline: { control: 'text', table: { category: 'knobs' } },
		hoverBorder: { control: 'text', table: { category: 'knobs' } },
		focusRing: { control: 'text', table: { category: 'knobs' } },
		placeholderInk: { control: 'text', table: { category: 'knobs' } },
		selectionSurface: { control: 'text', table: { category: 'knobs' } },
		selectionInk: { control: 'text', table: { category: 'knobs' } },
		caret: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		placeholder: 'Type to try the knobs…',
		radius: 'var(--r-xs)',
		minHeight: '2.25rem',
		padBlock: '0.45rem',
		padInline: '0.55rem',
		placeholderInk: 'var(--color-base-content-faint)',
	},
}

export const AllControls: Story = {
	render: () => (
		<form style={{ display: 'grid', gap: '1rem', width: 'min(28rem, 90vw)' }} onSubmit={(event) => event.preventDefault()}>
			<Field label="Title"><TextInput value="Collective intelligence" /></Field>
			<Field label="Capacity"><NumberInput value="24" min="1" /></Field>
			<Field label="Energy"><RangeInput value="68" aria-label="Energy" /></Field>
			<Field label="Room">
				<SelectControl value="commons">
					<option value="commons">Commons</option>
					<option value="studio">Studio A</option>
				</SelectControl>
			</Field>
			<Field label="Notes"><TextArea>Bring materials to share.</TextArea></Field>
		</form>
	),
}

export const Disabled: Story = {
	render: () => <Field label="Unavailable"><TextInput value="Read only" disabled /></Field>,
}
