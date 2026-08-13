/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Mark } from '../../src/marketing'

const meta = {
	title: 'Atoms/Mark',
	component: Mark,
	argTypes: {
		tone: { control: 'radio', options: ['underline', 'highlight'] },
		ink: { control: 'text', table: { category: 'knobs' } },
		contentInk: { control: 'text', table: { category: 'knobs' } },
		thickness: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Mark>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: { tone: 'highlight', children: 'reimagined', ink: 'var(--color-primary)' },
	render: (args) => (
		<p style={{ 'font-size': '24px', 'max-width': '32ch' }}>
			The program, <Mark {...args} /> for season four.
		</p>
	),
}

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
