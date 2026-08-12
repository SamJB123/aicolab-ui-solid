/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Avatar } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Primitives/Avatar',
	component: Avatar,
	args: { name: 'Ada Lovelace', faceColor: 'var(--c-accent)' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { name: 'Ada Lovelace', faceColor: 'var(--c-accent)' },
}

export const WithStatus: Story = {
	args: {
		name: 'Grace Hopper',
		faceColor: '#5aa179',
		status: { color: 'var(--c-live)', live: true },
	},
}

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
			<Avatar name="Ada Lovelace" faceColor="var(--c-accent)" size={24} />
			<Avatar name="Ada Lovelace" faceColor="var(--c-accent)" size={36} />
			<Avatar
				name="Ada Lovelace"
				faceColor="var(--c-accent)"
				size={48}
				status={{ color: 'var(--c-live)', live: true }}
			/>
			<Avatar name="Ada Lovelace" faceColor="var(--c-accent)" size={64} />
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
				faceColor="#b46a55"
				ring="var(--c-panel)"
				status={{ color: 'var(--c-live)', live: true }}
			/>
			<Avatar name="Mary Jackson" faceColor="var(--c-accent)" ring="var(--c-panel)" />
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × appearance',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, appearance }) => (
		<Avatar colorBase={colorBase} colorLevel={colorLevel} appearance={appearance} name="Ada Lovelace" faceColor="#888" status={{ color: '#888', live: true }} />
	)} />,
}
