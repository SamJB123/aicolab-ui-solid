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
const knobs = defineKnobs('ui-eyebrow', {
	fontSize: '<length>',
	letterSpacing: '<length>',
	ink: '<color>',
})

type EyebrowProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Eyebrow(props: EyebrowProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'colorBase',
		'colorLevel',
		'variant',
		'fontSize',
		'letterSpacing',
		'ink',
	)
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-eyebrow', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</span>
	)
}
