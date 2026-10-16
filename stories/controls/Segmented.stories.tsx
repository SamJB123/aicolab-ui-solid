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
		radius: { control: 'text', table: { category: 'knobs' } },
		trackPad: { control: 'text', table: { category: 'knobs' } },
		tabPadBlock: { control: 'text', table: { category: 'knobs' } },
		tabPadInline: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		fontSize: { control: 'text', table: { category: 'knobs' } },
		trackSurface: { control: 'text', table: { category: 'knobs' } },
		activeSurface: { control: 'text', table: { category: 'knobs' } },
		activeInk: { control: 'text', table: { category: 'knobs' } },
		inactiveInk: { control: 'text', table: { category: 'knobs' } },
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

export const Playground: Story = {
	args: {
		label: 'Playground tabs',
		options: [
			{ id: 'day', label: 'Day' },
			{ id: 'week', label: 'Week' },
			{ id: 'month', label: 'Month' },
		],
		value: 'week',
		radius: 'var(--r-pill)',
		trackPad: '4px',
		fontSize: 'var(--t-sm)',
	},
}

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

/* Stood on end with icons alone, the label each tab's name: the face
   switch of a rail too narrow for words. */
export const VerticalIcons: Story = {
	name: 'Vertical, icons only',
	render: () => {
		const [face, setFace] = createSignal<'map' | 'page' | 'world'>('map')
		const icon = (paths: string) => () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" innerHTML={paths} />
		return (
			<div style={{ display: 'flex', gap: '24px', 'align-items': 'flex-start' }}>
				<Segmented
					label="On the stage"
					orientation="vertical"
					iconsOnly
					options={[
						{ id: 'map', label: 'Map', icon: icon('<path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z"/><circle cx="12" cy="12" r="2.2"/>') },
						{ id: 'page', label: 'Page', icon: icon('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>') },
						{ id: 'world', label: 'World', icon: icon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>') },
					]}
					value={face()}
					onChange={setFace}
				/>
				<Segmented
					label="On the stage"
					orientation="vertical"
					options={[
						{ id: 'map', label: 'Map' },
						{ id: 'page', label: 'Page' },
						{ id: 'world', label: 'World' },
					]}
					value={face()}
					onChange={setFace}
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
