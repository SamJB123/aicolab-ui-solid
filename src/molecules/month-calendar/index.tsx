import type { JSX } from '@solidjs/web'
import { createMemo, For, Show } from 'solid-js'
import { Button } from '../../atoms/button'
import { IconButton } from '../../atoms/icon-button'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'
import { withViewTransition } from '../../vt'
import { MONTHS, WEEKDAYS, addMonths, monthCells, monthIndex, sameDay, todayYMD, type YM, type YMD } from '../../shared/calendar'

/** Per-instance styling contract (see shared/knobs.ts); the values are
 * consumed on descendants via the inheriting public variables. */
const knobs = defineKnobs('ui-cal', {
	cellMinHeight: '<length>',
	gridGap: '<length>',
	dayRadius: '<length-percentage>',
	daynumSize: '<length>',
	selectedSurface: '<color>',
	selectedBorder: '<color>',
	selectedInk: '<color>',
	todaySurface: '<color>',
	todayInk: '<color>',
})

export function MonthCalendar(props: KnobProps<typeof knobs.spec> & {
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
} & ColorTreatmentProps) {
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
		<div
			class={['ui-cal', props.class]}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<div class="ui-cal-head">
				<div class="ui-cal-head-left">
					<h2>{MONTHS[props.month.m]}</h2>
					<span class="ui-cal-year">{props.month.y}</span>
				</div>
				<div class="ui-cal-head-controls">
					<Show when={showToday()}>
						<Button
							class="ui-cal-today-btn"
							onClick={goToday}
							colorBase={props.colorBase ?? 'neutral'}
							colorLevel={props.colorLevel}
							variant={props.variant ?? 'ghost'}
							radius="var(--r-pill)"
							padBlock="6px"
							padInline="12px"
							fontSize="var(--t-xs)"
						>
							Today
						</Button>
					</Show>
					<IconButton
						label="Previous month"
						disabled={!canShift(-1)}
						colorBase={props.colorBase}
						colorLevel={props.colorLevel}
						variant={props.variant}
						onClick={() => shiftMonth(-1)}
					>
						‹
					</IconButton>
					<IconButton
						label="Next month"
						disabled={!canShift(1)}
						colorBase={props.colorBase}
						colorLevel={props.colorLevel}
						variant={props.variant}
						onClick={() => shiftMonth(1)}
					>
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
