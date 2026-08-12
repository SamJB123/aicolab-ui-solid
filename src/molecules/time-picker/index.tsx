import { createSignal, createUniqueId, For } from 'solid-js'
import { fmtTime } from '../../shared/calendar'
import { createEffect } from '../../solid-v2'

const triggerClass = 'ui-picker-trigger'

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
