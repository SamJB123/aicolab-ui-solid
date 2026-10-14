/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). Link-consumed
 * knobs ride inheriting adapters assigned on the root. */
const knobs = defineKnobs('ui-navlinks', {
	radius: '<length-percentage>',
	padBlock: '<length>',
	padInline: '<length>',
	gap: '<length>',
	fontSize: '<length>',
	plateSurface: '<color>',
	ink: '<color>',
	currentInk: '<color>',
})

type NavLinksProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'class'> & {
	class?: ClassProp
	/** The landmark's name, read by assistive tech ("Site", "Docs"). */
	label: string
	children: JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * A row of page links with one sliding plate: plain words, and a single
 * plate that sits behind the current page and glides to the link under the
 * pointer (or keyboard focus), then returns. The plate is anchored to that
 * link with CSS anchor positioning, as Segmented's pill is, so it always
 * matches the link's real box; where anchors are unsupported the current
 * link wears the plate itself. Children are NavLinks — or a router's
 * wrapping of NavLink — and the current page carries aria-current="page",
 * which TanStack's links set themselves.
 */
export function NavLinks(props: NavLinksProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'children',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'padBlock',
		'padInline',
		'gap',
		'fontSize',
		'plateSurface',
		'ink',
		'currentInk',
	)
	return (
		<nav
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			aria-label={props.label}
			class={['ui-nav-links', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
			<span class="ui-nav-links-plate" data-ui-plate="" aria-hidden="true" />
		</nav>
	)
}

type NavLinkProps = Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'class'> & {
	class?: ClassProp
}

/** One link in a NavLinks row. A plain anchor that forwards everything, so
 * a router can wrap it (`createLink(NavLink)`) and set its href, handlers
 * and aria-current. */
export function NavLink(props: NavLinkProps) {
	const attributes = omit(props, 'class', 'children')
	return (
		<a {...attributes} class={['ui-nav-link', props.class]} data-ui-plate="">
			{props.children}
		</a>
	)
}
