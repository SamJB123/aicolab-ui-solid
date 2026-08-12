/** @jsxImportSource @solidjs/web */
// A realistic full-page composition — every marketing primitive on one
// canvas, the way workers/landing consumes them. Useful with the Theme
// toolbar's Split mode for whole-page light/dark tuning.
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import {
	AccordionItem,
	FeatureGrid,
	LogoCloud,
	Mark,
	PageHero,
	Section,
	Steps,
} from '../../src/marketing'
import { Button } from '../../src/primitives'

const meta = {
	title: 'Composed/Landing page',
	parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {
	render: () => (
		<main>
			<PageHero
				eyebrow="AI CoLab"
				title={
					<>
						A commons for <Mark>collective</Mark> intelligence
					</>
				}
				lede="Workshops, working groups, and shared infrastructure for people building with AI in the public interest."
				actions={() => (
					<>
						<Button appearance="solid">Join a session</Button>
						<Button appearance="ghost">Read the model</Button>
					</>
				)}
			/>
			<Section eyebrow="What you get" title="One membership, every room" wide center>
				<FeatureGrid
					items={[
						{
							title: 'Shared studios',
							body: 'Two floors of bookable space with tools no single member could justify alone.',
							icon: '🏗️',
						},
						{
							title: 'Member-led programs',
							body: 'Courses, critique nights, and working groups run by the people in the room.',
							icon: '🧭',
							accent: '#5aa179',
						},
						{
							title: 'Cooperative governance',
							body: 'One member, one vote — the seasonal program is decided together.',
							icon: '🤝',
							accent: '#7286b8',
						},
					]}
				/>
			</Section>
			<Section eyebrow="The model" title="See, shape, ship" wide center>
				<Steps
					steps={[
						{
							title: 'See',
							body: 'Map what the community already knows.',
							bullets: ['Listening sessions', 'Shared inventory'],
						},
						{
							title: 'Shape',
							body: 'Turn the map into a seasonal program the members vote on.',
							accent: '#5aa179',
						},
						{
							title: 'Ship',
							body: 'Run the season and feed the results back into the commons.',
							accent: '#7286b8',
						},
					]}
				/>
			</Section>
			<Section eyebrow="Partners" center>
				<LogoCloud
					logos={[
						{ name: 'City Library' },
						{ name: 'Makers Guild' },
						{ name: 'Open Data Co-op' },
						{ name: 'Civic Studio' },
					]}
				/>
			</Section>
			<Section eyebrow="FAQ" title="Common questions">
				<AccordionItem group="landing-faq" summary="What does membership cost?" open>
					A flat monthly rate, set each season by member vote.
				</AccordionItem>
				<AccordionItem group="landing-faq" summary="Can I visit before joining?">
					Yes — every Thursday evening is open house.
				</AccordionItem>
			</Section>
		</main>
	),
}
