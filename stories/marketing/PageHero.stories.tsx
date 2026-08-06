/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Mark, PageHero } from '../../src/marketing'
import { Button } from '../../src/primitives'

const meta = {
	title: 'Marketing/PageHero',
	component: PageHero,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageHero>

export default meta
type Story = StoryObj<typeof meta>

export const Centered: Story = {
	args: {
		eyebrow: 'AI CoLab',
		title: (
			<>
				A commons for <Mark>collective</Mark> intelligence
			</>
		),
		lede: 'Workshops, working groups, and shared infrastructure for people building with AI in the public interest.',
		actions: () => (
			<>
				<Button variant="primary">Join a session</Button>
				<Button variant="ghost">Read the model</Button>
			</>
		),
	},
}

export const StartAligned: Story = {
	args: {
		align: 'start',
		eyebrow: 'Season 4',
		title: (
			<>
				The program, <Mark tone="highlight">reimagined</Mark>
			</>
		),
		lede: 'Twelve weeks of member-led sessions across both studios.',
		actions: () => <Button variant="primary">Browse the calendar</Button>,
	},
}
