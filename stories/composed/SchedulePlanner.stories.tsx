/** @jsxImportSource @solidjs/web */
// The scheduling surface composed end-to-end: calendar + date/time pickers
// + controls inside a Panel — the COMMONS dashboard shape these components
// were extracted from.
import { createSignal, Show } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import {
	fmtTime,
	longWeekday,
	MonthCalendar,
	sameDay,
	todayYMD,
	type YM,
	type YMD,
} from '../../src/calendar'
import { Field, Segmented } from '../../src/controls'
import { DatePicker, TimePicker } from '../../src/pickers'
import { Button, Chip, Panel, Rule, StatusDot } from '../../src/primitives'

const meta = {
	title: 'Organisms/Compositions/Schedule planner',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = {
	name: 'Calendar + pickers + controls',
	render: () => {
		const t = todayYMD()
		const [month, setMonth] = createSignal<YM>({ y: t.y, m: t.m })
		const [date, setDate] = createSignal<YMD>(t)
		const [start, setStart] = createSignal(9 * 60 + 30)
		const [room, setRoom] = createSignal<'studio-a' | 'studio-b' | 'commons'>('studio-a')
		return (
			<div
				style={{
					display: 'grid',
					'grid-template-columns': 'minmax(0, 520px) minmax(280px, 360px)',
					gap: '20px',
					'align-items': 'start',
				}}
			>
				<MonthCalendar
					month={month()}
					onMonthChange={setMonth}
					selected={date()}
					onSelectDay={setDate}
					transitionName="cal-grid-planner"
					day={(d) => (
						<Show when={sameDay(d(), date())}>
							<StatusDot status={{ color: 'var(--color-primary)' }} size={5} />
						</Show>
					)}
				/>
				<Panel
					index="02"
					title="New session"
					kicker={`${longWeekday(date().y, date().m, date().d)} · ${fmtTime(start())}`}
					action={() => <Chip colorBase="primary" variant="soft">draft</Chip>}
				>
					<div style={{ display: 'grid', gap: '16px' }}>
						<Field label="Date">
							<DatePicker value={date()} onChange={setDate} />
						</Field>
						<Field label="Start">
							<TimePicker value={start()} onChange={setStart} />
						</Field>
						<Field label="Room">
							<Segmented
								options={[
									{ id: 'studio-a', label: 'Studio A' },
									{ id: 'studio-b', label: 'Studio B' },
									{ id: 'commons', label: 'Commons' },
								]}
								value={room()}
								onChange={setRoom}
							/>
						</Field>
						<Rule />
						<Button variant="solid">Book session</Button>
					</div>
				</Panel>
			</div>
		)
	},
}
