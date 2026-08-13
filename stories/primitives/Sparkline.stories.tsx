/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Sparkline } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const DATA = [12, 18, 14, 22, 30, 26, 38, 34, 41, 39, 47, 52]

const meta = {
	title: 'Atoms/Sparkline',
	component: Sparkline,
	argTypes: {
		...treatmentArgTypes,
		ink: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Sparkline>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		data: [4, 9, 6, 12, 8, 15, 11, 18, 14, 21],
	},
}

export const Default: Story = {
	args: { data: DATA },
}

export const LiveColour: Story = {
	args: { data: [40, 42, 38, 45, 43, 48, 52, 50, 55, 61], strokeColor: 'var(--color-success)' },
}

export const Wide: Story = {
	name: 'Custom size (w/h)',
	args: { data: DATA, w: 320, h: 64 },
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	args: { data: DATA },
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => <Sparkline colorBase={colorBase} colorLevel={colorLevel} variant={variant} data={DATA} />} />,
}
