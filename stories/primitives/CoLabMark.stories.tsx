/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { CoLabMark } from '../../src/atoms/colab-mark'
import { ColorTreatmentStory, treatmentArgTypes } from './color-treatment-story'

const meta = {
	title: 'Atoms/CoLabMark',
	component: CoLabMark,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		tone: { control: 'radio', options: ['ink', 'lit', 'reveal'] },
		size: { control: 'text', table: { category: 'knobs' } },
		ink: { control: 'text', table: { category: 'knobs' } },
		cells: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof CoLabMark>

export default meta
type Story = StoryObj<typeof meta>

/* The reveal tone lights while the link or button it sits in is hovered or
   focused, so the Playground renders the mark inside a brand link beside
   the wordmark — the anatomy of its header use. */
export const Playground: Story = {
	args: {
		tone: 'reveal',
		size: '30px',
	},
	render: (args) => (
		<a
			href="#"
			style={{
				display: 'inline-flex',
				'align-items': 'center',
				gap: '0.5rem',
				color: 'inherit',
				'text-decoration': 'none',
				font: '700 1rem var(--font-display)',
			}}
		>
			<CoLabMark {...args} />
			AI CoLab
		</a>
	),
}

export const Tones: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '32px', 'align-items': 'center' }}>
			<CoLabMark tone="ink" size="48px" />
			<CoLabMark tone="lit" size="48px" />
			<a href="#" style={{ display: 'inline-flex', color: 'inherit' }}>
				<CoLabMark tone="reveal" size="48px" />
			</a>
		</div>
	),
}

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '24px', 'align-items': 'center' }}>
			<CoLabMark tone="lit" size="16px" />
			<CoLabMark tone="lit" />
			<CoLabMark tone="lit" size="30px" />
			<CoLabMark tone="lit" size="64px" />
			<CoLabMark tone="ink" size="64px" />
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<CoLabMark tone="lit" colorBase={colorBase} colorLevel={colorLevel} variant={variant} size="36px" />
			)}
		/>
	),
}
