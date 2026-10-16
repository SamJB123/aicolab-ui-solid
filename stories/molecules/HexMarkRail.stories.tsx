/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { HexMarkRail, type HexMarkRailItem } from '../../src/molecules/hex-mark-rail'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const icon = (paths: string) => () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" innerHTML={paths} />
)

const PLACES: HexMarkRailItem[] = [
	{ id: 'hive', label: 'Hive', icon: icon('<path d="M12 3l7 4v8l-7 4-7-4V7z"/><path d="M12 8.5l3.5 2v4L12 16.5l-3.5-2v-4z"/>') },
	{ id: 'insights', label: 'Insights', icon: icon('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.3 1 2.5h6c0-1.2.3-1.9 1-2.5A6 6 0 0 0 12 3z"/>') },
	{ id: 'bridge', label: 'Insight Bridge', icon: icon('<path d="M3 17h18"/><path d="M4 17c1.5-6.5 14.5-6.5 16 0"/><path d="M8 17v-4.2M12 17v-5.6M16 17v-4.2"/>') },
	{ id: 'alliance', label: 'Alliance', icon: icon('<path d="M7 4h8l4 4v12H7z"/><path d="M15 4v4h4"/><path d="M9.5 14.5l2 2 3.5-4"/>') },
	{ id: 'events', label: 'Events', icon: icon('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>') },
]

const meta = {
	title: 'Molecules/HexMarkRail',
	component: HexMarkRail,
	parameters: { layout: 'fullscreen' },
	argTypes: {
		...treatmentArgTypes,
		open: { control: 'boolean' },
		openWidth: { control: 'text', table: { category: 'knobs' } },
		closedWidth: { control: 'text', table: { category: 'knobs' } },
		markSize: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof HexMarkRail>

export default meta
type Story = StoryObj<typeof meta>

function Rail(props: Omit<Parameters<typeof HexMarkRail>[0], 'items' | 'label' | 'onSelect' | 'currentId'>) {
	const [current, setCurrent] = createSignal('insights')
	return (
		<div style={{ height: '32rem', display: 'flex', background: 'var(--color-base-200)' }}>
			<HexMarkRail
				{...props}
				label="Places"
				items={PLACES}
				currentId={current()}
				onSelect={setCurrent}
				head={<strong style={{ 'font-family': 'var(--font-display)' }}>AI</strong>}
				foot={<span style={{ 'font-size': 'var(--t-xs)' }}>Sam</span>}
			/>
		</div>
	)
}

/* The full anatomy: head, five marks, foot; the current place lit. Toggle
   `open` to see the names come and go. */
export const Playground: Story = {
	args: { open: false, items: PLACES, label: 'Places', onSelect: () => undefined },
	render: (args) => <Rail open={args.open} colorBase={args.colorBase} colorLevel={args.colorLevel} variant={args.variant} />,
}

export const Open: Story = {
	args: { open: true, items: PLACES, label: 'Places', onSelect: () => undefined },
	render: () => <Rail open />,
}

/* Two rails side by side, the way a cascade is built: the first closed to
   marks, the second open with names. */
export const Cascade: Story = {
	args: { items: PLACES, label: 'Places', onSelect: () => undefined },
	render: () => (
		<div style={{ height: '32rem', display: 'flex', background: 'var(--color-base-200)' }}>
			<HexMarkRail label="Places" items={PLACES} currentId="bridge" onSelect={() => undefined} />
			<HexMarkRail
				label="In Insight Bridge"
				open
				items={[
					{ id: 'one-basin', label: 'One Basin' },
					{ id: 'second-chair', label: 'Second Chair' },
					{ id: 'watchful', label: 'Watchful State' },
				]}
				currentId={null}
				onSelect={() => undefined}
			/>
		</div>
	),
}
