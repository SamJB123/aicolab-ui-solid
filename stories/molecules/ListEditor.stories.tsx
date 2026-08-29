/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { ListEditor } from '../../src/molecules/list-editor'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

interface Question {
	id: string
	text: string
}

const QUESTIONS: Question[] = [
	{ id: 'q1', text: 'What are the objects of the Act working well?' },
	{ id: 'q2', text: 'Which entitlement settings should change?' },
]

const meta = {
	title: 'Molecules/ListEditor',
	component: ListEditor,
	parameters: { layout: 'padded' },
	argTypes: {
		...treatmentArgTypes,
		gap: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
	},
} satisfies Meta<typeof ListEditor>

export default meta
type Story = StoryObj<typeof meta>

const fieldStyle = { padding: '0.35rem 0.5rem', font: 'inherit', border: '1px solid var(--color-border)', 'border-radius': '6px', width: '100%', 'box-sizing': 'border-box' as const }

export const Questions: Story = {
	args: { label: 'Consultation questions', items: QUESTIONS, onChange: () => {}, getKey: (q) => (q as Question).id, renderItem: () => null },
	render: () => {
		const [items, setItems] = createSignal(QUESTIONS)
		return (
			<div style={{ width: '640px' }}>
				<ListEditor<Question>
					label="Consultation questions"
					items={items()}
					onChange={setItems}
					getKey={(q) => q.id}
					createItem={() => ({ id: `q${Date.now()}`, text: '' })}
					addLabel="Add question"
					emptyMessage="No questions yet."
					renderItem={(q, update) => (
						<>
							<input style={{ ...fieldStyle, width: '6rem' }} value={q.id} aria-label="Question id" onChange={(e) => update({ ...q, id: e.currentTarget.value })} />
							<textarea style={fieldStyle} rows={2} value={q.text} aria-label="Question text" onChange={(e) => update({ ...q, text: e.currentTarget.value })} />
						</>
					)}
				/>
			</div>
		)
	},
}
