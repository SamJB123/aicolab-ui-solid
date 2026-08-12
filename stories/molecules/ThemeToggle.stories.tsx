/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Panel, ThemeToggle } from '../../src'

const meta = {
	title: 'Molecules/ThemeToggle',
	component: ThemeToggle,
	parameters: { layout: 'centered' },
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
	render: () => (
		<Panel title="Document theme" colorBase="primary" variant="outline">
			<div style={{ display: 'flex', 'align-items': 'center', gap: '0.75rem' }}>
				<ThemeToggle storageKey="ui-solid:storybook-theme" />
				<span>Activate to cycle Auto → Light → Dark.</span>
			</div>
		</Panel>
	),
}
