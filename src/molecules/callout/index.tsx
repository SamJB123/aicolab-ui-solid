/** @jsxImportSource @solidjs/web */
import { Dynamic, type JSX } from '@solidjs/web'
import { children, omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-callout', {
	radius: '<length-percentage>',
	pad: '<length>',
	bandPad: '<length>',
	iconSize: '<length>',
})

type CalloutProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'class'> & {
	class?: ClassProp
	/** The band across the top: a heading, a label, an editable title — any content.
	 *  Lazy, like every ui-solid slot. Without a band (and icon) the callout is a plain
	 *  treated surface. */
	band?: () => JSX.Element
	/** The glyph in the band's leading corner (an emoji, an SVG, an <img>). Lazy. */
	icon?: () => JSX.Element
	/** Which element the callout renders as; a document block is a <section>, an
	 *  incidental note an <aside>. */
	as?: 'section' | 'aside' | 'div'
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * A banded box: the document world's callout — a bordered surface in a colour family
 * with an optional band across the top carrying an icon and a heading, and a body of
 * arbitrary content. The band paints SOLID in the family; the body paints the
 * family's outline or soft roles, per the `variant` prop (outline by default). Used by
 * the Optimal Care Pathways CMS for every template box and timeframe, where the band's
 * content is itself editable.
 */
export function Callout(props: CalloutProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'band',
		'icon',
		'as',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'pad',
		'bandPad',
		'iconSize',
	)
	const treatment = (): ColorTreatmentProps => ({
		colorBase: props.colorBase ?? 'neutral',
		colorLevel: props.colorLevel,
		variant: props.variant ?? 'outline',
	})
	const bandTreatment = (): ColorTreatmentProps => ({
		colorBase: props.colorBase ?? 'neutral',
		colorLevel: props.colorLevel,
		variant: 'solid',
	})
	// Single-eval slot resolution (children()) — element-JSX props are getters;
	// double evaluation breaks hydration claiming.
	const band = children(() => props.band?.())
	const icon = children(() => props.icon?.())
	const hasBand = () => band() !== undefined || icon() !== undefined
	return (
		<Dynamic
			component={props.as ?? 'section'}
			{...attributes}
			{...colorTreatmentData(treatment())}
			{...knobs.attributes(props)}
			class={['ui-callout', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<Show when={hasBand()}>
				<header class="ui-callout-band" {...colorTreatmentData(bandTreatment())}>
					<Show when={icon()}>
						<span class="ui-callout-icon" aria-hidden="true">
							{icon()}
						</span>
					</Show>
					<div class="ui-callout-heading">{band()}</div>
				</header>
			</Show>
			<div class="ui-callout-body">{props.children}</div>
		</Dynamic>
	)
}
