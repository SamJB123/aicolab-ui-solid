/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { type FacetItem, Facets } from '../../src/facets'

const ITEMS: FacetItem[] = [
	{
		glyph: '🏛️',
		label: 'Spaces',
		content: () => (
			<div>
				<h3 style={{ margin: '0 0 8px' }}>Spaces</h3>
				<p style={{ margin: 0, color: 'var(--color-base-content-muted)' }}>
					Two floors of studios, a workshop, and the commons — bookable by any member, programmed by
					everyone.
				</p>
			</div>
		),
	},
	{
		glyph: '🧭',
		label: 'Programs',
		content: () => (
			<div>
				<h3 style={{ margin: '0 0 8px' }}>Programs</h3>
				<p style={{ margin: 0, color: 'var(--color-base-content-muted)' }}>
					Weekly critique nights, member-led courses, and the seasonal exhibition cycle.
				</p>
			</div>
		),
	},
	{
		glyph: '🤝',
		label: 'Membership',
		content: () => (
			<div>
				<h3 style={{ margin: '0 0 8px' }}>Membership</h3>
				<p style={{ margin: 0, color: 'var(--color-base-content-muted)' }}>
					Flat monthly rate, cooperative governance, and a vote in every season's program.
				</p>
			</div>
		),
	},
]

const meta = {
	title: 'Facets/Facets',
	component: Facets,
	argTypes: {
		tabStyle: { control: 'radio', options: ['bar', 'pill', 'pill-stretch'] },
	},
} satisfies Meta<typeof Facets>

export default meta
type Story = StoryObj<typeof meta>

export const Bar: Story = {
	name: 'Tab style: bar (legacy-faithful)',
	args: { items: ITEMS, tabStyle: 'bar', label: 'About the commons' },
}

export const Pill: Story = {
	name: 'Tab style: pill (sliding)',
	args: { items: ITEMS, tabStyle: 'pill', label: 'About the commons' },
}

export const PillStretch: Story = {
	name: 'Tab style: pill-stretch',
	args: { items: ITEMS, tabStyle: 'pill-stretch', label: 'About the commons' },
}
