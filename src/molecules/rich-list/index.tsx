/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export function RichList(props: { label?: string; class?: ClassProp; children?: JSX.Element }) {
	return (
		<ul class={['ui-rich-list', props.class]} aria-label={props.label}>
			{props.children}
		</ul>
	)
}

/** A compound information row. Supplying onSelect makes the whole row one
 * native action; omitting it produces the same anatomy as static content. */
export function RichListItem(props: {
	leading?: JSX.Element
	leadingWidth?: 'auto' | 'wide'
	title: JSX.Element
	description?: JSX.Element
	trailing?: JSX.Element
	onSelect?: () => void
	/** Persistent selection, distinct from the transient hover affordance. */
	selected?: boolean
	label?: string
	class?: ClassProp
}) {
	const content = () => (
		<>
			<Show when={props.leading}>
				{(leading) => (
					<span class="ui-rich-list-leading" data-width={props.leadingWidth ?? 'auto'}>
						{leading()}
					</span>
				)}
			</Show>
			<span class="ui-rich-list-main">
				<span class="ui-rich-list-title">{props.title}</span>
				<Show when={props.description}>
					{(description) => <span class="ui-rich-list-description">{description()}</span>}
				</Show>
			</span>
			<Show when={props.trailing}>
				{(trailing) => <span class="ui-rich-list-trailing">{trailing()}</span>}
			</Show>
		</>
	)

	return (
		<li class="ui-rich-list-entry">
			<Show
				when={props.onSelect}
				fallback={
					<div
						class={['ui-rich-list-item', props.class]}
						data-selected={props.selected ? '' : undefined}
					>
						{content()}
					</div>
				}
			>
				{(onSelect) => (
					<button
						type="button"
						class={['ui-rich-list-item', props.class]}
						aria-label={props.label}
						aria-pressed={props.selected === undefined ? undefined : props.selected ? 'true' : 'false'}
						data-selected={props.selected ? '' : undefined}
						onClick={() => onSelect()()}
					>
						{content()}
					</button>
				)}
			</Show>
		</li>
	)
}
