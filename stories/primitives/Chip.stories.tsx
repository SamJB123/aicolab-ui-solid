/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Chip } from '../../src/primitives'
import { ColorAxesStory } from './color-axes-story'

const meta = {
	title: 'Primitives/Chip',
	component: Chip,
	argTypes: {
		tone: { control: 'radio', options: ['plain', 'accent', 'live'] },
	},
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {
	args: { children: 'workshop' },
}

export const Accent: Story = {
	args: { tone: 'accent', children: 'featured' },
}

export const Live: Story = {
	args: { tone: 'live', children: 'live now' },
}

export const AllTones: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px' }}>
			<Chip>plain</Chip>
			<Chip tone="accent">accent</Chip>
			<Chip tone="live">live</Chip>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Family × level × usage',
	render: () => <ColorAxesStory render={({ color, level, variant }) => <Chip family={color} level={level} usage={variant}>exhibit</Chip>} />,
}
