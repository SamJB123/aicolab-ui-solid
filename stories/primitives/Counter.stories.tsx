/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button, Counter } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Counter',
	component: Counter,
	argTypes: {
		...treatmentArgTypes,
		ink: { control: 'text', table: { category: 'knobs' } },
	},
	args: { value: 12480 },
} satisfies Meta<typeof Counter>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		value: 1234,
	},
}

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
				<Button variant="solid" onClick={() => setValue(Math.round(Math.random() * 100_000))}>
					Randomise
				</Button>
			</div>
		)
	},
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => <Counter colorBase={colorBase} colorLevel={colorLevel} variant={variant} value={12480} class="font-data" />} />,
}
