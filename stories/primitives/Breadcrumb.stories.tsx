/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Breadcrumb } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Primitives/Breadcrumb',
	component: Breadcrumb,
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
	name: 'Color base × level × appearance',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, appearance }) => (
		<Breadcrumb colorBase={colorBase} colorLevel={colorLevel} appearance={appearance} items={[{ label: 'Home', onSelect: () => {} }, { label: 'Gallery', onSelect: () => {} }, { label: 'Exhibit' }]} />
	)} />,
}
