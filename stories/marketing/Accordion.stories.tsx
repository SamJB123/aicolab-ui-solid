/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Accordion, AccordionItem } from '../../src/marketing'

const meta = {
	title: 'Molecules/Accordion',
	component: Accordion,
	args: {
		spacing: 'joined',
		density: 'comfortable',
		exclusive: true,
	},
	argTypes: {
		spacing: { control: 'inline-radio', options: ['joined', 'separated'] },
		density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
	},
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

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
