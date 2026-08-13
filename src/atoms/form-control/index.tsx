/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract shared by the text-like controls (see
 * shared/knobs.ts). placeholderInk, selectionSurface/selectionInk and caret
 * reach pseudo-element and highlight surfaces only the stylesheet can. */
const textKnobs = defineKnobs('ui-input', {
	radius: '<length-percentage>',
	minHeight: '<length>',
	padBlock: '<length>',
	padInline: '<length>',
	hoverBorder: '<color>',
	focusBorder: '<color>',
	focusRing: '<color>',
	placeholderInk: '<color>',
	selectionSurface: '<color>',
	selectionInk: '<color>',
	caret: '<color>',
})

const rangeKnobs = defineKnobs('ui-range', {
	accent: '<color>',
	focusRing: '<color>',
})

type InputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'class'> & {
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof textKnobs.spec>
type TextAreaProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'class'> & {
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof textKnobs.spec>
type RangeProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'class' | 'type'> & {
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof rangeKnobs.spec>

function textAttributes<Props extends InputProps | TextAreaProps>(props: Props) {
	return omit(
		props,
		'class',
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
		'placeholderInk',
		'selectionSurface',
		'selectionInk',
		'caret',
	)
}

export function TextInput(props: InputProps) {
	return (
		<input
			{...textAttributes(props)}
			{...colorTreatmentData(props)}
			{...textKnobs.attributes(props)}
			class={['ui-text-input', props.class]}
			style={mergeKnobStyle(textKnobs.style(props), props.style)}
		/>
	)
}

export function NumberInput(props: Omit<InputProps, 'type'>) {
	return (
		<input
			{...textAttributes(props)}
			{...colorTreatmentData(props)}
			{...textKnobs.attributes(props)}
			type="number"
			class={['ui-number-input', props.class]}
			style={mergeKnobStyle(textKnobs.style(props), props.style)}
		/>
	)
}

export function RangeInput(props: RangeProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'colorBase',
		'colorLevel',
		'variant',
		'accent',
		'focusRing',
	)
	return (
		<input
			{...attributes}
			{...colorTreatmentData(props)}
			{...rangeKnobs.attributes(props)}
			type="range"
			class={['ui-range-input', props.class]}
			style={mergeKnobStyle(rangeKnobs.style(props), props.style)}
		/>
	)
}

export function TextArea(props: TextAreaProps) {
	return (
		<textarea
			{...textAttributes(props)}
			{...colorTreatmentData(props)}
			{...textKnobs.attributes(props)}
			class={['ui-text-area', props.class]}
			style={mergeKnobStyle(textKnobs.style(props), props.style)}
		/>
	)
}
