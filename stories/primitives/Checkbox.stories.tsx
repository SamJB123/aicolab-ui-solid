/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Checkbox } from '../../src/atoms/checkbox'
import { ColorTreatmentStory, treatmentArgTypes } from './color-treatment-story'

const meta = {
	title: 'Atoms/Checkbox',
	component: Checkbox,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		disabled: { control: 'boolean' },
		indeterminate: { control: 'boolean' },
		size: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		accent: { control: 'text', table: { category: 'knobs' } },
		checkInk: { control: 'text', table: { category: 'knobs' } },
		focusRing: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		children: 'Share with the whole hive',
		size: '18px',
	},
}

export const States: Story = {
	render: () => {
		const [checked, setChecked] = createSignal(true)
		return (
			<div style={{ display: 'grid', gap: '10px' }}>
				<Checkbox checked={checked()} onChange={(e) => setChecked(e.currentTarget.checked)}>
					Controlled ({checked() ? 'on' : 'off'})
				</Checkbox>
				<Checkbox indeterminate>Some selected</Checkbox>
				<Checkbox checked disabled>
					Locked on
				</Checkbox>
				<Checkbox disabled>Locked off</Checkbox>
				<Checkbox checked colorBase="success">
					Treated success
				</Checkbox>
			</div>
		)
	},
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<Checkbox checked colorBase={colorBase} colorLevel={colorLevel} variant={variant}>
					option
				</Checkbox>
			)}
		/>
	),
}
