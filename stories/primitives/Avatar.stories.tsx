/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Avatar } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Avatar',
	component: Avatar,
	args: { name: 'Ada Lovelace', faceColor: 'var(--color-primary)' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { name: 'Ada Lovelace', faceColor: 'var(--color-primary)' },
}

export const WithStatus: Story = {
	args: {
		name: 'Grace Hopper',
		faceColor: '#5aa179',
		status: { color: 'var(--color-success)', live: true },
	},
}

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
			<Avatar name="Ada Lovelace" faceColor="var(--color-primary)" size={24} />
			<Avatar name="Ada Lovelace" faceColor="var(--color-primary)" size={36} />
			<Avatar
				name="Ada Lovelace"
				faceColor="var(--color-primary)"
				size={48}
				status={{ color: 'var(--color-success)', live: true }}
			/>
			<Avatar name="Ada Lovelace" faceColor="var(--color-primary)" size={64} />
		</div>
	),
}

export const OnPanelSurface: Story = {
	name: 'On a panel surface (ring)',
	render: () => (
		<div
			style={{
				background: 'var(--color-base-100)',
				padding: '20px',
				'border-radius': '12px',
				'box-shadow': 'inset 0 0 0 1px var(--color-border)',
				display: 'inline-flex',
				gap: '12px',
			}}
		>
			<Avatar
				name="Joan Clarke"
				faceColor="#b46a55"
				ring="var(--color-base-100)"
				status={{ color: 'var(--color-success)', live: true }}
			/>
			<Avatar name="Mary Jackson" faceColor="var(--color-primary)" ring="var(--color-base-100)" />
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => (
		<Avatar colorBase={colorBase} colorLevel={colorLevel} variant={variant} name="Ada Lovelace" faceColor="#888" status={{ color: '#888', live: true }} />
	)} />,
}
