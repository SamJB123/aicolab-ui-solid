import { createUniqueId, type ParentProps } from 'solid-js'
import { AccordionItemContext, accordionItemKnobs } from '../../atoms/accordion-item'
import type { ClassProp, ColorTreatmentProps } from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export type AccordionSpacing = 'joined' | 'separated'
export type AccordionDensity = 'comfortable' | 'compact'

/** The collection's own knob; the gap between 'separated' items. */
const knobs = defineKnobs('ui-accordion', {
	itemGap: '<length>',
})

export function Accordion(
	props: ParentProps<{
		/** Native exclusive-open grouping. Enabled by default. */
		exclusive?: boolean
		/** Overrides the generated native details group name. */
		group?: string
		spacing?: AccordionSpacing
		density?: AccordionDensity
		label?: string
		class?: ClassProp
	}> &
		/* Colour treatment reaches the items through the shared context (the
		   resolver runs per item, exactly as if each carried the props). */
		ColorTreatmentProps &
		KnobProps<typeof knobs.spec> &
		/* Item knob props accepted here become defaults for every row. They
		   ride the inheriting public custom properties — no data attributes on
		   this root, since attr() only reads the matched element and these are
		   consumed by the items' own sheets. An item's own knob wins. */
		KnobProps<typeof accordionItemKnobs.spec>,
) {
	const generatedGroup = `accordion-${createUniqueId()}`
	const group = () => (props.exclusive ?? true ? (props.group ?? generatedGroup) : undefined)

	return (
		<AccordionItemContext value={{ group, treatment: () => props }}>
			<div
				class={['ui-accordion', props.class]}
				aria-label={props.label}
				data-ui-accordion-spacing={props.spacing ?? 'joined'}
				data-ui-accordion-density={props.density ?? 'comfortable'}
				{...knobs.attributes(props)}
				style={mergeKnobStyle(knobs.style(props), accordionItemKnobs.style(props))}
			>
				{props.children}
			</div>
		</AccordionItemContext>
	)
}
