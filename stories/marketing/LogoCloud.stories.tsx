/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { LogoCloud } from '../../src/marketing'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

// A tiny inline SVG "logo" so the image path is exercised without any
// external asset (Storybook builds must stay self-contained).
const DEMO_LOGO =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="28"><rect width="96" height="28" rx="6" fill="#a06f1c"/><text x="48" y="19" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#fff">CO-OP</text></svg>',
	)

const meta = {
	title: 'Molecules/LogoCloud',
	component: LogoCloud,
	parameters: { layout: 'fullscreen' },
	argTypes: {
		...treatmentArgTypes,
		gap: { control: 'text', table: { category: 'knobs' } },
		logoHeight: { control: 'text', table: { category: 'knobs' } },
		logoMaxWidth: { control: 'text', table: { category: 'knobs' } },
		duration: { control: 'number', table: { category: 'knobs' } },
		nameInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof LogoCloud>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		logos: [
			{ name: 'City Library' },
			{ name: 'Demo Co-op', src: DEMO_LOGO },
			{ name: 'Makers Guild' },
			{ name: 'Civic Studio' },
		],
	},
}

export const NamesOnly: Story = {
	args: {
		logos: [
			{ name: 'City Library' },
			{ name: 'Makers Guild' },
			{ name: 'Open Data Co-op' },
			{ name: 'Civic Studio' },
			{ name: 'The Press' },
		],
	},
}

// A black wordmark on a transparent ground, as most supplied logos are:
// invisible on a dark scheme unless the item says how it reads there.
const DARK_WORDMARK =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 28"><text x="60" y="20" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="#111">WORDMARK</text></svg>',
	)

export const OnDark: Story = {
	args: {
		logos: [
			{ name: 'As drawn (reads on dark)', src: DEMO_LOGO },
			{ name: 'Ink: dark marks take the scheme ink', src: DARK_WORDMARK, onDark: 'ink' },
			{ name: 'Tile: set on the light anchor', src: DARK_WORDMARK, onDark: 'tile' },
			{ name: 'As drawn (fails on dark)', src: DARK_WORDMARK },
		],
	},
}

export const MixedNamesAndImages: Story = {
	args: {
		logos: [
			{ name: 'City Library' },
			{ name: 'Demo Co-op', src: DEMO_LOGO },
			{ name: 'Civic Studio' },
			{ name: 'Demo Co-op 2', src: DEMO_LOGO },
		],
	},
}
