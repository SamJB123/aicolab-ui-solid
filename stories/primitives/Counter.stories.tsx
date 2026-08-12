/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button, Counter } from '../../src/primitives'
import { ColorAxesStory } from './color-axes-story'

const meta = {
	title: 'Primitives/Counter',
	component: Counter,
	args: { value: 12480 },
} satisfies Meta<typeof Counter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { value: 12480 },
}

export const CustomFormat: Story = {
	args: { value: 87.4, format: (n) => `${n.toFixed(1)}%` },
}

export const Tweened: Story = {
	name: 'Tweened (click to retarget)',
	render: () => {
		const [value, setValue] = createSignal(1200)
		return (
			<div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
				<Counter value={value()} class="font-data" />
				<Button variant="primary" onClick={() => setValue(Math.round(Math.random() * 100_000))}>
					Randomise
				</Button>
			</div>
		)
	},
}

export const ThreeAxes: Story = {
	name: 'Family × level × usage',
	render: () => <ColorAxesStory render={({ color, level, variant }) => <Counter family={color} level={level} usage={variant} value={12480} class="font-data" />} />,
}
