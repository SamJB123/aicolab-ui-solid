/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Eyebrow } from '../../src/primitives'

const meta = {
	title: 'Primitives/Eyebrow',
	component: Eyebrow,
} satisfies Meta<typeof Eyebrow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: { children: 'Commons · Live' },
}

export const AccentInk: Story = {
	name: 'Accent ink (ui-accent-ink)',
	args: { children: 'Model for change', class: 'ui-accent-ink' },
}
