/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Section } from '../../src/marketing'
import { Chip } from '../../src/primitives'

const meta = {
	title: 'Molecules/Section',
	component: Section,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Section>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	render: () => (
		<Section
			eyebrow="How it works"
			title="One membership, every room"
			lede="The default column is 48rem — comfortable for prose."
		>
			<p style={{ color: 'var(--color-base-content-muted)' }}>
				Sections keep a consistent vertical rhythm and column width across a marketing page, so
				stacked content reads as one document rather than a pile of blocks.
			</p>
		</Section>
	),
}

export const WideCentered: Story = {
	name: 'Wide (72rem) + centered head',
	render: () => (
		<Section
			eyebrow="The rooms"
			title="Built for grids"
			lede="Wide sections span to 72rem for card grids."
			wide
			center
		>
			<div style={{ display: 'flex', gap: '8px', 'justify-content': 'center' }}>
				<Chip colorBase="primary" variant="soft">Studio A</Chip>
				<Chip colorBase="secondary" variant="soft">Studio B</Chip>
				<Chip>Workshop</Chip>
				<Chip>Commons</Chip>
			</div>
		</Section>
	),
}
