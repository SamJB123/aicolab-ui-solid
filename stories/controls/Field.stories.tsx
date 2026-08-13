/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from '../primitives/color-treatment-story'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Field, Segmented } from '../../src/controls'
import { Button, TextInput } from '../../src/primitives'

const meta = {
	title: 'Atoms/Field',
	component: Field,
	argTypes: {
		...treatmentArgTypes,
		gap: { control: 'text', table: { category: 'knobs' } },
		labelInk: { control: 'text', table: { category: 'knobs' } },
		labelFontSize: { control: 'text', table: { category: 'knobs' } },
	},
	args: { label: 'Room' },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		label: 'Workspace',
		gap: '6px',
	},
	render: (args) => (
		<div style={{ width: '18rem' }}>
			<Field {...args}>
				<TextInput placeholder="Name this workspace…" />
			</Field>
		</div>
	),
}

export const WithButton: Story = {
	args: { label: 'Room', children: 'Studio A' },
}

export const FormRow: Story = {
	name: 'Composed form row',
	render: () => {
		const [scope, setScope] = createSignal<'mine' | 'all'>('mine')
		return (
			<div style={{ display: 'flex', gap: '20px', 'align-items': 'end' }}>
				<Field label="Sessions">
					<Segmented
						options={[
							{ id: 'mine', label: 'Mine' },
							{ id: 'all', label: 'Everyone' },
						]}
						value={scope()}
						onChange={setScope}
					/>
				</Field>
				<Field label="Actions">
					<Button variant="solid">Apply</Button>
				</Field>
			</div>
		)
	},
}
