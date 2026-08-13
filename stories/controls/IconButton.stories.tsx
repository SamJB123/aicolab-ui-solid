/** @jsxImportSource @solidjs/web */
import { treatmentArgTypes } from '../primitives/color-treatment-story'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { IconButton } from '../../src/controls'

const meta = {
	title: 'Atoms/IconButton',
	component: IconButton,
	args: { label: 'Next month' },
	argTypes: {
		...treatmentArgTypes,
		size: { control: 'text', description: "'sm' | 'md' | 'lg' or a measurement like 27px" },
		radius: { control: 'text', table: { category: 'knobs' } },
		hoverSurface: { control: 'text', table: { category: 'knobs' } },
		hoverInk: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		label: 'Playground',
		children: '✳',
		size: 'md',
		radius: 'var(--r-pill)',
	},
}

export const Default: Story = {
	args: { label: 'Next month', children: '›' },
}

export const Disabled: Story = {
	args: { label: 'Previous month', children: '‹', disabled: true },
}

export const NavigationPair: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '6px' }}>
			<IconButton label="Previous month" disabled>
				‹
			</IconButton>
			<IconButton label="Next month">›</IconButton>
		</div>
	),
}
