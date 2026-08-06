// Date and time pickers — no library. Each is a trigger button + a
// self-positioning popover following the same convention as `.ui-anchored`:
// the real Popover API (popover + popovertarget → top layer, native
// light-dismiss) plus CSS anchor positioning (anchor-name / position-anchor /
// position-area / position-try), so the panel attaches to the trigger and
// flips within the viewport on small screens — and, being top-layer, is never
// clipped by an ancestor. The DatePicker is a navigable mini month grid; the
// TimePicker is a pair of scroll wheels with an AM·PM toggle and quick
// presets. Both are controlled. Structural CSS: `.ui-picker-pop` /
// `.ui-wheel*` in styles.css (a standalone panel class — see the note there
// on why it must not compose `.ui-anchored`).

import { createEffect, createSignal, createUniqueId, For, Show, untrack } from 'solid-js'
import {
	daysInMonth,
	firstWeekday,
	fmtTime,
	MONTHS,
	todayYMD,
	WEEKDAYS,
	weekdayOf,
	type YMD,
} from './calendar'

const sameDay = (a: YMD, b: YMD) => a.y === b.y && a.m === b.m && a.d === b.d

const triggerClass = 'ui-picker-trigger'

// ── Date picker ───────────────────────────────────────────────────────────────

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

// ── Time picker ───────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)
const PRESETS = [540, 630, 720, 840, 960, 1050] // 9:00, 10:30, 12:00, 2:00, 4:00, 5:30

const decompose = (min: number) => {
	const h24 = Math.floor(min / 60)
	return { h12: ((h24 + 11) % 12) + 1, min: min % 60, pm: h24 >= 12 }
}
const compose = (h12: number, min: number, pm: boolean) => {
	const h24 = pm ? (h12 % 12) + 12 : h12 % 12
	return h24 * 60 + min
}

function Wheel(props: {
	items: number[]
	value: number
	pad?: boolean
	open: () => boolean
	onPick: (n: number) => void
}) {
	let box: HTMLDivElement | undefined
	const center = (smooth: boolean) => {
		if (!box) return
		const el = box.querySelector('[data-active="true"]')
		if (!(el instanceof HTMLElement)) return
		const top = el.offsetTop - (box.clientHeight - el.clientHeight) / 2
		box.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
	}
	// Centre when the popover opens (instant) and when the value changes while
	// open (smooth). A closed popover has no layout, so centring only runs once
	// it's shown — driven by the `open` accessor, not onMount.
	createEffect(
		() => ({ open: props.open(), value: props.value }),
		(cur, prev) => {
			if (cur.open) center(prev?.open ?? false)
		},
	)
	return (
		<div ref={box} class="ui-wheel">
			<For each={props.items}>
				{(it) => {
					const active = () => it === props.value
					return (
						<button
							type="button"
							data-active={active() ? 'true' : undefined}
							onClick={() => props.onPick(it)}
							class="ui-wheel-item"
						>
							{props.pad ? String(it).padStart(2, '0') : it}
						</button>
					)
				}}
			</For>
		</div>
	)
}

export function TimePicker(props: { value: number; onChange: (min: number) => void }) {
	const popId = `tp-${createUniqueId()}`
	const anchor = `--pk-${createUniqueId()}`
	const [open, setOpen] = createSignal(false)
	const parts = () => decompose(props.value)
	const setPart = (next: { h12?: number; min?: number; pm?: boolean }) => {
		const p = parts()
		props.onChange(compose(next.h12 ?? p.h12, next.min ?? p.min, next.pm ?? p.pm))
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
					◔
				</span>
				<span class="ui-picker-trigger-value">{fmtTime(props.value)}</span>
			</button>
			<div
				ref={(el) => {
					el.addEventListener('toggle', (e) => {
						if ('newState' in e) setOpen(e.newState === 'open')
					})
				}}
				id={popId}
				popover="auto"
				class="ui-picker-pop"
				style={{ 'position-anchor': anchor }}
			>
				<div class="ui-tp-readout">{fmtTime(props.value)}</div>
				<div class="ui-tp-row">
					{/* Wheels share a centre band; AM·PM sits outside it. */}
					<div class="ui-tp-wheels">
						<div class="ui-tp-band" />
						{/* fade the wheel edges so off-centre values recede */}
						<div class="ui-wheel-mask" />
						<Wheel
							items={HOURS}
							value={parts().h12}
							open={open}
							onPick={(h) => setPart({ h12: h })}
						/>
						<span class="ui-tp-colon">:</span>
						<Wheel
							items={MINUTES}
							value={parts().min}
							pad
							open={open}
							onPick={(m) => setPart({ min: m })}
						/>
					</div>
					<div class="ui-tp-ampm-col">
						<For each={[false, true]}>
							{(pm) => (
								<button
									type="button"
									onClick={() => setPart({ pm })}
									class="ui-tp-ampm"
									data-active={parts().pm === pm ? '' : undefined}
								>
									{pm ? 'PM' : 'AM'}
								</button>
							)}
						</For>
					</div>
				</div>
				<div class="ui-tp-presets">
					<For each={PRESETS}>
						{(p) => (
							<button type="button" onClick={() => props.onChange(p)} class="ui-tp-preset">
								{fmtTime(p)}
							</button>
						)}
					</For>
				</div>
			</div>
		</div>
	)
}
