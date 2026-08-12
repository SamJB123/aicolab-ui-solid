/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export function RichList(props: { label?: string; navigation?: boolean; class?: ClassProp; children?: JSX.Element }) {
	return (
		<ul
			class={['ui-rich-list', props.class]}
			aria-label={props.label}
			data-navigation={props.navigation ? '' : undefined}
		>
			{props.children}
		</ul>
	)
}

/** Compact provenance/timing anatomy for the trailing edge of rich rows. */
export function RichListMetadata(props: {
	primary: JSX.Element
	secondary?: JSX.Element
	actions?: JSX.Element
	class?: ClassProp
}) {
	return (
		<span class={['ui-rich-list-metadata', props.class]}>
			<span class="ui-rich-list-metadata-primary">{props.primary}</span>
			<Show when={props.secondary}>
				{(secondary) => <span class="ui-rich-list-metadata-secondary">{secondary()}</span>}
			</Show>
			<Show when={props.actions}>
				{(actions) => <span class="ui-rich-list-metadata-actions">{actions()}</span>}
			</Show>
		</span>
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
	href?: string
	/** Persistent selection, distinct from the transient hover affordance. */
	selected?: boolean
	muted?: boolean
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

	const attributes = () => ({
		class: ['ui-rich-list-item', props.class],
		'data-selected': props.selected ? '' : undefined,
		'data-muted': props.muted ? '' : undefined,
		'data-ui-color-base': 'primary',
		'data-ui-color-level': 500,
		'data-ui-color-variant': props.selected ? 'solid' : 'soft',
	})

	return (
		<li class="ui-rich-list-entry">
			<Show
				when={props.href}
				fallback={
					<Show
						when={props.onSelect}
						fallback={<div {...attributes()}>{content()}</div>}
					>
						{(onSelect) => (
							<button
								type="button"
								{...attributes()}
								aria-label={props.label}
								aria-pressed={props.selected === undefined ? undefined : props.selected ? 'true' : 'false'}
								onClick={() => onSelect()()}
							>
								{content()}
							</button>
						)}
					</Show>
				}
			>
				{(href) => (
					<a {...attributes()} href={href()} aria-current={props.selected ? 'page' : undefined}>
						{content()}
					</a>
				)}
			</Show>
		</li>
	)
}
