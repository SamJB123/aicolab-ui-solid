/** @jsxImportSource @solidjs/web */
import { type ParentProps } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The generated
 * scroll markers/buttons are pseudo-elements, which only the stylesheet can
 * paint — exactly what the knob wires exist for. */
const knobs = defineKnobs('ui-carousel', {
	itemWidth: '<length-percentage>',
	gap: '<length>',
	markerSize: '<length>',
	markerInk: '<color>',
	markerActiveInk: '<color>',
	buttonSurface: '<color>',
	buttonInk: '<color>',
})

export function Carousel(
	props: ParentProps<{ class?: ClassProp; label?: string }> &
		ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<section
			class={['ui-carousel', props.class]}
			aria-label={props.label ?? 'carousel'}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			{props.children}
		</section>
	)
}
