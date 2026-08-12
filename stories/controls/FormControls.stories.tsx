/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Field, NumberInput, RangeInput, SelectControl, TextArea, TextInput } from '../../src'

const meta = {
	title: 'Atoms/Form controls',
	component: TextInput,
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

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
