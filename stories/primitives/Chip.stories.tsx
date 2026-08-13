/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Chip } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Chip',
	component: Chip,
	argTypes: {
		...treatmentArgTypes,
		tone: { control: 'radio', options: ['plain', 'accent', 'live'] },
		radius: { control: 'text', table: { category: 'knobs' } },
		padBlock: { control: 'text', table: { category: 'knobs' } },
		padInline: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		fontSize: { control: 'text', table: { category: 'knobs' } },
		letterSpacing: { control: 'text', table: { category: 'knobs' } },
		surface: { control: 'text', table: { category: 'knobs' } },
		ink: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		children: 'Playground',
		tone: 'accent',
		radius: 'var(--r-pill)',
		padInline: '10px',
	},
}

export const Plain: Story = {
	args: { children: 'workshop' },
}

export const Accent: Story = {
	args: { tone: 'accent', children: 'featured' },
}

export const Live: Story = {
	args: { tone: 'live', children: 'live now' },
}

export const AllTones: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px' }}>
			<Chip>plain</Chip>
			<Chip tone="accent">accent</Chip>
			<Chip tone="live">live</Chip>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => <Chip colorBase={colorBase} colorLevel={colorLevel} variant={variant}>exhibit</Chip>} />,
}
