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
const knobs = defineKnobs('ui-hold', {
	size: '<length>',
	radius: '<length-percentage>',
	focusRing: '<color>',
})

type HoldButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'class'> & {
	class?: ClassProp
	onPressedChange: (pressed: boolean) => void
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/** A native button for continuous press interactions such as movement, voice,
 * scrubbing, or spatial controls. Pointer capture keeps release semantics
 * reliable when a pointer leaves the button. The press lifecycle is the
 * component's own contract: its pointer handlers override any passed in. */
export function HoldButton(props: HoldButtonProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'type',
		'onPressedChange',
		'colorBase',
		'colorLevel',
		'variant',
		'size',
		'radius',
		'focusRing',
	)
	const release = () => props.onPressedChange(false)
	return (
		<button
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			type={props.type ?? 'button'}
			class={['ui-hold-button', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			onPointerDown={(event) => {
				if (props.disabled) return
				event.currentTarget.setPointerCapture(event.pointerId)
				props.onPressedChange(true)
			}}
			onPointerUp={release}
			onPointerCancel={release}
			onLostPointerCapture={release}
		>
			{props.children}
		</button>
	)
}
