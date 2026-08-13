/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Breadcrumb } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Breadcrumb',
	component: Breadcrumb,
	argTypes: {
		...treatmentArgTypes,
		separator: { control: 'text' },
		fontSize: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		separatorInk: { control: 'text', table: { category: 'knobs' } },
		linkInk: { control: 'text', table: { category: 'knobs' } },
		focusRing: { control: 'text', table: { category: 'knobs' } },
	},
	args: {
		items: [
			{ label: 'Home World', onSelect: () => {} },
			{ label: 'Insights', onSelect: () => {} },
			{ label: 'Library' },
		],
	},
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		items: [
			{ label: 'Commons', href: '#' },
			{ label: 'Insights', href: '#' },
			{ label: 'Season four' },
		],
		separator: '›',
	},
}

export const Default: Story = {}

export const TwoLevels: Story = {
	args: {
		items: [{ label: 'Home World', onSelect: () => {} }, { label: 'Insights' }],
	},
}

export const WithLinks: Story = {
	args: {
		items: [
			{ label: 'Docs', href: '#docs' },
			{ label: 'Spatial', href: '#spatial' },
			{ label: 'Cell frames' },
		],
	},
}

export const InertAncestor: Story = {
	args: {
		// A middle step with no href/handler renders as quiet text — the
		// trail still reads as location, it just isn't a jump target.
		items: [
			{ label: 'Home World', onSelect: () => {} },
			{ label: 'Far Shallows' },
			{ label: 'Unclaimed cove' },
		],
	},
}

export const DeepTrailWraps: Story = {
	render: () => (
		<div style={{ 'max-width': '260px' }}>
			<Breadcrumb
				items={[
					{ label: 'Home World', onSelect: () => {} },
					{ label: 'Insights', onSelect: () => {} },
					{ label: 'Library quarter', onSelect: () => {} },
					{ label: 'Reading room', onSelect: () => {} },
					{ label: 'Northern stacks' },
				]}
			/>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => (
		<Breadcrumb colorBase={colorBase} colorLevel={colorLevel} variant={variant} items={[{ label: 'Home', onSelect: () => {} }, { label: 'Gallery', onSelect: () => {} }, { label: 'Exhibit' }]} />
	)} />,
}
