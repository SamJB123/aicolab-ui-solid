/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import type { YMD } from '../../src/calendar'
import { DatePicker } from '../../src/pickers'
import { treatmentArgTypes } from '../primitives/color-treatment-story'

const meta = {
	title: 'Molecules/Pickers/DatePicker',
	component: DatePicker,
	args: { value: { y: 2026, m: 7, d: 12 }, onChange: fn() },
	argTypes: { ...treatmentArgTypes },
} satisfies Meta<typeof DatePicker>

export default meta

export const Playground: StoryObj<typeof meta> = {
	render: (args) => {
		const [value, setValue] = createSignal<YMD>({ y: 2026, m: 7, d: 12 })
		return (
			<DatePicker
				{...args}
				value={value()}
				onChange={setValue}
			/>
		)
	},
}
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
	render: () => {
		const [date, setDate] = createSignal<YMD>({ y: 2026, m: 7, d: 12 })
		return <DatePicker value={date()} onChange={setDate} />
	},
}

export const FixedToday: Story = {
	name: 'Overridden "today" ring',
	render: () => {
		const [date, setDate] = createSignal<YMD>({ y: 2026, m: 7, d: 12 })
		return <DatePicker value={date()} onChange={setDate} today={{ y: 2026, m: 7, d: 9 }} />
	},
}
