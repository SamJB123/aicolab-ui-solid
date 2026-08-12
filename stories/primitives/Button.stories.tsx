/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Primitives/Button',
	component: Button,
	argTypes: {
		colorBase: {
			control: 'select',
			options: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		},
		colorLevel: { control: 'select', options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
		variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
	},
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: { colorBase: 'primary', colorLevel: 500, variant: 'solid', children: 'Join the session' },
}

export const Ghost: Story = {
	args: { variant: 'ghost', children: 'View details' },
}

export const Disabled: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px' }}>
			<Button variant="solid" disabled>
				Primary disabled
			</Button>
			<Button variant="ghost" disabled>Ghost disabled</Button>
		</div>
	),
}

export const AllVariants: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px', 'align-items': 'center' }}>
			<Button variant="solid">Primary</Button>
			<Button colorBase="success" variant="soft">Success</Button>
			<Button colorBase="warning" colorLevel={600} variant="outline">Warning</Button>
			<Button colorBase="error" variant="text">Error</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="solid" disabled>
				Primary disabled
			</Button>
			<Button variant="ghost" disabled>Ghost disabled</Button>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<Button colorBase={colorBase} colorLevel={colorLevel} variant={variant}>{colorBase}</Button>
			)}
		/>
	),
}
