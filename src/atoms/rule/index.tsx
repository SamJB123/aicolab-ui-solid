/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import { Eyebrow } from '../eyebrow'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The lines are child
 * elements, so the adapters inherit. */
const knobs = defineKnobs('ui-rule', {
	gap: '<length>',
	lineThickness: '<length>',
	lineInk: '<color>',
})

type RuleProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
	label?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Rule(props: RuleProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'colorBase',
		'colorLevel',
		'variant',
		'gap',
		'lineThickness',
		'lineInk',
	)
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-rule', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<span class="ui-rule-line" />
			<Show when={props.label}>
				<Eyebrow>{props.label}</Eyebrow>
				<span class="ui-rule-line" />
			</Show>
		</div>
	)
}
