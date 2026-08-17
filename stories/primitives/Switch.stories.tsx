/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Switch } from '../../src/atoms/switch'
import { ColorTreatmentStory, treatmentArgTypes } from './color-treatment-story'

const meta = {
	title: 'Atoms/Switch',
	component: Switch,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		disabled: { control: 'boolean' },
		width: { control: 'text', table: { category: 'knobs' } },
		height: { control: 'text', table: { category: 'knobs' } },
		accent: { control: 'text', table: { category: 'knobs' } },
		thumb: { control: 'text', table: { category: 'knobs' } },
		focusRing: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		children: 'Public link enabled',
		width: '36px',
		height: '20px',
	},
}

export const States: Story = {
	render: () => {
		const [on, setOn] = createSignal(true)
		return (
			<div style={{ display: 'grid', gap: '10px' }}>
				<Switch checked={on()} onChange={(e) => setOn(e.currentTarget.checked)}>
					Controlled ({on() ? 'on' : 'off'})
				</Switch>
				<Switch checked disabled>
					Locked on
				</Switch>
				<Switch disabled>Locked off</Switch>
				<Switch checked width="52px" height="28px" colorBase="secondary">
					Large treated
				</Switch>
			</div>
		)
	},
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<Switch checked colorBase={colorBase} colorLevel={colorLevel} variant={variant}>
					toggle
				</Switch>
			)}
		/>
	),
}
