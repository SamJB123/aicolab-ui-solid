/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). ink drives both
 * tones; contentInk is the text colour on a highlight; thickness is the
 * underline weight. */
const knobs = defineKnobs('ui-mark', {
	ink: '<color>',
	contentInk: '<color>',
	thickness: '<length>',
})

type MarkProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'class'> & {
	class?: ClassProp
	tone?: 'underline' | 'highlight'
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Mark(props: MarkProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'tone',
		'colorBase',
		'colorLevel',
		'variant',
		'ink',
		'contentInk',
		'thickness',
	)
	return (
		<mark
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			data-tone={props.tone ?? 'underline'}
			class={['ui-mark', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</mark>
	)
}
