/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'
import { useAccordionItemContext } from './context'

export { AccordionItemContext, type AccordionItemContextValue } from './context'

/** Per-instance styling contract (see shared/knobs.ts). Density/spacing stay
 * with the Accordion collection (see molecules/accordion), which owns the
 * presentation context its items share — the collection also accepts these
 * same knob props as defaults for every row (they ride the inheriting public
 * variables; a knob set on an individual item wins). */
const knobs = defineKnobs('ui-acc', {
	padBlock: '<length>',
	padInline: '<length>',
	gap: '<length>',
	radius: '<length-percentage>',
	iconSize: '<length>',
	iconInk: '<color>',
	summaryFontSize: '<length>',
	bodyInk: '<color>',
	bodySurface: '<color>',
	divider: '<color>',
})
export { knobs as accordionItemKnobs }

type AccordionItemProps = Omit<JSX.DetailsHtmlAttributes<HTMLDetailsElement>, 'class'> & {
	class?: ClassProp
	summary: string | (() => JSX.Element)
	/** Exclusive-open group; defaults to the surrounding Accordion's. */
	group?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function AccordionItem(props: AccordionItemProps) {
	const accordion = useAccordionItemContext()
	const group = () => props.group ?? accordion.group()
	/* A surrounding Accordion's colour treatment is the per-prop default; the
	   item's own props win. (Knob defaults need no JS relay — they inherit as
	   public custom properties from the collection root.) */
	const treatment = (): ColorTreatmentProps => ({
		colorBase: props.colorBase ?? accordion.treatment().colorBase,
		colorLevel: props.colorLevel ?? accordion.treatment().colorLevel,
		variant: props.variant ?? accordion.treatment().variant,
	})
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'summary',
		'group',
		'name',
		'colorBase',
		'colorLevel',
		'variant',
		'padBlock',
		'padInline',
		'gap',
		'radius',
		'iconSize',
		'iconInk',
		'summaryFontSize',
		'bodyInk',
		'bodySurface',
		'divider',
	)
	return (
		<details
			{...attributes}
			{...colorTreatmentData(treatment())}
			{...knobs.attributes(props)}
			name={group()}
			class={['ui-acc', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<summary>
				<span class="ui-acc-title">
					{typeof props.summary === 'function' ? props.summary() : props.summary}
				</span>
				<span class="ui-acc-icon" aria-hidden="true" />
			</summary>
			<div class="ui-acc-body">{props.children}</div>
		</details>
	)
}
