/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Eyebrow, Meter } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Meter',
	component: Meter,
	args: { value: 62, max: 100 },
} satisfies Meta<typeof Meter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { value: 62, max: 100 },
}

export const AccentFill: Story = {
	args: { value: 87, max: 100, fillColor: 'var(--color-primary)' },
}

export const Levels: Story = {
	render: () => (
		<div style={{ display: 'grid', gap: '12px', 'max-width': '360px' }}>
			<Eyebrow>Room occupancy</Eyebrow>
			<Meter value={12} max={100} />
			<Meter value={45} max={100} fillColor="var(--color-success)" />
			<Meter value={87} max={100} fillColor="var(--color-primary)" />
			<Meter value={140} max={100} fillColor="var(--color-primary)" />
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => (
		<div style={{ width: '120px' }}><Meter colorBase={colorBase} colorLevel={colorLevel} variant={variant} value={68} max={100} /></div>
	)} />,
}
