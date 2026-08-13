/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'
import { useAccordionItemContext } from './context'

export { AccordionItemContext, type AccordionItemContextValue } from './context'

/** Per-instance styling contract (see shared/knobs.ts). Density/spacing stay
 * with the Accordion collection (see molecules/accordion), which owns the
 * presentation context its items share. */
const knobs = defineKnobs('ui-acc', {
	iconInk: '<color>',
	divider: '<color>',
})

type AccordionItemProps = Omit<JSX.DetailsHtmlAttributes<HTMLDetailsElement>, 'class'> & {
	class?: ClassProp
	summary: string | (() => JSX.Element)
	/** Exclusive-open group; defaults to the surrounding Accordion's. */
	group?: string
} & KnobProps<typeof knobs.spec>

export function AccordionItem(props: AccordionItemProps) {
	const accordion = useAccordionItemContext()
	const group = () => props.group ?? accordion.group()
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'summary',
		'group',
		'name',
		'iconInk',
		'divider',
	)
	return (
		<details
			{...attributes}
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
