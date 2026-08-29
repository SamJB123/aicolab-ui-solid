/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ColumnMapper, type ColumnMapperColumn } from '../../src/molecules/column-mapper'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/ColumnMapper',
	component: ColumnMapper,
	parameters: { layout: 'padded' },
	argTypes: {
		...treatmentArgTypes,
		gap: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ColumnMapper>

export default meta
type Story = StoryObj<typeof meta>

const ROLES = [
	{ value: 'entity_name', label: 'Entity name' },
	{ value: 'entity_id', label: 'Entity id' },
	{ value: 'file', label: 'File name' },
	{ value: 'text', label: 'Inline text' },
	{ value: 'title', label: 'Document title' },
	{ value: 'facet', label: 'Attribute' },
	{ value: 'ignore', label: 'Ignore' },
]

const COLUMNS: ColumnMapperColumn[] = [
	{ column: 'Respondent', samples: ['Acme Pty Ltd', 'Jane Doe', 'Shire Council'], role: 'entity_name', confidence: 1 },
	{ column: 'File', samples: ['acme.pdf', 'jane.docx'], role: 'file', confidence: 1 },
	{ column: 'Stakeholder group', samples: ['Industry', 'Individual', 'Local government'], role: 'facet', target: 'sector', granularity: 'entity', matched: true, unknownValues: ['Local government'], confidence: 0.8 },
	{ column: 'Doc kind', samples: ['response', 'attachment'], role: 'facet', target: 'doc_kind', granularity: 'document', confidence: 0.4 },
	{ column: 'Internal ref', samples: ['A-1', 'A-2'], role: 'ignore', confidence: 0.2 },
]

export const Playground: Story = {
	args: { label: 'Map columns', columns: COLUMNS, roles: ROLES, targets: ['sector', 'region', 'document_role'], onChange: (column, patch) => console.log('[column-mapper story]', column, patch) },
	render: (args) => <ColumnMapper {...args} />,
}

export const Interactive: Story = {
	args: { label: 'Map columns', columns: COLUMNS, roles: ROLES, onChange: () => {} },
	render: () => {
		const [columns, setColumns] = createSignal(COLUMNS)
		return (
			<ColumnMapper
				label="Map columns"
				columns={columns()}
				roles={ROLES}
				targets={['sector', 'region', 'document_role']}
				onChange={(column, patch) => setColumns((all) => all.map((c) => (c.column === column ? { ...c, ...patch } : c)))}
			/>
		)
	},
}
