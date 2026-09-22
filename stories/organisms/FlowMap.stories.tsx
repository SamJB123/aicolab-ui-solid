/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { Button } from '../../src/atoms/button'
import {
	FlowMap,
	type FlowMapEdge,
	type FlowMapFooter,
	type FlowMapNode,
	type FlowMapRail,
} from '../../src/organisms/flow-map'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

/** The Optimal Care Pathway's steps schematic: seven steps, a branch, a note, a
 *  spanning rail and the principles band. */
const BASE: FlowMapNode[] = [
	{ id: 's1', badge: '1', label: 'Prevention, screening and early detection', column: 1, row: 1, href: '#s1', signal: { level: 'success', label: 'Nothing open' } },
	{ id: 's2', badge: '2', label: 'Presentation, initial investigations and referral', column: 1, row: 2, href: '#s2', signal: { level: 'warning', count: 3, label: '3 open items' } },
	{ id: 's3', badge: '3', label: 'Diagnosis, staging and treatment planning', column: 1, row: 3, href: '#s3', signal: { level: 'error', count: 1, label: 'Changes requested' } },
	{ id: 's4', badge: '4', label: 'Treatment', column: 1, row: 4, href: '#s4' },
	{ id: 's5', badge: '5', label: 'Care after initial treatment and recovery', column: 1, row: 5, href: '#s5' },
	{ id: 's6', badge: '6', label: 'Managing residual, recurrent or metastatic disease', column: 2, row: 4, rowSpan: 2, href: '#s6', signal: { level: 'warning', count: 7, label: '7 open items' } },
	{ id: 's7', badge: '7', label: 'End-of-life care', column: 2, row: 6, href: '#s7' },
	{ id: 'life', label: 'Life after cancer', column: 1, row: 6, kind: 'note' },
]
const STEPS: FlowMapNode[] = BASE.map((node) => ({
	...node,
	preview: () => (
		<div style={{ display: 'grid', gap: '0.4rem' }}>
			<strong>{node.label}</strong>
			<span>Care points, timeframes and open items for this step appear here.</span>
		</div>
	),
}))

const EDGES: FlowMapEdge[] = [
	{ from: 's1', to: 's2', route: 'down' },
	{ from: 's2', to: 's3', route: 'down' },
	{ from: 's3', to: 's4', route: 'down' },
	{ from: 's4', to: 's5', route: 'down' },
	{ from: 's5', to: 'life', route: 'down' },
	{ from: 's3', to: 's6', route: 'elbow' },
	{ from: 's4', to: 's6', route: 'side', kind: 'both' },
	{ from: 's5', to: 's6', route: 'side', kind: 'both' },
	{ from: 's6', to: 's7', route: 'down' },
]

const RAIL: FlowMapRail = {
	label: 'Supportive care',
	preview: () => <span>Supportive care spans every step of the pathway.</span>,
}

const FOOTER: FlowMapFooter = {
	label: 'Underpinned by the Principles for Optimal Cancer Care',
	items: [
		'Equity',
		'Person-centred care',
		'Safe and quality care',
		'Multidisciplinary care',
		'Supportive care',
		'Navigation and care coordination',
		'Communication',
		'Research and clinical trials',
	].map((label, i) => ({ id: `p${i + 1}`, label, href: `#p${i + 1}`, icon: () => <>◐</> })),
}

const meta = {
	title: 'Organisms/FlowMap',
	component: FlowMap,
	argTypes: {
		...treatmentArgTypes,
		interactive: { control: 'boolean' },
		nodeRadius: { control: 'text', table: { category: 'knobs' } },
		gap: { control: 'text', table: { category: 'knobs' } },
		discSize: { control: 'text', table: { category: 'knobs' } },
		connectorInk: { control: 'text', table: { category: 'knobs' } },
		connectorWidth: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof FlowMap>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
	args: {
		label: 'Steps of the pathway',
		nodes: STEPS,
		edges: EDGES,
		rail: RAIL,
		footer: FOOTER,
		caption:
			'Optimal care is not always linear and is shaped by cancer type, stage of disease, and the person’s circumstances, needs and preferences.',
		currentId: 's3',
		interactive: true,
	},
	render: (args) => (
		<div style={{ width: 'min(52rem, 92vw)' }}>
			<FlowMap {...args} />
		</div>
	),
}

export const CurrentStep: Story = {
	name: 'Current step (ring glides)',
	args: { label: 'Steps of the pathway', nodes: STEPS, edges: EDGES, rail: RAIL },
	render: (args) => {
		const [current, setCurrent] = createSignal('s1')
		return (
			<div style={{ display: 'grid', gap: '1rem', width: 'min(52rem, 92vw)' }}>
				<div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap' }}>
					{STEPS.filter((s) => s.badge).map((s) => (
						<Button variant={current() === s.id ? 'solid' : 'soft'} onClick={() => setCurrent(s.id)}>
							Step {s.badge}
						</Button>
					))}
				</div>
				<FlowMap {...args} currentId={current()} />
			</div>
		)
	},
}

export const Narrow: Story = {
	name: 'Narrow container (one column, rail as band)',
	args: { label: 'Steps of the pathway', nodes: STEPS, edges: EDGES, rail: RAIL, footer: FOOTER },
	render: (args) => (
		<div style={{ width: '22rem' }}>
			<FlowMap {...args} />
		</div>
	),
}

export const Published: Story = {
	name: 'Published (not interactive)',
	args: { label: 'Steps of the pathway', nodes: STEPS, edges: EDGES, rail: RAIL, footer: FOOTER, interactive: false },
	render: (args) => (
		<div style={{ width: 'min(52rem, 92vw)' }}>
			<FlowMap {...args} />
		</div>
	),
}
