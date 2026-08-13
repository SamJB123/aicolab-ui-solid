/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Presence, PresenceSwatch } from '../../src'

const meta = {
	title: 'Atoms/PresenceSwatch',
	component: PresenceSwatch,
	argTypes: {
		size: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof PresenceSwatch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		identity: 'ada@example.org',
		size: '0.75rem',
	},
	render: (args) => (
		<Presence>
			<div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
				<PresenceSwatch {...args} />
				<PresenceSwatch {...args} identity="grace@example.org" />
				<PresenceSwatch {...args} identity="joan@example.org" />
			</div>
		</Presence>
	),
}
