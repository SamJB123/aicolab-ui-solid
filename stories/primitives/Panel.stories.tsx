/** @jsxImportSource @solidjs/web */
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import {
	AvatarStack,
	Button,
	Chip,
	Counter,
	Eyebrow,
	Meter,
	Panel,
	Rule,
	Sparkline,
} from '../../src/primitives'
import { ColorTreatmentStory } from './color-treatment-story'

const meta = {
	title: 'Primitives/Panel',
	component: Panel,
	args: { title: 'Sessions this week' },
} satisfies Meta<typeof Panel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		title: 'Sessions this week',
		kicker: 'Booked across all rooms',
		children: 'Twelve sessions are scheduled, four of them recurring.',
	},
}

export const IndexActionGlow: Story = {
	name: 'Index, action slot, glow',
	args: {
		index: '01',
		title: 'Occupancy',
		kicker: 'Rolling 7-day average',
		glow: true,
		action: () => <Button variant="ghost">Export</Button>,
		children: 'Peak load lands on Wednesday afternoons.',
	},
}

export const CompactDensity: Story = {
	name: 'Density knob (data-density="compact")',
	render: () => (
		<div
			style={{
				display: 'grid',
				'grid-template-columns': '1fr 1fr',
				gap: '16px',
				'align-items': 'start',
			}}
		>
			<Panel title="Cozy (default)" kicker="No knob set">
				Default 20px padding, 19px title.
			</Panel>
			<div data-density="compact">
				<Panel title="Compact" kicker='data-density="compact" on an ancestor'>
					Subtree-wide density: 14px padding, 16px title.
				</Panel>
			</div>
		</div>
	),
}

export const ComposedDashboardCard: Story = {
	name: 'Composed: dashboard card',
	render: () => (
		<div style={{ 'max-width': '420px' }}>
			<Panel
				index="03"
				title="Studio occupancy"
				kicker="Live across both floors"
				glow
				action={() => <Button variant="solid">Book</Button>}
			>
				<div style={{ display: 'grid', gap: '14px' }}>
					<div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
						<Chip tone="live">live</Chip>
						<Chip tone="accent">peak hours</Chip>
						<Chip>floor 2</Chip>
					</div>
					<div style={{ display: 'flex', 'align-items': 'baseline', gap: '10px' }}>
						<Counter value={87} format={(n) => `${Math.round(n)}%`} class="font-data" />
						<Eyebrow>capacity</Eyebrow>
					</div>
					<Meter value={87} max={100} fillColor="var(--color-primary)" />
					<Sparkline data={[12, 18, 14, 22, 30, 26, 38, 34, 41, 39, 47, 52]} />
					<Rule label="On site" />
					<AvatarStack
						people={[
							{ name: 'Ada Lovelace', color: '#a06f1c' },
							{ name: 'Grace Hopper', color: '#5aa179' },
							{ name: 'Joan Clarke', color: '#b46a55' },
							{ name: 'Mary Jackson', color: '#7286b8' },
							{ name: 'Katherine Johnson', color: '#9a6fb8' },
							{ name: 'Dorothy Vaughan', color: '#5f8f8a' },
						]}
						ring="var(--color-base-100)"
					/>
				</div>
			</Panel>
		</div>
	),
}

export const ThreeAxes: Story = {
	name: 'Color base × level × variant',
	render: () => <ColorTreatmentStory render={({ colorBase, colorLevel, variant }) => (
		<Panel
			colorBase={colorBase}
			colorLevel={colorLevel}
			variant={variant}
			index="01"
			title="Gallery activity"
			kicker="Live specimen"
			glow
		>
			Current occupancy 68%
		</Panel>
	)} />,
}
