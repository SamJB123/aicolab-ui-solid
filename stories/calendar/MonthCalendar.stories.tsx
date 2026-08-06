/** @jsxImportSource @solidjs/web */
import { createSignal, Show } from 'solid-js'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { addMonths, MonthCalendar, sameDay, todayYMD, type YM, type YMD } from '../../src/calendar'
import { StatusDot } from '../../src/primitives'

const meta = {
	title: 'Calendar/MonthCalendar',
	component: MonthCalendar,
	args: { month: { y: 2026, m: 7 }, onMonthChange: fn() },
} satisfies Meta<typeof MonthCalendar>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
	name: 'Full calendar (navigate + select)',
	render: () => {
		const t = todayYMD()
		const [month, setMonth] = createSignal<YM>({ y: t.y, m: t.m })
		const [selected, setSelected] = createSignal<YMD>(t)
		return (
			<div style={{ 'max-width': '520px' }}>
				<MonthCalendar
					month={month()}
					onMonthChange={setMonth}
					selected={selected()}
					onSelectDay={setSelected}
				/>
			</div>
		)
	},
}

export const WithDaySlot: Story = {
	name: 'Day slot (event dots)',
	render: () => {
		const t = todayYMD()
		const [month, setMonth] = createSignal<YM>({ y: t.y, m: t.m })
		const [selected, setSelected] = createSignal<YMD>(t)
		const events: YMD[] = [
			{ y: t.y, m: t.m, d: 3 },
			{ y: t.y, m: t.m, d: 12 },
			{ y: t.y, m: t.m, d: 12 },
			{ y: t.y, m: t.m, d: 21 },
		]
		return (
			<div style={{ 'max-width': '520px' }}>
				<MonthCalendar
					month={month()}
					onMonthChange={setMonth}
					selected={selected()}
					onSelectDay={setSelected}
					transitionName="cal-grid-slots"
					day={(date) => (
						<Show when={events.some((e) => sameDay(e, date()))}>
							<span style={{ display: 'inline-flex', gap: '3px', 'margin-top': '4px' }}>
								<StatusDot status={{ color: 'var(--c-accent)' }} size={5} />
							</span>
						</Show>
					)}
				/>
			</div>
		)
	},
}

export const Clamped: Story = {
	name: 'Clamped navigation (±1 month)',
	render: () => {
		const t = todayYMD()
		const now: YM = { y: t.y, m: t.m }
		const [month, setMonth] = createSignal<YM>(now)
		return (
			<div style={{ 'max-width': '520px' }}>
				<MonthCalendar
					month={month()}
					onMonthChange={setMonth}
					minMonth={addMonths(now, -1)}
					maxMonth={addMonths(now, 1)}
					transitionName="cal-grid-clamped"
				/>
			</div>
		)
	},
}

export const FixedWorkspaceClock: Story = {
	name: 'Overridden "today" (workspace clock)',
	render: () => {
		const [month, setMonth] = createSignal<YM>({ y: 2026, m: 5 })
		const [selected, setSelected] = createSignal<YMD>({ y: 2026, m: 5, d: 18 })
		return (
			<div style={{ 'max-width': '520px' }}>
				<MonthCalendar
					month={month()}
					onMonthChange={setMonth}
					selected={selected()}
					onSelectDay={setSelected}
					today={{ y: 2026, m: 5, d: 15 }}
					transitionName="cal-grid-fixed"
				/>
			</div>
		)
	},
}
