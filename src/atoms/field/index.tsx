/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	type ClassProp,
	type ColorTreatmentProps,
	colorTreatmentData,
} from '../../shared/color-treatment.ts'
import { defineKnobs, type KnobProps, mergeKnobStyle } from '../../shared/knobs.ts'
import { VisuallyHidden } from '../visually-hidden'

/** Per-instance styling contract (see shared/knobs.ts). The label is a
 * child element, so its knobs ride the inheriting variable wire. */
const knobs = defineKnobs('ui-field', {
	gap: '<length>',
	labelInk: '<color>',
	labelFontSize: '<length>',
})

type FieldProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, 'class'> & {
	class?: ClassProp
	label: string
	/** Plain-english explainer: a hover tooltip on the label (native `title`)
	 *  with a ⓘ marker, AND read out with the label by assistive technology
	 *  (a visually hidden copy), since tooltips never reach keyboard or
	 *  touch users. */
	hint?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * A labelled control. The root is a real `<label>`, so the wrapped native
 * control (input, textarea, select) gets its accessible name by implicit
 * association and clicking the label text focuses it — the two things a
 * visible caption alone never provided (accessibility pass, 2026-09-14).
 * Wrap exactly one labelable control per Field.
 */
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
		<label
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-field', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<span class="ui-field-label" title={props.hint}>
				{props.label}
				{props.hint ? (
					<>
						<span class="ui-field-hint-mark" aria-hidden="true">
							ⓘ
						</span>
						<VisuallyHidden>. {props.hint}</VisuallyHidden>
					</>
				) : undefined}
			</span>
			{child()}
		</label>
	)
}
