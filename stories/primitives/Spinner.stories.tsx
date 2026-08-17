/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Spinner } from '../../src/atoms/spinner'
import { ColorTreatmentStory, treatmentArgTypes } from './color-treatment-story'

const meta = {
	title: 'Atoms/Spinner',
	component: Spinner,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		label: { control: 'text' },
		size: { control: 'text', table: { category: 'knobs' } },
		thickness: { control: 'text', table: { category: 'knobs' } },
		ink: { control: 'text', table: { category: 'knobs' } },
		track: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		label: 'Loading…',
		size: '28px',
		thickness: '3px',
	},
}

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '16px', 'align-items': 'center' }}>
			<Spinner size="14px" thickness="2px" />
			<Spinner />
			<Spinner size="32px" thickness="3px" />
			<Spinner size="48px" thickness="4px" colorBase="secondary" />
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<Spinner colorBase={colorBase} colorLevel={colorLevel} variant={variant} size="28px" />
			)}
		/>
	),
}
