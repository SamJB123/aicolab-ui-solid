/** @jsxImportSource @solidjs/web */
import { isServer, type JSX } from '@solidjs/web'
import { createMemo, omit } from 'solid-js'
import {
	type ClassProp,
	type ColorTreatmentProps,
	colorTreatmentData,
} from '../../shared/color-treatment'
import { defineKnobs, type KnobProps, mergeKnobStyle } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-counter', { ink: '<color>' })

const TWEEN_MS = 700

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve))

/** The eased frames from `from` to `to`, one per animation frame, ending
 *  exactly on `to`. Consumed by the memo below as an async iterable: the
 *  memo's value is the latest frame, and retargeting closes the iterator. */
async function* tweenFrames(from: number, to: number): AsyncGenerator<number> {
	const startedAt = performance.now()
	for (;;) {
		const time = await nextFrame()
		const progress = Math.min(1, (time - startedAt) / TWEEN_MS)
		const eased = 1 - (1 - progress) ** 3
		yield from + (to - from) * eased
		if (progress >= 1) return
	}
}

type CounterProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	value: number
	format?: (n: number) => string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Counter(props: CounterProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'ref',
		'value',
		'format',
		'colorBase',
		'colorLevel',
		'variant',
		'ink',
	)
	const fmt = (n: number) => (props.format ? props.format(n) : Math.round(n).toLocaleString())
	// The displayed number is derived state: the target on first render (and
	// on the server), then the tween's frames whenever the target changes.
	// A change mid-tween recomputes with `prev` = the frame on screen.
	const shown = createMemo<number>((prev) => {
		const target = props.value
		if (isServer || prev === undefined || prev === target) return target
		return tweenFrames(prev, target)
	})
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-counter', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			data-v={String(shown())}
		>
			{fmt(shown())}
		</span>
	)
}
