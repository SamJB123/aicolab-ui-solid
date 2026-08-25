/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	type ClassProp,
	type ColorTreatmentProps,
	colorTreatmentData,
} from '../../shared/color-treatment.ts'
import { defineKnobs, type KnobProps, mergeKnobStyle } from '../../shared/knobs.ts'

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
	/** Plain-english explainer, surfaced as a hover tooltip on the label
	 *  (native `title`) with a ⓘ marker signalling that help exists. */
	hint?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Field(props: FieldProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'label',
		'hint',
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
			<span class="ui-field-label" title={props.hint}>
				{props.label}
				{props.hint ? (
					<span class="ui-field-hint-mark" aria-hidden="true">
						ⓘ
					</span>
				) : undefined}
			</span>
			{child()}
		</div>
	)
}
