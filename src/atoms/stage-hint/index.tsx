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
const knobs = defineKnobs('ui-hint', {
	maxWidth: '<length>',
	padBlock: '<length>',
	padInline: '<length>',
	radius: '<length-percentage>',
	offset: '<length>',
	surface: '<color>',
	ink: '<color>',
})

type StageHintProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
	dismissed?: boolean
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/** Concise, non-interactive guidance over an active visual or spatial stage. */
export function StageHint(props: StageHintProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'dismissed',
		'colorBase',
		'colorLevel',
		'variant',
		'maxWidth',
		'padBlock',
		'padInline',
		'radius',
		'offset',
		'surface',
		'ink',
	)
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-stage-hint', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			data-dismissed={props.dismissed ? 'true' : undefined}
			aria-hidden="true"
		>
			{props.children}
		</div>
	)
}
