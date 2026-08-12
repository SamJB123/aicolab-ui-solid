/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'

type SelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, 'class'> & {
	class?: ClassProp
} & ColorTreatmentProps

/** A native choice control with intrinsic sizing and a customizable-select
 * enhancement. Layouts may explicitly stretch it when a full-width field is
 * appropriate; the atom itself remains compact by default. */
export function SelectControl(props: SelectProps) {
	const attributes = omit(props, 'class', 'children', 'colorBase', 'colorLevel', 'variant')
	return (
		<select
			{...attributes}
			{...colorTreatmentData(props)}
			class={['ui-select-control', props.class]}
		>
			{props.children}
		</select>
	)
}
