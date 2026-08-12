/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Mark } from '../../src/marketing'

const meta = {
	title: 'Atoms/Mark',
	component: Mark,
	argTypes: {
		tone: { control: 'radio', options: ['underline', 'highlight'] },
	},
} satisfies Meta<typeof Mark>

export default meta
type Story = StoryObj<typeof meta>

export const Underline: Story = {
	render: () => (
		<p style={{ 'font-size': '24px', 'max-width': '32ch' }}>
			A commons for <Mark>collective</Mark> intelligence.
		</p>
	),
}

export const Highlight: Story = {
	render: () => (
		<p style={{ 'font-size': '24px', 'max-width': '32ch' }}>
			The program, <Mark tone="highlight">reimagined</Mark> for season four.
		</p>
	),
}
