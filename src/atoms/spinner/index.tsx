/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-spinner', {
	size: '<length>',
	thickness: '<length>',
	ink: '<color>',
	track: '<color>',
})

type SpinnerProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	/** Accessible announcement — the spinner has no text content. */
	label?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * Indeterminate activity indicator: a spinning ring (an opacity pulse under
 * prefers-reduced-motion). `role="status"` announces the label to assistive
 * tech; for determinate progress use Meter instead.
 */
export function Spinner(props: SpinnerProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'colorBase',
		'colorLevel',
		'variant',
		'size',
		'thickness',
		'ink',
		'track',
	)
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			role="status"
			class={['ui-spinner', props.class]}
			style={props.style}
		>
			{/* Knob wires land on the RING — the element that consumes them
			    (the Meter fill-element pattern), so BOTH wires apply. */}
			<span
				class="ui-spinner-ring"
				aria-hidden="true"
				{...knobs.attributes(props)}
				style={mergeKnobStyle(knobs.style(props), false)}
			/>
			<span class="ui-spinner-label">{props.label ?? 'Loading…'}</span>
		</span>
	)
}
