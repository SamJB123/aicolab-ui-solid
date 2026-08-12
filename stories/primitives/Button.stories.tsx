/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/primitives'
import { ColorAxesStory } from './color-axes-story'

const meta = {
	title: 'Primitives/Button',
	component: Button,
	argTypes: {
		color: {
			control: 'select',
			options: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		},
		level: { control: 'select', options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
		variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
	},
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: { color: 'primary', level: 500, variant: 'solid', children: 'Join the session' },
}

export const Ghost: Story = {
	name: 'Ghost (default)',
	args: { children: 'View details' },
}

export const Disabled: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px' }}>
			<Button variant="solid" disabled>
				Primary disabled
			</Button>
			<Button disabled>Ghost disabled</Button>
		</div>
	),
}

export const AllVariants: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px', 'align-items': 'center' }}>
			<Button variant="solid">Primary</Button>
			<Button color="success" variant="soft">Success</Button>
			<Button color="warning" level={600} variant="outline">Warning</Button>
			<Button color="error" variant="text">Error</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="solid" disabled>
				Primary disabled
			</Button>
			<Button disabled>Ghost disabled</Button>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Family × level × usage',
	render: () => (
		<ColorAxesStory
			render={({ color, level, variant }) => (
				<Button color={color} level={level} variant={variant}>{color}</Button>
			)}
		/>
	),
}
