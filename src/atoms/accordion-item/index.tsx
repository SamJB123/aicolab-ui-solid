import type { JSX } from '@solidjs/web'
import { type ParentProps } from 'solid-js'
import { useAccordionItemContext } from './context'

export { AccordionItemContext, type AccordionItemContextValue } from './context'

export function AccordionItem(
	props: ParentProps<{
		summary: string | (() => JSX.Element)
		group?: string
		open?: boolean
	}>,
	) {
	const accordion = useAccordionItemContext()
	const group = () => props.group ?? accordion.group()
	return (
		<details class="ui-acc" name={group()} open={props.open}>
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
