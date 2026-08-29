/** @jsxImportSource @solidjs/web */
import { createSignal, createUniqueId, For, Show, untrack } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import {
	daysInMonth,
	firstWeekday,
	MONTHS,
	todayYMD,
	WEEKDAYS,
	weekdayOf,
	type YMD,
} from '../../shared/calendar'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'
import { PickerTrigger } from '../pickers/trigger'

const sameDay = (a: YMD, b: YMD) => a.y === b.y && a.m === b.m && a.d === b.d

/** Per-instance styling contract (see shared/knobs.ts); emitted on the pop
 * panel, whose descendants consume the inheriting public variables. */
const knobs = defineKnobs('ui-dp', {
	daySize: '<length>',
	dayRadius: '<length-percentage>',
	hoverSurface: '<color>',
	hoverInk: '<color>',
	selectedSurface: '<color>',
	selectedInk: '<color>',
})

export function DatePicker(
	props: KnobProps<typeof knobs.spec> & {
		value: YMD
		onChange: (v: YMD) => void
		/** The date ringed as "today". Defaults to the real current date. */
		today?: YMD
		class?: ClassProp
	} & ColorTreatmentProps,
) {
	const popId = `dp-${createUniqueId()}`
	const anchor = `--pk-${createUniqueId()}`
	const today = () => props.today ?? todayYMD()
	// Snapshot the initial month untracked — a one-time seed, not a reactive mirror.
	const [view, setView] = createSignal(untrack(() => ({ y: props.value.y, m: props.value.m })))
	let pop: HTMLDivElement | undefined

	// Reset to the selected month each time the popover opens.
	const onBeforeToggle = (e: Event) => {
		if ('newState' in e && e.newState === 'open') setView({ y: props.value.y, m: props.value.m })
	}
	const shift = (delta: number) =>
		setView((v) => {
			const total = v.y * 12 + v.m + delta
			return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 }
		})
	const cells = () => {
		const { y, m } = view()
		const blanks = firstWeekday(y, m)
		const days = daysInMonth(y, m)
		return Array.from({ length: 42 }, (_, i) => {
			const d = i - blanks + 1
			return d >= 1 && d <= days ? d : null
		})
	}

	const monthAbbrev = () => {
		const name = MONTHS[props.value.m]
		if (name === undefined) throw new RangeError(`DatePicker: month index out of range: ${props.value.m}`)
		return name.slice(0, 3)
	}

	return (
		<div class={['ui-picker', props.class]}>
			<PickerTrigger
				popoverTarget={popId}
				anchorName={anchor}
				icon="◷"
				colorBase={props.colorBase}
				colorLevel={props.colorLevel}
				variant={props.variant}
				value={
					<>
						{WEEKDAYS[weekdayOf(props.value.y, props.value.m, props.value.d)]} {props.value.d}{' '}
						{monthAbbrev()}
					</>
				}
			/>
			<div
				ref={(el) => {
					pop = el
					el.addEventListener('beforetoggle', onBeforeToggle)
				}}
				id={popId}
				popover="auto"
				class="ui-anchored ui-picker-pop"
				style={mergeKnobStyle(knobs.style(props), { 'position-anchor': anchor })}
				{...colorTreatmentData(props)}
				{...knobs.attributes(props)}
			>
				<div class="ui-dp-head">
					<IconButton
						label="Previous month"
						size="28px"
						radius="var(--r-sm)"
						ring="transparent"
						hoverSurface={props.colorBase ? undefined : 'var(--color-base-100)'}
						colorBase={props.colorBase}
						colorLevel={props.colorLevel}
						variant={props.variant}
						onClick={() => shift(-1)}
					>
						‹
					</IconButton>
					<span class="ui-dp-title">
						{MONTHS[view().m]} {view().y}
					</span>
					<IconButton
						label="Next month"
						size="28px"
						radius="var(--r-sm)"
						ring="transparent"
						hoverSurface={props.colorBase ? undefined : 'var(--color-base-100)'}
						colorBase={props.colorBase}
						colorLevel={props.colorLevel}
						variant={props.variant}
						onClick={() => shift(1)}
					>
						›
					</IconButton>
				</div>
				<div class="ui-dp-grid">
					<For each={WEEKDAYS}>{(w) => <span class="ui-dp-wd">{w[0]}</span>}</For>
					<For each={cells()} keyed={false}>
						{(cell) => (
							<Show when={cell()} fallback={<span />}>
								{(d) => {
									const cur = () => ({ y: view().y, m: view().m, d: d() })
									const isSel = () => sameDay(props.value, cur())
									const isToday = () => sameDay(today(), cur())
									return (
										<button
											type="button"
											onClick={() => {
												props.onChange(cur())
												pop?.hidePopover()
											}}
											class="ui-dp-day"
											data-selected={isSel() ? '' : undefined}
											data-today={isToday() ? '' : undefined}
										>
											{d()}
										</button>
									)
								}}
							</Show>
						)}
					</For>
				</div>
			</div>
		</div>
	)
}
