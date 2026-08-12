/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { LogoCloud } from '../../src/marketing'

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
} satisfies Meta<typeof LogoCloud>

export default meta
type Story = StoryObj<typeof meta>

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
