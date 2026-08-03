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

const triggerClass =
	'flex items-center gap-2 rounded-xl bg-[var(--c-ink-2)] px-3.5 py-2.5 text-[14px] text-[var(--c-paper)] ring-1 ring-[var(--c-line)] transition-colors hover:ring-[var(--c-line-strong)]'

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
		<div class="relative">
			<button
				type="button"
				popovertarget={popId}
				class={triggerClass}
				style={{ 'anchor-name': anchor }}
			>
				<span aria-hidden="true" class="text-[var(--c-muted)]">
					◷
				</span>
				<span class="font-data tabular-nums">
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
				class="ui-picker-pop p-3"
				style={{ 'position-anchor': anchor }}
			>
				<div class="mb-2 flex items-center justify-between">
					<button
						type="button"
						aria-label="Previous month"
						onClick={() => shift(-1)}
						class="grid h-7 w-7 place-items-center rounded-lg text-[var(--c-muted)] hover:bg-[var(--c-panel)]"
					>
						‹
					</button>
					<span class="font-display text-[15px] text-[var(--c-paper)]">
						{MONTHS[view().m]} {view().y}
					</span>
					<button
						type="button"
						aria-label="Next month"
						onClick={() => shift(1)}
						class="grid h-7 w-7 place-items-center rounded-lg text-[var(--c-muted)] hover:bg-[var(--c-panel)]"
					>
						›
					</button>
				</div>
				<div class="grid grid-cols-7 gap-0.5">
					<For each={WEEKDAYS}>
						{(w) => (
							<span class="grid h-7 place-items-center font-data text-[9px] uppercase tracking-wider text-[var(--c-faint)]">
								{w[0]}
							</span>
						)}
					</For>
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
											class={[
												'grid h-8 place-items-center rounded-lg font-data text-[13px] tabular-nums transition-colors',
												isSel()
													? 'bg-[var(--c-accent)] font-semibold text-[var(--c-ink)]'
													: 'text-[var(--c-paper)] hover:bg-[var(--c-accent-soft)] hover:text-[var(--c-accent)]',
												{ 'ring-1 ring-[var(--c-line-strong)]': isToday() && !isSel() },
											]}
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
		<div ref={box} class="ui-wheel relative h-40 flex-1 overflow-y-auto py-16">
			<For each={props.items}>
				{(it) => {
					const active = () => it === props.value
					return (
						<button
							type="button"
							data-active={active() ? 'true' : undefined}
							onClick={() => props.onPick(it)}
							class={[
								'flex h-9 w-full items-center justify-center font-data text-[15px] tabular-nums transition-all duration-200',
								active()
									? 'scale-110 font-semibold text-[var(--c-accent)]'
									: 'text-[var(--c-faint)] hover:text-[var(--c-paper)]',
							]}
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
		<div class="relative">
			<button
				type="button"
				popovertarget={popId}
				class={triggerClass}
				style={{ 'anchor-name': anchor }}
			>
				<span aria-hidden="true" class="text-[var(--c-muted)]">
					◔
				</span>
				<span class="font-data tabular-nums">{fmtTime(props.value)}</span>
			</button>
			<div
				ref={(el) => {
					el.addEventListener('toggle', (e) => {
						if ('newState' in e) setOpen(e.newState === 'open')
					})
				}}
				id={popId}
				popover="auto"
				class="ui-picker-pop p-3"
				style={{ 'position-anchor': anchor }}
			>
				<div class="mb-3 text-center font-display text-2xl tabular-nums text-[var(--c-paper)]">
					{fmtTime(props.value)}
				</div>
				<div class="flex gap-2">
					{/* Wheels share a centre band; AM·PM sits outside it. */}
					<div class="relative flex flex-1 gap-1">
						<div class="pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-[var(--c-accent-soft)] ring-1 ring-[color-mix(in_oklab,var(--c-accent)_28%,transparent)]" />
						{/* fade the wheel edges so off-centre values recede */}
						<div class="ui-wheel-mask pointer-events-none absolute inset-0 z-20" />
						<Wheel
							items={HOURS}
							value={parts().h12}
							open={open}
							onPick={(h) => setPart({ h12: h })}
						/>
						<span class="z-10 grid place-items-center font-data text-[15px] text-[var(--c-faint)]">
							:
						</span>
						<Wheel
							items={MINUTES}
							value={parts().min}
							pad
							open={open}
							onPick={(m) => setPart({ min: m })}
						/>
					</div>
					<div class="flex flex-col justify-center gap-1.5">
						<For each={[false, true]}>
							{(pm) => (
								<button
									type="button"
									onClick={() => setPart({ pm })}
									class={[
										'rounded-lg px-3 py-2 font-data text-[12px] font-semibold tracking-wide transition-colors',
										parts().pm === pm
											? 'bg-[var(--c-accent-soft)] text-[var(--c-accent)] ring-1 ring-[color-mix(in_oklab,var(--c-accent)_38%,transparent)]'
											: 'text-[var(--c-faint)] ring-1 ring-[var(--c-line)] hover:bg-[var(--c-panel)] hover:text-[var(--c-muted)]',
									]}
								>
									{pm ? 'PM' : 'AM'}
								</button>
							)}
						</For>
					</div>
				</div>
				<div class="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--c-line)] pt-3">
					<For each={PRESETS}>
						{(p) => (
							<button
								type="button"
								onClick={() => props.onChange(p)}
								class="rounded-full px-2.5 py-1 font-data text-[11px] text-[var(--c-muted)] ring-1 ring-[var(--c-line)] transition-colors hover:bg-[var(--c-panel)] hover:text-[var(--c-paper)]"
							>
								{fmtTime(p)}
							</button>
						)}
					</For>
				</div>
			</div>
		</div>
	)
}
