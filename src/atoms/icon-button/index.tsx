/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiLength } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-iconbtn', {
	size: '<length>',
	radius: '<length-percentage>',
	ring: '<color>',
	hoverSurface: '<color>',
	hoverInk: '<color>',
})

type IconButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'class'> & {
	class?: ClassProp
	/** Accessible name — icon-only buttons have no text content. */
	label: string
	/** Named vocabulary ('sm' 30px / 'md' 36px / 'lg' 44px, a data attribute)
	 *  or an exact measurement, which rides the size knob instead. */
	size?: 'sm' | 'md' | 'lg' | UiLength
} & ColorTreatmentProps &
	Omit<KnobProps<typeof knobs.spec>, 'size'>

export function IconButton(props: IconButtonProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'type',
		'label',
		'size',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'ring',
		'hoverSurface',
		'hoverInk',
	)
	const namedSize = () => {
		const { size } = props
		return size === 'sm' || size === 'md' || size === 'lg' ? size : undefined
	}
	const measuredSize = () => {
		const { size } = props
		return size === 'sm' || size === 'md' || size === 'lg' ? undefined : size
	}
	const knobValues = () => ({
		size: measuredSize(),
		radius: props.radius,
		ring: props.ring,
		hoverSurface: props.hoverSurface,
		hoverInk: props.hoverInk,
	})
	return (
		<button
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(knobValues())}
			type={props.type ?? 'button'}
			aria-label={props.label}
			data-size={namedSize() ?? (measuredSize() === undefined ? 'md' : undefined)}
			class={['ui-iconbtn', props.class]}
			style={mergeKnobStyle(knobs.style(knobValues()), props.style)}
		>
			{props.children}
		</button>
	)
}
