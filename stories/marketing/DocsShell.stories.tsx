/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DocsShell } from '../../src/marketing'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Organisms/DocsShell',
	component: DocsShell,
	parameters: { layout: 'fullscreen' },
	argTypes: {
		...treatmentArgTypes,
		maxWidth: { control: 'text', table: { category: 'knobs' } },
		sideWidth: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		progressInk: { control: 'text', table: { category: 'knobs' } },
		progressHeight: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof DocsShell>

export default meta
type Story = StoryObj<typeof meta>

export const FullDocument: Story = {
	name: 'Full document (nav + TOC + progress)',
	render: (args) => (
		<DocsShell
			{...args}
			navLabel="Handbook"
			nav={[
				{ label: 'Welcome', href: '#welcome' },
				{ label: 'Membership', href: '#', current: true },
				{ label: 'Joining', href: '#joining', sub: true },
				{ label: 'Rates', href: '#rates', sub: true },
				{ label: 'Governance', href: '#governance' },
			]}
		>
			<h1>Membership</h1>
			<p>
				Everything in the commons flows from membership: access to the rooms, a vote in the seasonal
				program, and a share of the upkeep. This chapter covers how joining works and what it costs.
			</p>
			<h2 id="joining">Joining</h2>
			<p>
				Come to a Thursday open house, meet two current members, and fill in the one-page form.
				There is no interview and no portfolio review — the commons is for practice, not
				credentials.
			</p>
			<h3 id="sponsors">Sponsors</h3>
			<p>
				Your two members act as sponsors for the first season: they show you the rooms, the booking
				system, and the norms that keep shared space workable.
			</p>
			<h2 id="rates">Rates</h2>
			<p>
				One flat monthly rate, set by member vote each season. A concession rate — always half — is
				available to anyone who asks, no questions.
			</p>
			<h2 id="responsibilities">Responsibilities</h2>
			<p>
				Every member takes one small recurring job: opening shifts, tool maintenance, or the
				newsletter. Roles rotate each season so no job hardens into a fiefdom.
			</p>
		</DocsShell>
	),
}
