/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ToggleGroup } from '../../src/molecules/toggle-group'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/ToggleGroup',
	component: ToggleGroup,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		traySurface: { control: 'text', table: { category: 'knobs' } },
		trayBorder: { control: 'text', table: { category: 'knobs' } },
		trayRadius: { control: 'text', table: { category: 'knobs' } },
		trayPad: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		label: 'Editor mode',
		options: [
			{ id: 'select', label: 'select' },
			{ id: 'draw', label: 'draw' },
			{ id: 'erase', label: 'erase' },
			{ id: 'measure', label: 'measure', disabled: true },
		],
		value: 'select',
		onChange: () => undefined,
	},
	render: (args) => {
		const [value, setValue] = createSignal('select')
		return (
			<div style={{ width: 'min(22rem, 90vw)' }}>
				<ToggleGroup
					{...args}
					options={[
						{ id: 'select', label: 'select' },
						{ id: 'draw', label: 'draw' },
						{ id: 'erase', label: 'erase' },
						{ id: 'measure', label: 'measure', disabled: true },
					]}
					value={value()}
					onChange={setValue}
				/>
			</div>
		)
	},
}
