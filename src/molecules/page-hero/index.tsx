/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import { Eyebrow } from '../../atoms/eyebrow'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-hero', {
	maxWidth: '<length>',
	gap: '<length>',
	titleSize: '<length>',
	titleInk: '<color>',
	ledeSize: '<length>',
	ledeInk: '<color>',
})

export function PageHero(
	props: {
		eyebrow?: string
		title: JSX.Element
		lede?: JSX.Element
		/** Render function (lazy slot) — hydration-safe, see Panel.action. */
		actions?: () => JSX.Element
		align?: 'center' | 'start'
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<div
			class={['ui-hero', props.class]}
			data-align={props.align ?? 'center'}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<Show when={props.eyebrow}>
				{/* The eyebrow follows the hero's family, primary by default. */}
				<Eyebrow
					colorBase={props.colorBase ?? 'primary'}
					colorLevel={props.colorLevel}
					variant={props.variant}
				>
					{props.eyebrow}
				</Eyebrow>
			</Show>
			<h1>{props.title}</h1>
			<Show when={props.lede}>
				<p class="ui-hero-lede">{props.lede}</p>
			</Show>
			<Show when={props.actions}>
				<div class="ui-hero-actions">{props.actions?.()}</div>
			</Show>
		</div>
	)
}
