/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Segmented } from '../../src/controls'

const meta = {
	title: 'Controls/Segmented',
	component: Segmented,
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
