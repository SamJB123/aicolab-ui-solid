/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Callout } from '../../src/molecules/callout'
import { ColorTreatmentStory, treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/Callout',
	component: Callout,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		as: { control: 'radio', options: ['section', 'aside', 'div'] },
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
		bandPad: { control: 'text', table: { category: 'knobs' } },
		iconSize: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		colorBase: 'secondary',
		band: () => <p>Signs and symptoms of cancer</p>,
		icon: () => <>☑</>,
	},
	render: (args) => (
		<div style={{ width: 'min(34rem, 90vw)' }}>
			<Callout {...args}>
				<p>
					A banded box: the band carries an icon and a heading, the body carries anything —
					paragraphs, lists, tables, other callouts.
				</p>
				<ul>
					<li>Identify red-flag symptoms and refer promptly.</li>
					<li>Document the discussion and the plan.</li>
				</ul>
			</Callout>
		</div>
	),
}

export const Bandless: Story = {
	name: 'Without a band (soft)',
	args: { colorBase: 'info', variant: 'soft' },
	render: (args) => (
		<div style={{ width: 'min(34rem, 90vw)' }}>
			<Callout {...args}>
				<p>
					<strong>Optimal Care Pathways</strong> are nationally endorsed guides to best practice
					care across the cancer continuum.
				</p>
			</Callout>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<Callout
					colorBase={colorBase}
					colorLevel={colorLevel}
					variant={variant}
					band={() => <p>Band</p>}
					icon={() => <>ⓘ</>}
					style={{ width: '220px' }}
				>
					<p>Body text in the family's roles.</p>
				</Callout>
			)}
		/>
	),
}
