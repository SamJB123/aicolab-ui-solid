/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { IconButton } from '../../src/controls'

const meta = {
	title: 'Atoms/IconButton',
	component: IconButton,
	args: { label: 'Next month' },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { label: 'Next month', children: '›' },
}

export const Disabled: Story = {
	args: { label: 'Previous month', children: '‹', disabled: true },
}

export const NavigationPair: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '6px' }}>
			<IconButton label="Previous month" disabled>
				‹
			</IconButton>
			<IconButton label="Next month">›</IconButton>
		</div>
	),
}
