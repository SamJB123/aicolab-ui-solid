/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). Each knob feeds the
 * stylesheet's paired var()/typed-attr() reads, so values may be reactive
 * and still reach state rules (hoverBorder) and ::picker (pickerRadius). */
const knobs = defineKnobs('ui-select', {
	radius: '<length-percentage>',
	minHeight: '<length>',
	padBlock: '<length>',
	padInline: '<length>',
	hoverBorder: '<color>',
	focusBorder: '<color>',
	focusRing: '<color>',
	pickerRadius: '<length-percentage>',
})

type SelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, 'class'> & {
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/** A native choice control with intrinsic sizing and a customizable-select
 * enhancement. Layouts may explicitly stretch it when a full-width field is
 * appropriate; the atom itself remains compact by default. */
export function SelectControl(props: SelectProps) {
	const attributes = omit(
		props,
		'class',
		'children',
		'style',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'minHeight',
		'padBlock',
		'padInline',
		'hoverBorder',
		'focusBorder',
		'focusRing',
		'pickerRadius',
	)
	return (
		<select
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-select-control', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</select>
	)
}
