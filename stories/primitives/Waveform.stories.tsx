/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import { createSignal, onSettled } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Waveform } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const BARS = [0.2, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 1, 0.5, 0.35, 0.65, 0.85, 0.45, 0.25]

function AnimatedAxesWaveforms() {
	const [bars, setBars] = createSignal(BARS)
	onSettled(() => {
		const id = setInterval(() => {
			setBars((prev) => prev.map(() => 0.15 + Math.random() * 0.85))
		}, 240)
		return () => clearInterval(id)
	})

	return (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<Waveform colorBase={colorBase} colorLevel={colorLevel} variant={variant} bars={bars()} />
			)}
		/>
	)
}

const meta = {
	title: 'Atoms/Waveform',
	component: Waveform,
	argTypes: {
		...treatmentArgTypes,
		ink: { control: 'text', table: { category: 'knobs' } },
	},
	args: { bars: BARS },
} satisfies Meta<typeof Waveform>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		bars: [0.2, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.7, 0.5, 0.8],
	},
}

export const Default: Story = {
	args: { bars: BARS },
}

export const LiveColour: Story = {
	args: { bars: BARS, barColor: 'var(--color-success)' },
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

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <AnimatedAxesWaveforms />,
}
