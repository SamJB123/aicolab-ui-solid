/**
 * Month calendar — the COMMONS schedule view's grid, extracted for any Solid
 * surface that needs a month at a glance (the playground scheduler, the
 * events-zone session picker). Structural pieces only: a month header with
 * clamped, view-transitioned navigation, the weekday row, and the 42-cell
 * grid. What lives INSIDE a day cell (event chips, availability dots) is the
 * consumer's, via the `day` function slot — element JSX in props under `For`
 * would leave unclaimed server DOM on hydration, so the slot is a function on
 * purpose.
 *
 * The date/time helpers here are calendar-plane maths (year/month/day and
 * minutes-since-midnight) with no timezone opinion — a consumer that deals in
 * zoned instants converts to Y/M/D in its zone first.
 */

import type { JSX } from '@solidjs/web'
import { createMemo, For, Show } from 'solid-js'
import { IconButton } from './controls'
import type { ClassProp } from './primitives'
import { withViewTransition } from './vt'

export type YMD = { y: number; m: number; d: number }
export type YM = { y: number; m: number }

export const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Weekday index (0=Sun) for a Y/M/D — timezone-stable via local-midnight. */
export const weekdayOf = (y: number, m: number, d: number) => new Date(y, m, d).getDay()
export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
export const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay()

/** Full weekday name, derived from a Y/M/D. */
export const longWeekday = (y: number, m: number, d: number) =>
	['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekdayOf(y, m, d)]

export const sameDay = (a: YMD, b: YMD) => a.y === b.y && a.m === b.m && a.d === b.d

/** Months since year 0 — the comparable form of a {y, m}. */
export const monthIndex = (v: YM) => v.y * 12 + v.m

export const addMonths = (v: YM, delta: number): YM => {
	const total = monthIndex(v) + delta
	return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 }
}

export const todayYMD = (): YMD => {
	const now = new Date()
	return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() }
}

/** The 6-week grid: 42 cells, leading/trailing blanks as null. */
export const monthCells = (y: number, m: number): (number | null)[] => {
	const blanks = firstWeekday(y, m)
	const days = daysInMonth(y, m)
	return Array.from({ length: 42 }, (_, i) => {
		const d = i - blanks + 1
		return d >= 1 && d <= days ? d : null
	})
}

/** "9:05 AM" from minutes-since-midnight. */
export function fmtTime(min: number): string {
	const h = Math.floor(min / 60)
	const m = min % 60
	const ap = h < 12 ? 'AM' : 'PM'
	const h12 = ((h + 11) % 12) + 1
	return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

export function fmtRange(start: number, dur: number): string {
	if (dur === 0) return fmtTime(start)
	return `${fmtTime(start)} – ${fmtTime(start + dur)}`
}

export function MonthCalendar(props: {
	month: YM
	/** Called inside a view transition — set your month signal here. */
	onMonthChange: (next: YM) => void
	selected?: YMD
	onSelectDay?: (date: YMD) => void
	/** The date ringed as "today" (and the Today button's target). Defaults to
	 *  the real current date — override for demo/workspace clocks. */
	today?: YMD
	/** Inclusive navigation clamps; arrows dim at the edge. */
	minMonth?: YM
	maxMonth?: YM
	/** Default true. The button navigates to `today` and selects it; it hides
	 *  itself if `today` falls outside the min/max range. */
	showTodayButton?: boolean
	/** view-transition-name for the grid (default "cal-grid") — give a second
	 *  calendar on the same page its own name. */
	transitionName?: string
	/** Content of a day cell, under the day number. */
	day?: (date: () => YMD) => JSX.Element
	class?: ClassProp
}) {
	const today = () => props.today ?? todayYMD()
	const cells = createMemo(() => monthCells(props.month.y, props.month.m))

	const inRange = (index: number) =>
		(!props.minMonth || index >= monthIndex(props.minMonth)) &&
		(!props.maxMonth || index <= monthIndex(props.maxMonth))
	const canShift = (delta: number) => inRange(monthIndex(props.month) + delta)

	// The view-transition *type* (forward / back) lets one transition branch its
	// animation: the grid slides toward the month you're heading to. The Today
	// button intentionally passes no type, keeping a plain cross-fade.
	const shiftMonth = (delta: number) => {
		if (!canShift(delta)) return
		withViewTransition(
			() => props.onMonthChange(addMonths(props.month, delta)),
			[delta > 0 ? 'forward' : 'back'],
		)
	}
	const goToday = () =>
		withViewTransition(() => {
			const t = today()
			props.onMonthChange({ y: t.y, m: t.m })
			props.onSelectDay?.(t)
		})
	const showToday = () =>
		(props.showTodayButton ?? true) && inRange(monthIndex({ y: today().y, m: today().m }))

	return (
		<div class={['ui-cal', props.class]}>
			<div class="ui-cal-head">
				<div class="ui-cal-head-left">
					<h2>{MONTHS[props.month.m]}</h2>
					<span class="ui-cal-year">{props.month.y}</span>
				</div>
				<div class="ui-cal-head-controls">
					<Show when={showToday()}>
						<button type="button" onClick={goToday} class="ui-cal-today-btn">
							Today
						</button>
					</Show>
					<IconButton
						label="Previous month"
						disabled={!canShift(-1)}
						onClick={() => shiftMonth(-1)}
					>
						‹
					</IconButton>
					<IconButton label="Next month" disabled={!canShift(1)} onClick={() => shiftMonth(1)}>
						›
					</IconButton>
				</div>
			</div>

			<div class="ui-cal-weekdays">
				<For each={WEEKDAYS}>{(w) => <span class="ui-cal-weekday">{w}</span>}</For>
			</div>

			{/* The grid morphs across months via this named element. */}
			<div
				class="ui-cal-grid"
				style={{ 'view-transition-name': props.transitionName ?? 'cal-grid' }}
			>
				<For each={cells()} keyed={false}>
					{(cell) => (
						<Show when={cell()} fallback={<div class="ui-cal-blank" />}>
							{(d) => {
								const date = () => ({ y: props.month.y, m: props.month.m, d: d() })
								const isToday = () => sameDay(today(), date())
								const isSel = () => (props.selected ? sameDay(props.selected, date()) : false)
								return (
									<button
										type="button"
										onClick={() => props.onSelectDay?.(date())}
										class="ui-cal-day"
										data-selected={isSel() ? '' : undefined}
									>
										<span class="ui-cal-daynum" data-today={isToday() ? '' : undefined}>
											{d()}
										</span>
										{props.day?.(date)}
									</button>
								)
							}}
						</Show>
					)}
				</For>
			</div>
		</div>
	)
}
