/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). size is the mark's
 * height; ink is what its content is drawn in; turn is the hexagon's turn
 * about its centre (the content stays upright). Everything else is the
 * theme's: the plate's rings, face paint, bevel and shadow (resolver.css
 * "Surface paint and edge"), which the mark paints as bands on its one
 * pseudo-element because a box-shadow cannot follow a hexagon's outline. */
const knobs = defineKnobs('ui-hexmark', {
	size: '<length>',
	ink: '<color>',
	turn: '<angle>',
})

type HexMarkOwnProps = {
	class?: ClassProp
	/** `flat` — a flat top and bottom, the orientation of the hex field's
	 *  cells and the default; `pointy` — the CoLab mark's. */
	orientation?: 'flat' | 'pointy'
	/** What sits on the face: a line icon as SVG, or any content a cell
	 *  carries (an icon over a name). */
	children?: JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

type HexMarkProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & HexMarkOwnProps

/**
 * A hexagonal plate: the theme's rings around the theme's surface, in the
 * orientation of the lattice it stands for, with its content on the face.
 * One element, as every plate is. Decorative on its own — it carries no
 * name — so it sits inside a labelled button or link, or beside the words;
 * where the hexagon itself is pressed, HexMarkButton. A treated mark takes
 * its family's surface and rim as every plate does.
 */
export function HexMark(props: HexMarkProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'orientation',
		'colorBase',
		'colorLevel',
		'variant',
		'size',
		'ink',
		'turn',
	)
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			data-ui-plate=""
			data-orientation={props.orientation ?? 'flat'}
			class={['ui-hex-mark', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</span>
	)
}

type HexMarkButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'class'> &
	HexMarkOwnProps & {
		/** Toggle-state sugar mapped to aria-pressed. */
		pressed?: boolean
	}

/**
 * The plate as the control itself: the hexagon is the hit area (the
 * element ignores the pointer; its painted hexagon takes it), it lifts on
 * hover and casts the theme's shadow, and it answers the keyboard as any
 * button does. Name it (aria-label) as its content is not words.
 */
export function HexMarkButton(props: HexMarkButtonProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'type',
		'pressed',
		'orientation',
		'colorBase',
		'colorLevel',
		'variant',
		'size',
		'ink',
		'turn',
	)
	return (
		<button
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			type={props.type ?? 'button'}
			aria-pressed={props.pressed === undefined ? undefined : props.pressed ? 'true' : 'false'}
			data-ui-plate=""
			data-orientation={props.orientation ?? 'flat'}
			class={['ui-hex-mark', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</button>
	)
}
