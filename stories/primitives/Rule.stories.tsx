/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Rule } from '../../src/primitives'

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
