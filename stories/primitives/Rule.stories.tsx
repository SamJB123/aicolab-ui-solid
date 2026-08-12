/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Rule } from '../../src/primitives'
import { ColorAxesStory } from './color-axes-story'

const meta = {
	title: 'Primitives/Rule',
	component: Rule,
} satisfies Meta<typeof Rule>

export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {}

export const Labelled: Story = {
	args: { label: 'This week' },
}

export const ThreeAxes: Story = {
	name: 'Family × level × usage',
	render: () => <ColorAxesStory render={({ color, level, variant }) => <div style={{ width: '100%' }}><Rule family={color} level={level} usage={variant} label="This week" /></div>} />,
}
