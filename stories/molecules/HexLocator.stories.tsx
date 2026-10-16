/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { HexLocator } from '../../src/molecules/hex-locator'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const RING = [
	{ id: 'hive', label: 'Hive' },
	{ id: 'insights', label: 'Insights' },
	{ id: 'bridge', label: 'Insight Bridge' },
	{ id: 'alliance', label: 'Alliance' },
	{ id: 'events', label: 'Events' },
]

const meta = {
	title: 'Molecules/HexLocator',
	component: HexLocator,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		size: { control: 'text', table: { category: 'knobs' } },
	},
	args: {
		label: 'Where you are',
		centre: { id: 'hub', label: 'Hub' },
		ring: RING,
		onPick: () => undefined,
	},
} satisfies Meta<typeof HexLocator>

export default meta
type Story = StoryObj<typeof meta>

/* The full anatomy: the place in the middle, five of the six around it
   (a ring need not be full), every cell a button. */
export const Playground: Story = {
	args: { size: '208px' },
	render: (args) => {
		const [picked, setPicked] = createSignal<string | null>(null)
		return (
			<div style={{ display: 'grid', 'justify-items': 'center', gap: '12px' }}>
				<HexLocator {...args} onPick={setPicked} />
				<span style={{ 'font-size': 'var(--t-sm)', color: 'var(--color-base-content-muted)' }}>
					{picked() ? `Picked ${picked()}` : 'Pick a cell'}
				</span>
			</div>
		)
	},
}

export const Treated: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '24px' }}>
			<HexLocator label="Where you are" centre={{ id: 'hub', label: 'Hub' }} ring={RING} onPick={() => undefined} />
			<HexLocator
				label="Where you are"
				centre={{ id: 'hub', label: 'Hub' }}
				ring={RING}
				onPick={() => undefined}
				colorBase="secondary"
			/>
		</div>
	),
}
