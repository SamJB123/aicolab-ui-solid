/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/primitives'

const meta = {
	title: 'Primitives/Button',
	component: Button,
	argTypes: {
		variant: { control: 'radio', options: ['primary', 'ghost'] },
	},
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: { variant: 'primary', children: 'Join the session' },
}

export const Ghost: Story = {
	name: 'Ghost (default)',
	args: { children: 'View details' },
}

export const Disabled: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px' }}>
			<Button variant="primary" disabled>
				Primary disabled
			</Button>
			<Button disabled>Ghost disabled</Button>
		</div>
	),
}

export const AllVariants: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px', 'align-items': 'center' }}>
			<Button variant="primary">Primary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="primary" disabled>
				Primary disabled
			</Button>
			<Button disabled>Ghost disabled</Button>
		</div>
	),
}
