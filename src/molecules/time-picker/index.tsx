/** @jsxImportSource @solidjs/web */
import { createSignal, createUniqueId, For } from 'solid-js'
import { Button } from '../../atoms/button'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { fmtTime } from '../../shared/calendar'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'
import { createEffect } from '../../solid-v2'
import { PickerTrigger } from '../pickers/trigger'

/** Per-instance styling contract (see shared/knobs.ts); emitted on the pop
 * panel, whose descendants consume the inheriting public variables. */
const knobs = defineKnobs('ui-tp', {
	wheelHeight: '<length>',
	itemHeight: '<length>',
	bandSurface: '<color>',
	activeInk: '<color>',
})

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

export function TimePicker(
	props: KnobProps<typeof knobs.spec> & {
		value: number
		onChange: (min: number) => void
		class?: ClassProp
	} & ColorTreatmentProps,
) {
	const popId = `tp-${createUniqueId()}`
	const anchor = `--pk-${createUniqueId()}`
	const [open, setOpen] = createSignal(false)
	const parts = () => decompose(props.value)
	const setPart = (next: { h12?: number; min?: number; pm?: boolean }) => {
		const p = parts()
		props.onChange(compose(next.h12 ?? p.h12, next.min ?? p.min, next.pm ?? p.pm))
	}

	return (
		<div class={['ui-picker', props.class]}>
			<PickerTrigger
				popoverTarget={popId}
				anchorName={anchor}
				icon="◔"
				colorBase={props.colorBase}
				colorLevel={props.colorLevel}
				variant={props.variant}
				value={fmtTime(props.value)}
			/>
			<div
				ref={(el) => {
					el.addEventListener('toggle', (e) => {
						if ('newState' in e) setOpen(e.newState === 'open')
					})
				}}
				id={popId}
				popover="auto"
				class="ui-anchored ui-picker-pop"
				style={mergeKnobStyle(knobs.style(props), { 'position-anchor': anchor })}
				{...colorTreatmentData(props)}
				{...knobs.attributes(props)}
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
								<Button
									class="ui-tp-ampm"
									pressed={parts().pm === pm}
									onClick={() => setPart({ pm })}
									colorBase={props.colorBase ?? 'primary'}
									colorLevel={props.colorLevel}
									variant={props.variant ?? 'ghost'}
									radius="var(--r-sm)"
									padBlock="8px"
									padInline="12px"
									fontSize="var(--t-sm)"
								>
									{pm ? 'PM' : 'AM'}
								</Button>
							)}
						</For>
					</div>
				</div>
				<div class="ui-tp-presets">
					<For each={PRESETS}>
						{(p) => (
							<Button
								class="ui-tp-preset"
								onClick={() => props.onChange(p)}
								colorBase={props.colorBase ?? 'neutral'}
								colorLevel={props.colorLevel}
								variant={props.variant ?? 'ghost'}
								radius="var(--r-pill)"
								padBlock="4px"
								padInline="10px"
								fontSize="var(--t-xs)"
							>
								{fmtTime(p)}
							</Button>
						)}
					</For>
				</div>
			</div>
		</div>
	)
}
