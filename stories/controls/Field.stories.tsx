/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Field, Segmented } from '../../src/controls'
import { Button } from '../../src/primitives'

const meta = {
	title: 'Atoms/Field',
	component: Field,
	args: { label: 'Room' },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

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
