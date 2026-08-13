/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { type Feature, FeatureGrid } from '../../src/marketing'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const FEATURES: Feature[] = [
	{
		title: 'Shared studios',
		body: 'Two floors of bookable space with tools that no single member could justify alone.',
		icon: '🏗️',
	},
	{
		title: 'Member-led programs',
		body: 'Courses, critique nights, and working groups proposed and run by the people in the room.',
		icon: '🧭',
		accent: '#5aa179',
	},
	{
		title: 'Cooperative governance',
		body: 'One member, one vote — the seasonal program is decided together.',
		icon: '🤝',
		accent: '#7286b8',
	},
]

const meta = {
	title: 'Molecules/FeatureGrid',
	component: FeatureGrid,
	parameters: { layout: 'fullscreen' },
	argTypes: {
		...treatmentArgTypes,
		columns: { control: 'radio', options: [2, 3] },
		gap: { control: 'text', table: { category: 'knobs' } },
		iconSize: { control: 'text', table: { category: 'knobs' } },
		iconRadius: { control: 'text', table: { category: 'knobs' } },
		accent: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof FeatureGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: { items: FEATURES },
}

export const ThreeColumns: Story = {
	args: { items: FEATURES },
}

export const TwoColumns: Story = {
	args: { items: FEATURES.slice(0, 2), columns: 2 },
}
