import { createSignal, createUniqueId, For, Show, untrack } from 'solid-js'
import { daysInMonth, firstWeekday, MONTHS, todayYMD, WEEKDAYS, weekdayOf, type YMD } from '../../shared/calendar'

const sameDay = (a: YMD, b: YMD) => a.y === b.y && a.m === b.m && a.d === b.d
const triggerClass = 'ui-picker-trigger'

export function DatePicker(props: {
	value: YMD
	onChange: (v: YMD) => void
	/** The date ringed as "today". Defaults to the real current date. */
	today?: YMD
}) {
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

	return (
		<div class="ui-picker">
			<button
				type="button"
				popovertarget={popId}
				class={triggerClass}
				style={{ 'anchor-name': anchor }}
			>
				<span aria-hidden="true" class="ui-picker-trigger-icon">
					◷
				</span>
				<span class="ui-picker-trigger-value">
					{WEEKDAYS[weekdayOf(props.value.y, props.value.m, props.value.d)]} {props.value.d}{' '}
					{MONTHS[props.value.m].slice(0, 3)}
				</span>
			</button>
			<div
				ref={(el) => {
					pop = el
					el.addEventListener('beforetoggle', onBeforeToggle)
				}}
				id={popId}
				popover="auto"
				class="ui-picker-pop"
				style={{ 'position-anchor': anchor }}
			>
				<div class="ui-dp-head">
					<button
						type="button"
						aria-label="Previous month"
						onClick={() => shift(-1)}
						class="ui-dp-nav"
					>
						‹
					</button>
					<span class="ui-dp-title">
						{MONTHS[view().m]} {view().y}
					</span>
					<button type="button" aria-label="Next month" onClick={() => shift(1)} class="ui-dp-nav">
						›
					</button>
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
