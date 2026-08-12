/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { RadialMenu } from '../../src/radial-menu'
import { ColorTreatmentStory } from './color-treatment-story'

const glyph = (label: string) => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
		<circle cx="12" cy="12" r="8" />
		<text x="12" y="16" text-anchor="middle" font-size="9" fill="currentColor" stroke="none">
			{label}
		</text>
	</svg>
)

const meta = {
	title: 'Primitives/RadialMenu',
	component: RadialMenu,
} satisfies Meta<typeof RadialMenu>

export default meta
type Story = StoryObj<typeof meta>

export const BottomBarFan: Story = {
	args: { id: 'story-radial', items: [] },
	render: () => (
		<div style={{ display: 'grid', 'place-items': 'end center', 'min-height': '70vh' }}>
			<RadialMenu
				id="story-radial"
				label="Places"
				items={[
					{ id: 'hub', label: 'Hub', icon: glyph('H'), onSelect: () => {} },
					{ id: 'insights', label: 'Insights', icon: glyph('I'), onSelect: () => {} },
					{ id: 'events', label: 'Events', icon: glyph('E'), onSelect: () => {} },
					{ id: 'reach', label: 'Reach', icon: glyph('R'), onSelect: () => {} },
					{ id: 'shallows', label: 'Shallows', icon: glyph('S'), onSelect: () => {} },
				]}
			>
				<span
					style={{
						display: 'grid',
						'place-items': 'center',
						width: '3.2rem',
						height: '3.2rem',
						'border-radius': '999px',
						background: 'var(--color-primary-soft)',
						'box-shadow': '0 0 0 1px var(--color-border-strong)',
					}}
				>
					{glyph('🌍')}
				</span>
			</RadialMenu>
		</div>
	),
}

export const DownwardFan: Story = {
	args: { id: 'story-radial-down', items: [] },
	render: () => (
		<div style={{ display: 'grid', 'place-items': 'start center', 'min-height': '60vh' }}>
			<RadialMenu
				id="story-radial-down"
				label="Actions"
				direction="down"
				sweep={120}
				radius={5}
				items={[
					{ id: 'a', label: 'One', icon: glyph('1'), onSelect: () => {} },
					{ id: 'b', label: 'Two', icon: glyph('2'), onSelect: () => {} },
					{ id: 'c', label: 'Three', icon: glyph('3'), onSelect: () => {} },
				]}
			>
				<span style={{ padding: '0.5rem 1rem' }}>Open ▾</span>
			</RadialMenu>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	args: { id: 'axis-radial', items: [] },
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => (
		<RadialMenu
			id={`axis-radial-${colorBase}-${colorLevel}-${variant}`}
			label={`${colorBase} actions`}
			items={[
				{ id: 'one', label: 'One', icon: glyph('1'), onSelect: () => {} },
				{ id: 'two', label: 'Two', icon: glyph('2'), onSelect: () => {} },
			]}
		>
			<span data-ui-color-base={colorBase} data-ui-color-level={colorLevel} data-ui-color-variant={variant} style={{ display: 'grid', 'place-items': 'center', width: '38px', height: '38px', 'border-radius': '999px', background: 'var(--ui-surface)', color: 'var(--ui-ink)', 'box-shadow': 'inset 0 0 0 1px var(--ui-border)' }}>
				{glyph('⋯')}
			</span>
		</RadialMenu>
	)} />,
}
