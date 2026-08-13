/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { TimePicker } from '../../src/pickers'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/Pickers/TimePicker',
	component: TimePicker,
	args: { value: 9 * 60 + 30, onChange: fn() },
	argTypes: {
		...treatmentArgTypes,
		wheelHeight: { control: 'text', table: { category: 'knobs' } },
		itemHeight: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => {
		const [value, setValue] = createSignal(9 * 60 + 30)
		return <TimePicker {...args} value={value()} onChange={setValue} />
	},
}

export const Interactive: Story = {
	name: 'Interactive (wheels + presets)',
	render: () => {
		const [minutes, setMinutes] = createSignal(9 * 60 + 30)
		return <TimePicker value={minutes()} onChange={setMinutes} />
	},
}

export const Afternoon: Story = {
	render: () => {
		const [minutes, setMinutes] = createSignal(16 * 60 + 45)
		return <TimePicker value={minutes()} onChange={setMinutes} />
	},
}
