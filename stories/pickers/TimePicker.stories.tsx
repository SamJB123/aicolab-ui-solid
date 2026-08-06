/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { TimePicker } from '../../src/pickers'

const meta = {
	title: 'Pickers/TimePicker',
	component: TimePicker,
	args: { value: 9 * 60 + 30, onChange: fn() },
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

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
