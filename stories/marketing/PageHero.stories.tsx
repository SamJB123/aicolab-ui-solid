/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Mark, PageHero } from '../../src/marketing'
import { Button } from '../../src/primitives'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/PageHero',
	component: PageHero,
	// Keep required metadata serializable. Rich JSX is created only inside each
	// story's owned render scope below.
	args: { title: 'Page hero' },
	parameters: { layout: 'fullscreen' },
	argTypes: {
		...treatmentArgTypes,
		maxWidth: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		titleSize: { control: 'text', table: { category: 'knobs' } },
		titleInk: { control: 'text', table: { category: 'knobs' } },
		ledeSize: { control: 'text', table: { category: 'knobs' } },
		ledeInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof PageHero>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => (
		<PageHero
			{...args}
			eyebrow="AI CoLab"
			title={(
			<>
				A commons for <Mark>collective</Mark> intelligence
			</>
			)}
			lede="Workshops, working groups, and shared infrastructure for people building with AI in the public interest."
			actions={() => (
			<>
				{/* Slot content is caller-authored: the caller passes the family. */}
				<Button colorBase={args.colorBase} colorLevel={args.colorLevel} variant="solid">Join a session</Button>
				<Button colorBase={args.colorBase} colorLevel={args.colorLevel} variant="ghost">Read the model</Button>
			</>
			)}
		/>
	),
}

export const Centered: Story = {
	render: () => (
		<PageHero
			eyebrow="AI CoLab"
			title={(
			<>
				A commons for <Mark>collective</Mark> intelligence
			</>
			)}
			lede="Workshops, working groups, and shared infrastructure for people building with AI in the public interest."
			actions={() => (
			<>
				<Button variant="solid">Join a session</Button>
				<Button variant="ghost">Read the model</Button>
			</>
			)}
		/>
	),
}

export const StartAligned: Story = {
	render: () => (
		<PageHero
			align="start"
			eyebrow="Season 4"
			title={(
			<>
				The program, <Mark tone="highlight">reimagined</Mark>
			</>
			)}
			lede="Twelve weeks of member-led sessions across both studios."
			actions={() => <Button variant="solid">Browse the calendar</Button>}
		/>
	),
}
