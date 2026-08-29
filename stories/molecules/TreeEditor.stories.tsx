/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { TreeEditor, type TreeEditorNode } from '../../src/molecules/tree-editor'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/TreeEditor',
	component: TreeEditor,
	parameters: { layout: 'padded' },
	argTypes: {
		...treatmentArgTypes,
		gap: { control: 'text', table: { category: 'knobs' } },
		indent: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
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
	args: { label: 'Tag vocabulary', nodes: NODES, levels: ['Tier 1', 'Tier 2', 'Tier 3'], onChange: (nodes) => console.log('[tree-editor story]', nodes) },
	render: (args) => <div style={{ width: '640px' }}><TreeEditor {...args} /></div>,
}

export const Interactive: Story = {
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
