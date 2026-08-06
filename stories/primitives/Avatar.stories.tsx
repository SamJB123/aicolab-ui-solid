/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Avatar } from '../../src/primitives'

const meta = {
	title: 'Primitives/Avatar',
	component: Avatar,
	args: { name: 'Ada Lovelace', color: 'var(--c-accent)' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { name: 'Ada Lovelace', color: 'var(--c-accent)' },
}

export const WithStatus: Story = {
	args: {
		name: 'Grace Hopper',
		color: '#5aa179',
		status: { color: 'var(--c-live)', live: true },
	},
}

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
			<Avatar name="Ada Lovelace" color="var(--c-accent)" size={24} />
			<Avatar name="Ada Lovelace" color="var(--c-accent)" size={36} />
			<Avatar
				name="Ada Lovelace"
				color="var(--c-accent)"
				size={48}
				status={{ color: 'var(--c-live)', live: true }}
			/>
			<Avatar name="Ada Lovelace" color="var(--c-accent)" size={64} />
		</div>
	),
}

export const OnPanelSurface: Story = {
	name: 'On a panel surface (ring)',
	render: () => (
		<div
			style={{
				background: 'var(--c-panel)',
				padding: '20px',
				'border-radius': '12px',
				'box-shadow': 'inset 0 0 0 1px var(--c-line)',
				display: 'inline-flex',
				gap: '12px',
			}}
		>
			<Avatar
				name="Joan Clarke"
				color="#b46a55"
				ring="var(--c-panel)"
				status={{ color: 'var(--c-live)', live: true }}
			/>
			<Avatar name="Mary Jackson" color="var(--c-accent)" ring="var(--c-panel)" />
		</div>
	),
}
