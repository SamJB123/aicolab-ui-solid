/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { HoldButton } from '../../src'

const meta = {
	title: 'Atoms/HoldButton',
	component: HoldButton,
	argTypes: {
		colorBase: {
			control: 'select',
			options: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		},
		colorLevel: { control: 'select', options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
		variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
		size: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		focusRing: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof HoldButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		children: 'Hold',
		colorBase: 'warning',
		size: '4.25rem',
		radius: '50%',
		onPressedChange: () => {},
	},
	render: (args) => {
		const [pressed, setPressed] = createSignal(false)
		return (
			<div style={{ display: 'flex', gap: '1rem', 'align-items': 'center' }}>
				<HoldButton {...args} onPressedChange={setPressed} />
				<span role="status">{pressed() ? 'Holding…' : 'Idle'}</span>
			</div>
		)
	},
}
