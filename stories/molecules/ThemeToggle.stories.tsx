/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Panel, ThemeToggle } from '../../src'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/ThemeToggle',
	component: ThemeToggle,
	parameters: { layout: 'centered' },
	argTypes: {
		...treatmentArgTypes,
		size: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		ring: { control: 'text', table: { category: 'knobs' } },
		hoverSurface: { control: 'text', table: { category: 'knobs' } },
		hoverInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: { storageKey: 'ui-solid:storybook-theme' },
}

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
