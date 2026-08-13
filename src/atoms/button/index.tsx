/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The set mirrors what
 * app stylesheets historically overrode via compound classes (padding,
 * font-size) plus the state surfaces inline style can't reach (hoverBorder,
 * focusRing). */
const knobs = defineKnobs('ui-btn', {
	radius: '<length-percentage>',
	padBlock: '<length>',
	padInline: '<length>',
	gap: '<length>',
	fontSize: '<length>',
	hoverBorder: '<color>',
	focusRing: '<color>',
})

/* Button renders treated by default (primary/500/solid), unlike components
 * where the colour treatment is opt-in. */
const treatment = (props: ColorTreatmentProps) =>
	colorTreatmentData({
		colorBase: props.colorBase ?? 'primary',
		colorLevel: props.colorLevel,
		variant: props.variant,
	})

type ButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'class'> & {
	class?: ClassProp
	/** Toggle-state sugar mapped to aria-pressed. */
	pressed?: boolean
	/** camelCase alias for the native popovertarget attribute. */
	popoverTarget?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Button(props: ButtonProps) {
	const attributes = omit(
		props,
		'class',
		'children',
		'style',
		'type',
		'pressed',
		'popoverTarget',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'padBlock',
		'padInline',
		'gap',
		'fontSize',
		'hoverBorder',
		'focusRing',
	)
	return (
		<button
			{...attributes}
			{...treatment(props)}
			{...knobs.attributes(props)}
			type={props.type ?? 'button'}
			aria-pressed={props.pressed === undefined ? undefined : props.pressed ? 'true' : 'false'}
			popovertarget={props.popoverTarget}
			class={['ui-btn', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</button>
	)
}

/** Native navigation with the same treatment and knob contract as Button. */
type ButtonLinkProps = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'class'> & {
	href: string
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function ButtonLink(props: ButtonLinkProps) {
	const attributes = omit(
		props,
		'class',
		'children',
		'style',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'padBlock',
		'padInline',
		'gap',
		'fontSize',
		'hoverBorder',
		'focusRing',
	)
	return (
		<a
			{...attributes}
			{...treatment(props)}
			{...knobs.attributes(props)}
			class={['ui-btn', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</a>
	)
}
