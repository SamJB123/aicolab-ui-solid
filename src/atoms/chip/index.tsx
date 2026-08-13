/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). surface/ink use
 * per-context defaults (ambient plain, treatment roles when coloured). */
const knobs = defineKnobs('ui-chip', {
	radius: '<length-percentage>',
	padBlock: '<length>',
	padInline: '<length>',
	gap: '<length>',
	fontSize: '<length>',
	letterSpacing: '<length>',
	surface: '<color>',
	ink: '<color>',
})

type ChipProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	tone?: 'plain' | 'accent' | 'live'
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Chip(props: ChipProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'tone',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'padBlock',
		'padInline',
		'gap',
		'fontSize',
		'letterSpacing',
		'surface',
		'ink',
	)
	const tone = () => props.tone ?? 'plain'
	const colorBase = () =>
		props.colorBase ?? (tone() === 'live' ? 'success' : tone() === 'accent' ? 'primary' : undefined)
	const variant = () => props.variant ?? (tone() === 'plain' ? undefined : 'soft')
	return (
		<span
			{...attributes}
			{...colorTreatmentData({
				colorBase: colorBase(),
				colorLevel: props.colorLevel,
				variant: variant(),
			})}
			{...knobs.attributes(props)}
			class={['ui-chip', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</span>
	)
}
