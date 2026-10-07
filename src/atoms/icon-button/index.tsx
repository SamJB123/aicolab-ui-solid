/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiLength } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). `surface` and `ink`
 *  are the button's RESTING pair — a button on a surface of its own (a
 *  theme-fixed map, a media frame) paints its face and glyph from them so
 *  the two can never come from different schemes; absent, the face stays
 *  transparent and the glyph takes the page's muted ink. */
const knobs = defineKnobs('ui-iconbtn', {
	size: '<length>',
	radius: '<length-percentage>',
	surface: '<color>',
	ink: '<color>',
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
		'surface',
		'ink',
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
		surface: props.surface,
		ink: props.ink,
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
