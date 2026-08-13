/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Rule } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Rule',
	component: Rule,
	argTypes: {
		...treatmentArgTypes,
		gap: { control: 'text', table: { category: 'knobs' } },
		lineThickness: { control: 'text', table: { category: 'knobs' } },
		lineInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Rule>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		label: 'Section',
		gap: '12px',
		lineThickness: '1px',
	},
	render: (args) => (
		<div style={{ width: '24rem' }}>
			<Rule {...args} />
		</div>
	),
}

export const Plain: Story = {}

export const Labelled: Story = {
	args: { label: 'This week' },
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => <div style={{ width: '100%' }}><Rule colorBase={colorBase} colorLevel={colorLevel} variant={variant} label="This week" /></div>} />,
}
