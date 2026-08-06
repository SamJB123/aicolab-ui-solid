/** @jsxImportSource @solidjs/web */
import { createSignal, onSettled } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Waveform } from '../../src/primitives'

const BARS = [0.2, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 1, 0.5, 0.35, 0.65, 0.85, 0.45, 0.25]

const meta = {
	title: 'Primitives/Waveform',
	component: Waveform,
	args: { bars: BARS },
} satisfies Meta<typeof Waveform>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { bars: BARS },
}

export const LiveColour: Story = {
	args: { bars: BARS, color: 'var(--c-live)' },
}

export const Animated: Story = {
	name: 'Animated (simulated audio)',
	render: () => {
		const [bars, setBars] = createSignal(BARS)
		onSettled(() => {
			const id = setInterval(() => {
				setBars((prev) => prev.map(() => 0.15 + Math.random() * 0.85))
			}, 240)
			return () => clearInterval(id)
		})
		return <Waveform bars={bars()} />
	},
}
