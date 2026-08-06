/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Eyebrow, Meter } from '../../src/primitives'

const meta = {
	title: 'Primitives/Meter',
	component: Meter,
	args: { value: 62, max: 100 },
} satisfies Meta<typeof Meter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { value: 62, max: 100 },
}

export const AccentFill: Story = {
	args: { value: 87, max: 100, color: 'var(--c-accent)' },
}

export const Levels: Story = {
	render: () => (
		<div style={{ display: 'grid', gap: '12px', 'max-width': '360px' }}>
			<Eyebrow>Room occupancy</Eyebrow>
			<Meter value={12} max={100} />
			<Meter value={45} max={100} color="var(--c-live)" />
			<Meter value={87} max={100} color="var(--c-accent)" />
			<Meter value={140} max={100} color="var(--c-accent)" />
		</div>
	),
}
