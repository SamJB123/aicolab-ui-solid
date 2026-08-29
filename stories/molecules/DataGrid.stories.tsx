/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DataGrid, type DataGridColumn, type DataGridRow } from '../../src/molecules/data-grid'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/DataGrid',
	component: DataGrid,
	parameters: { layout: 'padded' },
	argTypes: {
		...treatmentArgTypes,
		gap: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof DataGrid>

export default meta
type Story = StoryObj<typeof meta>

const COLUMNS: DataGridColumn[] = [
	{ key: 'sector', label: 'Sector', kind: 'select', options: ['Government', 'Industry', 'Individual', 'Community'] },
	{ key: 'region', label: 'Region', kind: 'text' },
	{ key: 'themes', label: 'Themes', kind: 'multi', options: ['Water', 'Land', 'Culture'] },
	{ key: 'document_count', label: 'Docs', kind: 'readonly' },
]

const ROWS: DataGridRow[] = [
	{
		id: 'acme',
		title: 'Acme Pty Ltd',
		subtitle: 'from metadata table',
		cells: {
			sector: { values: ['Industry'], provenance: 'manifest' },
			region: { values: ['North'], provenance: 'human' },
			themes: { values: ['Water', 'Land'], provenance: 'llm_inferred' },
			document_count: { values: ['2'], provenance: 'derived' },
		},
		children: [
			{ id: 'd1', label: 'acme-submission.pdf', detail: '14 pages' },
			{ id: 'd2', label: 'acme-appendix.pdf', detail: '3 pages' },
		],
	},
	{
		id: 'jane',
		title: 'Jane Doe',
		cells: { sector: { values: ['Individual'], provenance: 'manifest' }, document_count: { values: ['1'], provenance: 'derived' } },
		children: [{ id: 'd3', label: 'jane.docx' }],
	},
	{
		id: 'council',
		title: 'Shire Council',
		muted: true,
		cells: { sector: { values: [] }, document_count: { values: ['1'], provenance: 'derived' } },
		children: [{ id: 'd4', label: 'council-letter.pdf' }],
	},
]

export const Playground: Story = {
	args: { label: 'Entities', titleLabel: 'Entity', columns: COLUMNS, rows: ROWS },
	render: (args) => <DataGrid {...args} />,
}

export const Editable: Story = {
	args: { label: 'Entities', columns: COLUMNS, rows: ROWS },
	render: () => {
		const [rows, setRows] = createSignal(ROWS)
		const [selected, setSelected] = createSignal<string[]>([])
		return (
			<DataGrid
				label="Entities"
				titleLabel="Entity"
				columns={COLUMNS}
				rows={rows()}
				selected={selected()}
				onSelect={setSelected}
				onEditCell={(rowId, key, values) => setRows((all) => all.map((r) => (r.id === rowId ? { ...r, cells: { ...r.cells, [key]: { values, provenance: 'human' } } } : r)))}
				onRenameRow={(rowId, title) => setRows((all) => all.map((r) => (r.id === rowId ? { ...r, title } : r)))}
				onToggleMuted={(rowId, muted) => setRows((all) => all.map((r) => (r.id === rowId ? { ...r, muted } : r)))}
				onMoveChild={(childId, toRowId) => console.log('[data-grid story] move', childId, toRowId)}
			/>
		)
	},
}
