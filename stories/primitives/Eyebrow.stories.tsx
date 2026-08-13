/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Eyebrow } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Eyebrow',
	component: Eyebrow,
	argTypes: {
		...treatmentArgTypes,
		fontSize: { control: 'text', table: { category: 'knobs' } },
		letterSpacing: { control: 'text', table: { category: 'knobs' } },
		ink: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Eyebrow>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		children: 'Season four',
		letterSpacing: '0.32em',
	},
}

export const Default: Story = {
	args: { children: 'Commons · Live' },
}

export const AccentInk: Story = {
	name: 'Primary foreground',
	args: { children: 'Model for change', colorBase: 'primary' },
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => <Eyebrow colorBase={colorBase} colorLevel={colorLevel} variant={variant}>Commons · Live</Eyebrow>} />,
}
