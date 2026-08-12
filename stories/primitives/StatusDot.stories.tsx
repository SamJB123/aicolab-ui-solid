/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { StatusDot } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/StatusDot',
	component: StatusDot,
	args: { status: { color: 'var(--color-primary)' } },
} satisfies Meta<typeof StatusDot>

export default meta
type Story = StoryObj<typeof meta>

export const Static: Story = {
	args: { status: { color: 'var(--color-primary)' } },
}

export const Live: Story = {
	name: 'Live (ping)',
	args: { status: { color: 'var(--color-success)', live: true } },
}

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
			<StatusDot status={{ color: 'var(--color-success)', live: true }} size={6} />
			<StatusDot status={{ color: 'var(--color-success)', live: true }} size={8} />
			<StatusDot status={{ color: 'var(--color-primary)' }} size={12} />
			<StatusDot status={{ color: 'var(--color-base-content-faint)' }} size={16} />
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => <StatusDot colorBase={colorBase} colorLevel={colorLevel} variant={variant} status={{ color: 'var(--color-success)', live: true }} size={12} />} />,
}
