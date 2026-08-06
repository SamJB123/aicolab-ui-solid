/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { StatusDot } from '../../src/primitives'

const meta = {
	title: 'Primitives/StatusDot',
	component: StatusDot,
	args: { status: { color: 'var(--c-accent)' } },
} satisfies Meta<typeof StatusDot>

export default meta
type Story = StoryObj<typeof meta>

export const Static: Story = {
	args: { status: { color: 'var(--c-accent)' } },
}

export const Live: Story = {
	name: 'Live (ping)',
	args: { status: { color: 'var(--c-live)', live: true } },
}

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
			<StatusDot status={{ color: 'var(--c-live)', live: true }} size={6} />
			<StatusDot status={{ color: 'var(--c-live)', live: true }} size={8} />
			<StatusDot status={{ color: 'var(--c-accent)' }} size={12} />
			<StatusDot status={{ color: 'var(--c-faint)' }} size={16} />
		</div>
	),
}
