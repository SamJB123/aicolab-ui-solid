/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from './color-treatment-story'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Breadcrumb, HexMark } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Breadcrumb',
	component: Breadcrumb,
	argTypes: {
		...treatmentArgTypes,
		separator: { control: 'text' },
		labels: { control: 'inline-radio', options: ['caps', 'words'] },
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

const placeMark = (d: string) => () => (
	<HexMark size="20px">
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d={d} />
		</svg>
	</HexMark>
)

export const Words: Story = {
	name: 'Words, with marks',
	args: {
		// The names of places as words, each beside its hex mark: the hub's
		// trail. An ancestor lights as a plate on hover; the current step is
		// bold.
		labels: 'words',
		items: [
			{ label: 'Hub', icon: placeMark('M12 3l8 4.5v9L12 21l-8-4.5v-9z'), onSelect: () => {} },
			{ label: 'Insight Bridge', icon: placeMark('M3 15c3-5 15-5 18 0M5 15v4M19 15v4M12 12v7'), onSelect: () => {} },
			{ label: 'One Basin', icon: placeMark('M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6') },
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
