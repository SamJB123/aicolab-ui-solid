/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Accordion, AccordionItem } from '../../src/marketing'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/Accordion',
	component: Accordion,
	args: {
		spacing: 'joined',
		density: 'comfortable',
		exclusive: true,
	},
	argTypes: {
		...treatmentArgTypes,
		spacing: { control: 'inline-radio', options: ['joined', 'separated'] },
		density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
		itemGap: { control: 'text', table: { category: 'knobs' } },
		/* Item knob defaults — every row inherits these; an item's own wins. */
		padBlock: { control: 'text', table: { category: 'knobs (item defaults)' } },
		padInline: { control: 'text', table: { category: 'knobs (item defaults)' } },
		gap: { control: 'text', table: { category: 'knobs (item defaults)' } },
		radius: { control: 'text', table: { category: 'knobs (item defaults)' } },
		iconSize: { control: 'text', table: { category: 'knobs (item defaults)' } },
		iconInk: { control: 'text', table: { category: 'knobs (item defaults)' } },
		summaryFontSize: { control: 'text', table: { category: 'knobs (item defaults)' } },
		bodyInk: { control: 'text', table: { category: 'knobs (item defaults)' } },
		bodySurface: { control: 'text', table: { category: 'knobs (item defaults)' } },
		divider: { control: 'text', table: { category: 'knobs (item defaults)' } },
	},
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	render: (args) => (
		<div style={{ 'max-width': '520px' }}>
			<Accordion {...args} label="Membership questions">
				<AccordionItem summary="What does membership cost?" open>
					A flat monthly rate, set each season by member vote.
				</AccordionItem>
				<AccordionItem summary="Can I visit before joining?">
					Yes — every Thursday evening is open house.
				</AccordionItem>
				<AccordionItem summary="Who programs the seasons?">
					The members do: proposals are open to everyone, then voted on.
				</AccordionItem>
			</Accordion>
		</div>
	),
}

export const TreatedCollection: Story = {
	name: 'Treated collection (item override wins)',
	render: () => (
		<div style={{ 'max-width': '520px' }}>
			<Accordion
				label="Season planning"
				spacing="separated"
				colorBase="success"
				variant="soft"
			>
				<AccordionItem summary="Voting is open" open>
					Twelve proposals made the ballot this season — voting closes Friday.
				</AccordionItem>
				<AccordionItem summary="Results announced">
					The winning program is published in the members' letter.
				</AccordionItem>
				<AccordionItem summary="One unresolved dispute" colorBase="warning">
					This item overrides the collection's treatment with its own.
				</AccordionItem>
			</Accordion>
		</div>
	),
}

export const CollectionContext: Story = {
	name: 'Container style and size queries',
	render: (args) => (
		<div style={{ 'max-width': '520px', resize: 'horizontal', overflow: 'auto' }}>
			<Accordion {...args} label="Membership questions">
				<AccordionItem summary="What does membership cost?" open>
					A flat monthly rate, set each season by member vote.
				</AccordionItem>
				<AccordionItem summary="Can I visit before joining?">
					Yes — every Thursday evening is open house.
				</AccordionItem>
				<AccordionItem summary="Who programs the seasons?">
					The members do: proposals are open to everyone, then voted on.
				</AccordionItem>
			</Accordion>
		</div>
	),
}
