/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { TreeEditor, type TreeEditorNode } from '../../src/molecules/tree-editor'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/TreeEditor',
	component: TreeEditor,
	argTypes: {
		...treatmentArgTypes,
		label: { control: 'text', description: 'Accessible label for the editor group.' },
		levels: { control: 'object', description: 'Names each level and caps the tree to the number of names.' },
		maxDepth: { control: { type: 'number', min: 1, step: 1 }, description: 'Depth cap used when `levels` is omitted.' },
		addLabel: { control: 'text' },
		disabled: { control: 'boolean' },
		gap: { control: 'text', table: { category: 'knobs' } },
		indent: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'A controlled editor for recursive `{ id, name, children }` trees. It supports renaming, adding, removing, sibling reordering and moving nodes between levels. Drag near a row edge to place before/after, or over its centre to make the dragged node a child. The arrow buttons provide keyboard-accessible alternatives. Use `levels` for named depths or `maxDepth` for generic Level 1/2/3 labels.',
			},
		},
	},
} satisfies Meta<typeof TreeEditor>

export default meta
type Story = StoryObj<typeof meta>

const NODES: TreeEditorNode[] = [
	{
		id: 'objects',
		name: 'Objects and principles',
		children: [
			{ id: 'objects-1', name: 'Purpose of the Act', children: [{ id: 'objects-1-1', name: 'Sustainable management' }, { id: 'objects-1-2', name: 'Cultural values' }] },
			{ id: 'objects-2', name: 'Guiding principles' },
		],
	},
	{ id: 'entitlements', name: 'Entitlements and allocation', children: [{ id: 'ent-1', name: 'Water shares' }] },
]

export const Playground: Story = {
	args: {
		label: 'Tag vocabulary',
		nodes: NODES,
		maxDepth: 3,
		addLabel: 'Add top-level tag',
		disabled: false,
		onChange: () => {},
	},
	render: (args) => {
		const [nodes, setNodes] = createSignal(NODES)
		return (
			<div style={{ width: '640px', display: 'grid', gap: '0.75rem' }}>
				<p style={{ margin: 0, color: 'var(--color-base-content-muted)', 'font-size': '0.9rem' }}>
					Drag by ⋮⋮: use a row edge to reorder, its centre to make a child, or the bottom target to move to the top level.
				</p>
				<TreeEditor
					label={args.label}
					nodes={nodes()}
					onChange={setNodes}
					levels={args.levels}
					maxDepth={args.maxDepth}
					addLabel={args.addLabel}
					disabled={args.disabled}
					colorBase={args.colorBase}
					colorLevel={args.colorLevel}
					variant={args.variant}
					gap={args.gap}
					indent={args.indent}
					radius={args.radius}
				/>
			</div>
		)
	},
}

export const NamedLevels: Story = {
	args: { label: 'Tag vocabulary', nodes: NODES, onChange: () => {} },
	render: () => {
		const [nodes, setNodes] = createSignal(NODES)
		return (
			<div style={{ width: '640px' }}>
				<TreeEditor label="Tag vocabulary" nodes={nodes()} levels={['Tier 1', 'Tier 2', 'Tier 3']} onChange={setNodes} />
			</div>
		)
	},
}

export const GenericDepthLabels: Story = {
	name: 'Generic levels · max depth 2',
	args: { label: 'Product categories', nodes: NODES, onChange: () => {} },
	render: () => {
		const [nodes, setNodes] = createSignal<TreeEditorNode[]>([
			{ id: 'hardware', name: 'Hardware', children: [{ id: 'laptops', name: 'Laptops' }] },
			{ id: 'software', name: 'Software', children: [{ id: 'productivity', name: 'Productivity' }] },
		])
		return (
			<div style={{ width: '560px' }}>
				<TreeEditor label="Product categories" nodes={nodes()} maxDepth={2} addLabel="Add category" onChange={setNodes} />
			</div>
		)
	},
}

export const EmptyTree: Story = {
	args: { label: 'Organisation structure', nodes: [], onChange: () => {} },
	render: () => {
		const [nodes, setNodes] = createSignal<TreeEditorNode[]>([])
		return (
			<div style={{ width: '560px' }}>
				<TreeEditor label="Organisation structure" nodes={nodes()} levels={['Division', 'Team', 'Role']} addLabel="Add division" onChange={setNodes} />
			</div>
		)
	},
}

export const Disabled: Story = {
	args: { label: 'Locked taxonomy', nodes: NODES, onChange: () => {} },
	render: () => (
		<div style={{ width: '640px' }}>
			<TreeEditor label="Locked taxonomy" nodes={NODES} levels={['Category', 'Topic', 'Tag']} onChange={() => {}} disabled />
		</div>
	),
}
