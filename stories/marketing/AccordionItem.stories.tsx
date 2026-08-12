/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { AccordionItem } from '../../src/marketing'
import { Chip } from '../../src/primitives'

const meta = {
	title: 'Atoms/AccordionItem',
	component: AccordionItem,
	args: { summary: 'What does membership cost?' },
} satisfies Meta<typeof AccordionItem>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
	args: {
		summary: 'What does membership cost?',
		children:
			'A flat monthly rate, set each season by member vote. Concession rates are always available.',
	},
}

export const OpenByDefault: Story = {
	args: {
		summary: 'Can I visit before joining?',
		open: true,
		children: 'Yes — every Thursday evening is open house.',
	},
}

export const ExclusiveGroup: Story = {
	name: 'Exclusive group (native name attr)',
	render: () => (
		<div style={{ 'max-width': '520px' }}>
			<AccordionItem group="faq" summary="What does membership cost?" open>
				A flat monthly rate, set each season by member vote.
			</AccordionItem>
			<AccordionItem group="faq" summary="Can I visit before joining?">
				Yes — every Thursday evening is open house.
			</AccordionItem>
			<AccordionItem group="faq" summary="Who programs the seasons?">
				The members do: proposals are open to everyone, then voted on.
			</AccordionItem>
		</div>
	),
}

export const LazySummarySlot: Story = {
	name: 'JSX summary (lazy slot)',
	render: () => (
		<div style={{ 'max-width': '520px' }}>
			<AccordionItem
				summary={() => (
					<span style={{ display: 'inline-flex', gap: '8px', 'align-items': 'center' }}>
						Season 4 program <Chip tone="live">voting open</Chip>
					</span>
				)}
			>
				Twelve proposals made the ballot this season — voting closes Friday.
			</AccordionItem>
		</div>
	),
}
