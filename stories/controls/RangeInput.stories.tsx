/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { RangeInput } from '../../src'

const meta = {
	title: 'Atoms/RangeInput',
	component: RangeInput,
	argTypes: {
		colorBase: {
			control: 'select',
			options: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		},
		colorLevel: { control: 'select', options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
		variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
		accent: { control: 'text', table: { category: 'knobs' } },
		focusRing: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof RangeInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		'aria-label': 'Playground range',
		value: 60,
		accent: 'var(--color-primary)',
	},
}
