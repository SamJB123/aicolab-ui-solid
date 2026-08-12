/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Segmented } from '../../src/controls'
import { ColorTreatmentStory } from '../primitives/color-treatment-story'

const TREATMENT_OPTIONS = [
	{ id: 'map', label: 'Map' },
	{ id: 'explore', label: 'Explore' },
] as const

function InteractiveTreatment(props: {
	colorBase?: Parameters<typeof Segmented>[0]['colorBase']
	colorLevel?: Parameters<typeof Segmented>[0]['colorLevel']
	variant?: Parameters<typeof Segmented>[0]['variant']
}) {
	const [value, setValue] = createSignal<'map' | 'explore'>('explore')
	return (
		<Segmented
			colorBase={props.colorBase}
			colorLevel={props.colorLevel}
			variant={props.variant}
			options={[...TREATMENT_OPTIONS]}
			value={value()}
			onChange={setValue}
		/>
	)
}

const meta = {
	title: 'Atoms/Segmented',
	component: Segmented,
	argTypes: {
		colorBase: { control: 'select', options: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] },
		colorLevel: { control: 'select', options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
		variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
	},
	args: {
		options: [
			{ id: 'day', label: 'Day' },
			{ id: 'week', label: 'Week' },
			{ id: 'month', label: 'Month' },
		],
		value: 'week',
		onChange: fn(),
	},
} satisfies Meta<typeof Segmented>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
	render: () => {
		const [view, setView] = createSignal<'day' | 'week' | 'month'>('week')
		return (
			<Segmented
				options={[
					{ id: 'day', label: 'Day' },
					{ id: 'week', label: 'Week' },
					{ id: 'month', label: 'Month' },
				]}
				value={view()}
				onChange={setView}
			/>
		)
	},
}

export const ManyOptions: Story = {
	name: 'Many options (scrolling strip)',
	render: () => {
		const [room, setRoom] = createSignal('studio-a')
		return (
			<div style={{ 'max-width': '360px' }}>
				<Segmented
					options={[
						{ id: 'studio-a', label: 'Studio A' },
						{ id: 'studio-b', label: 'Studio B' },
						{ id: 'workshop', label: 'Workshop' },
						{ id: 'gallery', label: 'Gallery' },
						{ id: 'commons', label: 'Commons' },
						{ id: 'rooftop', label: 'Rooftop' },
					]}
					value={room()}
					onChange={setRoom}
				/>
			</div>
		)
	},
}

export const ColorTreatment: Story = {
	args: {
		colorBase: 'primary',
		colorLevel: 500,
		variant: 'solid',
	},
	render: (args) => (
		<InteractiveTreatment
			colorBase={args.colorBase}
			colorLevel={args.colorLevel}
			variant={args.variant}
		/>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<InteractiveTreatment
					colorBase={colorBase}
					colorLevel={colorLevel}
					variant={variant}
				/>
			)}
		/>
	),
}
