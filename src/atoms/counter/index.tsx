/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import { createEffect } from '../../solid-v2'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-counter', { ink: '<color>' })

type CounterState = {
	target: number
	format?: (n: number) => string
}

const formatCounter = (state: CounterState, value: number) =>
	state.format ? state.format(value) : Math.round(value).toLocaleString()

/**
 * Solid 2 two-phase directive: create the effect while an owner is active,
 * then let the ref callback do DOM binding only. This keeps the animation
 * disposable even though the element is attached after setup.
 */
const tweenCounter = (source: () => CounterState) => {
	let el: HTMLSpanElement | undefined
	let displayed: number | undefined
	let raf = 0

	createEffect(source, (state) => {
		if (!el) return
		if (displayed === undefined) {
			displayed = state.target
			el.textContent = formatCounter(state, state.target)
			el.dataset.v = String(state.target)
			return
		}

		const from = displayed
		if (from === state.target) {
			el.textContent = formatCounter(state, state.target)
			return
		}

		const startedAt = performance.now()
		const duration = 700
		const step = (time: number) => {
			const progress = Math.min(1, (time - startedAt) / duration)
			const eased = 1 - (1 - progress) ** 3
			displayed = from + (state.target - from) * eased
			if (el) {
				el.textContent = formatCounter(state, displayed)
				el.dataset.v = String(displayed)
			}
			if (progress < 1) raf = requestAnimationFrame(step)
		}
		raf = requestAnimationFrame(step)
		return () => cancelAnimationFrame(raf)
	})

	return (nextEl: HTMLSpanElement) => {
		el = nextEl
		const state = source()
		displayed = state.target
		el.textContent = formatCounter(state, state.target)
		el.dataset.v = String(state.target)
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
	const bindTween = tweenCounter(() => ({ target: props.value, format: props.format }))
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			ref={bindTween}
			class={['ui-counter', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			data-v={String(props.value)}
		>
			{fmt(props.value)}
		</span>
	)
}
