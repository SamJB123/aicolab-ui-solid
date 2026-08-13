/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Atoms/Button',
	component: Button,
	argTypes: {
		colorBase: {
			control: 'select',
			options: ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
		},
		colorLevel: { control: 'select', options: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
		variant: { control: 'radio', options: ['solid', 'soft', 'outline', 'ghost', 'text'] },
		radius: { control: 'text', table: { category: 'knobs' } },
		padBlock: { control: 'text', table: { category: 'knobs' } },
		padInline: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		fontSize: { control: 'text', table: { category: 'knobs' } },
		hoverBorder: { control: 'text', table: { category: 'knobs' } },
		focusRing: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		children: 'Adjust me in Controls',
		colorBase: 'primary',
		colorLevel: 500,
		variant: 'solid',
		radius: 'var(--r-pill)',
		padBlock: '8px',
		padInline: '16px',
		gap: '8px',
		fontSize: 'var(--t-sm)',
		disabled: false,
		pressed: false,
	},
}

export const Primary: Story = {
	args: { colorBase: 'primary', colorLevel: 500, variant: 'solid', children: 'Join the session' },
}

export const Ghost: Story = {
	args: { variant: 'ghost', children: 'View details' },
}

export const Disabled: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px' }}>
			<Button variant="solid" disabled>
				Primary disabled
			</Button>
			<Button variant="ghost" disabled>Ghost disabled</Button>
		</div>
	),
}

export const AllVariants: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '10px', 'align-items': 'center' }}>
			<Button variant="solid">Primary</Button>
			<Button colorBase="success" variant="soft">Success</Button>
			<Button colorBase="warning" colorLevel={600} variant="outline">Warning</Button>
			<Button colorBase="error" variant="text">Error</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="solid" disabled>
				Primary disabled
			</Button>
			<Button variant="ghost" disabled>Ghost disabled</Button>
		</div>
	),
}

export const KnobContract: Story = {
	name: 'Knob contract (typed attr() world)',
	render: () => {
		const [compact, setCompact] = createSignal(false)
		return (
			<div style={{ display: 'grid', gap: '0.75rem', 'justify-items': 'start' }}>
				<Button radius="var(--r-sm)" padInline="1.4rem">
					Square-ish, roomy
				</Button>
				<Button fontSize="var(--t-xs)" padBlock="5px" gap="4px" variant="outline">
					Compact metrics
				</Button>
				<Button hoverBorder="var(--color-accent)" focusRing="var(--color-accent)" variant="soft">
					Accent hover ring
				</Button>
				<Button variant="text" padInline="12px">
					Text variant, widened from its 4px context default
				</Button>
				<Button variant="outline" pressed={compact()} onClick={() => setCompact(!compact())}>
					Toggle density
				</Button>
				<Button
					radius={compact() ? 'var(--r-xs)' : 'var(--r-pill)'}
					padBlock={compact() ? '4px' : '10px'}
					padInline={compact() ? '10px' : '20px'}
					fontSize={compact() ? 'var(--t-xs)' : 'var(--t-sm)'}
				>
					Signal-driven metrics
				</Button>
			</div>
		)
	},
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => (
		<ColorTreatmentStory
			render={({ colorBase, colorLevel, variant }) => (
				<Button colorBase={colorBase} colorLevel={colorLevel} variant={variant}>{colorBase}</Button>
			)}
		/>
	),
}
