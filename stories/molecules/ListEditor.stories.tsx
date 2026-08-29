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
	argTypes: {
		...treatmentArgTypes,
		label: { control: 'text', description: 'Accessible label for the editor group.' },
		addLabel: { control: 'text' },
		emptyMessage: { control: 'text' },
		reorder: { control: 'boolean' },
		disabled: { control: 'boolean' },
		gap: { control: 'text', table: { category: 'knobs' } },
		radius: { control: 'text', table: { category: 'knobs' } },
		pad: { control: 'text', table: { category: 'knobs' } },
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'A generic controlled list shell. The caller defines the item type and renders any fields through `renderItem`; ListEditor supplies add, remove, reorder, disabled and empty-state behaviour.',
			},
		},
	},
} satisfies Meta<typeof ListEditor>

export default meta
type Story = StoryObj<typeof meta>

const fieldStyle = { padding: '0.35rem 0.5rem', font: 'inherit', border: '1px solid var(--color-border)', 'border-radius': '6px', width: '100%', 'box-sizing': 'border-box' as const }

export const Playground: Story = {
	args: {
		label: 'Consultation questions',
		items: QUESTIONS,
		onChange: () => {},
		getKey: (question) => (question as Question).id,
		renderItem: () => null,
		createItem: () => ({ id: `q${Date.now()}`, text: '' }),
		addLabel: 'Add question',
		emptyMessage: 'No questions yet.',
		reorder: true,
		disabled: false,
	},
	render: (args) => {
		const [items, setItems] = createSignal(QUESTIONS)
		return (
			<div style={{ width: '640px' }}>
				<ListEditor<Question>
					label={args.label}
					items={items()}
					onChange={setItems}
					getKey={(q) => q.id}
					createItem={() => ({ id: `q${Date.now()}`, text: '' })}
					addLabel={args.addLabel}
					emptyMessage={args.emptyMessage}
					reorder={args.reorder}
					disabled={args.disabled}
					colorBase={args.colorBase}
					colorLevel={args.colorLevel}
					variant={args.variant}
					gap={args.gap}
					radius={args.radius}
					pad={args.pad}
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

interface ContactMethod {
	id: string
	type: 'Email' | 'Phone' | 'Website'
	value: string
}

export const DifferentItemShape: Story = {
	name: 'Arbitrary multi-field records',
	args: { label: 'Contact methods', items: [], onChange: () => {}, getKey: () => '', renderItem: () => null },
	render: () => {
		const [items, setItems] = createSignal<ContactMethod[]>([
			{ id: 'contact-1', type: 'Email', value: 'hello@example.com' },
			{ id: 'contact-2', type: 'Phone', value: '+61 2 5550 1234' },
		])
		return (
			<div style={{ width: '560px' }}>
				<ListEditor<ContactMethod>
					label="Contact methods"
					items={items()}
					onChange={setItems}
					getKey={(item) => item.id}
					createItem={() => ({ id: crypto.randomUUID(), type: 'Email', value: '' })}
					addLabel="Add contact method"
					renderItem={(item, update) => (
						<div style={{ display: 'grid', 'grid-template-columns': '8rem 1fr', gap: '0.5rem' }}>
							<select style={fieldStyle} aria-label="Contact type" value={item.type} onChange={(event) => update({ ...item, type: event.currentTarget.value as ContactMethod['type'] })}>
								<option>Email</option>
								<option>Phone</option>
								<option>Website</option>
							</select>
							<input style={fieldStyle} aria-label={`${item.type} value`} value={item.value} onChange={(event) => update({ ...item, value: event.currentTarget.value })} />
						</div>
					)}
				/>
			</div>
		)
	},
}

export const SimpleItemsWithoutReordering: Story = {
	name: 'Simple items · reorder disabled',
	args: { label: 'Tags', items: [], onChange: () => {}, getKey: () => '', renderItem: () => null },
	render: () => {
		const [items, setItems] = createSignal(['Water policy', 'Community engagement'])
		return (
			<div style={{ width: '420px' }}>
				<ListEditor<string>
					label="Tags"
					items={items()}
					onChange={setItems}
					getKey={(item) => item}
					createItem={() => `New tag ${items().length + 1}`}
					addLabel="Add tag"
					reorder={false}
					renderItem={(item, update) => <input style={fieldStyle} aria-label="Tag" value={item} onChange={(event) => update(event.currentTarget.value)} />}
				/>
			</div>
		)
	},
}

export const EmptyAndDisabled: Story = {
	args: { label: 'Read-only items', items: [], onChange: () => {}, getKey: () => '', renderItem: () => null },
	render: () => (
		<div style={{ display: 'grid', gap: '2rem', width: '420px' }}>
			<ListEditor<string> label="Empty list" items={[]} onChange={() => {}} getKey={(item) => item} renderItem={() => null} emptyMessage="Nothing has been added." />
			<ListEditor<string> label="Read-only items" items={['Locked item']} onChange={() => {}} getKey={(item) => item} renderItem={(item) => <span>{item}</span>} createItem={() => 'New item'} disabled />
		</div>
	),
}
