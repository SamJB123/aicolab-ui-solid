/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { EmptyState } from '../../src/molecules/empty-state'
import { ActivityFeed } from '../../src/organisms/activity-feed'

const meta = {
	title: 'Organisms/Activity feed',
	component: ActivityFeed,
	parameters: { layout: 'padded' },
	argTypes: {
		gap: { control: 'text', table: { category: 'knobs' } },
		glyphSize: { control: 'text', table: { category: 'knobs' } },
		maxHeight: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ActivityFeed>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
	{
		key: 'e1',
		glyph: '✍',
		ink: '#8a4ba8',
		line: (
			<>
				<strong>Noor</strong> created <em>The Working Charter</em>
			</>
		),
		time: '2m ago',
	},
	{
		key: 'e2',
		glyph: '⬆',
		ink: '#005682',
		line: (
			<>
				<strong>Ada</strong> uploaded <em>grant-brief.pdf</em>
			</>
		),
		time: '18m ago',
	},
	{
		key: 'e3',
		glyph: '🐝',
		ink: '#cc6a00',
		line: (
			<>
				<strong>Kai</strong> joined the hive
			</>
		),
		time: '1h ago',
	},
	{
		key: 'e4',
		glyph: '📌',
		ink: '#43913a',
		line: (
			<>
				<strong>Sam</strong> pinned <em>Roadmap draft</em>
			</>
		),
		time: 'yesterday',
	},
]

export const Playground: Story = {
	args: { label: 'Hive activity', items: ITEMS },
	render: (args) => (
		<div style={{ width: '340px' }}>
			<ActivityFeed {...args} />
		</div>
	),
}

export const Empty: Story = {
	args: { label: 'Hive activity', items: [] },
	render: (args) => (
		<div style={{ width: '340px' }}>
			<ActivityFeed
				{...args}
				empty={() => (
					<EmptyState glyph={() => <>🌱</>} title="Nothing yet" hint="Activity will appear here as the hive comes alive." />
				)}
			/>
		</div>
	),
}
