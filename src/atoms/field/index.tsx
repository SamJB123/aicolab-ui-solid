/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The label is a
 * child element, so its knobs ride the inheriting variable wire. */
const knobs = defineKnobs('ui-field', {
	gap: '<length>',
	labelInk: '<color>',
	labelFontSize: '<length>',
})

type FieldProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
	label: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Field(props: FieldProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'label',
		'colorBase',
		'colorLevel',
		'variant',
		'gap',
		'labelInk',
		'labelFontSize',
	)
	const child = (): JSX.Element => props.children
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-field', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<span class="ui-field-label">{props.label}</span>
			{child()}
		</div>
	)
}
