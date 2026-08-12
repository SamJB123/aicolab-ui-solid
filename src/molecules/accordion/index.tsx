import { createUniqueId, type ParentProps } from 'solid-js'
import { AccordionItemContext } from '../../atoms/accordion-item'
import type { ClassProp } from '../../shared/color-treatment'

export type AccordionSpacing = 'joined' | 'separated'
export type AccordionDensity = 'comfortable' | 'compact'

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
	}>,
) {
	const generatedGroup = `accordion-${createUniqueId()}`
	const group = () => (props.exclusive ?? true ? (props.group ?? generatedGroup) : undefined)

	return (
		<AccordionItemContext value={{ group }}>
			<div
				class={['ui-accordion', props.class]}
				aria-label={props.label}
				data-ui-accordion-spacing={props.spacing ?? 'joined'}
				data-ui-accordion-density={props.density ?? 'comfortable'}
			>
				{props.children}
			</div>
		</AccordionItemContext>
	)
}
