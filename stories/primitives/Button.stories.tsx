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
		appearance: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
	},
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
	args: { colorBase: 'primary', colorLevel: 500, appearance: 'solid', children: 'Join the session' },
}

export const Ghost: Story = {
	args: { appearance: 'ghost', children: 'View details' },
}

export const Disabled: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px' }}>
			<Button appearance="solid" disabled>
				Primary disabled
			</Button>
			<Button appearance="ghost" disabled>Ghost disabled</Button>
		</div>
	),
}

export const AllVariants: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px', 'align-items': 'center' }}>
			<Button appearance="solid">Primary</Button>
			<Button colorBase="success" appearance="soft">Success</Button>
			<Button colorBase="warning" colorLevel={600} appearance="outline">Warning</Button>
			<Button colorBase="error" appearance="text">Error</Button>
			<Button appearance="ghost">Ghost</Button>
			<Button appearance="solid" disabled>
				Primary disabled
			</Button>
			<Button appearance="ghost" disabled>Ghost disabled</Button>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × appearance',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, appearance }) => (
				<Button colorBase={colorBase} colorLevel={colorLevel} appearance={appearance}>{colorBase}</Button>
			)}
		/>
	),
}
