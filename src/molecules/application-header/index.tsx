/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export function ApplicationHeader(props: {
	title: JSX.Element
	eyebrow?: JSX.Element
	/** Lazy slots keep reactive control state owned by the header subtree. */
	actions?: () => JSX.Element
	status?: () => JSX.Element
	class?: ClassProp
}) {
	return (
		<header class={['ui-application-header', props.class]}>
			<div class="ui-application-header-heading">
				<Show when={props.eyebrow}>
					{(eyebrow) => <div class="ui-application-header-eyebrow">{eyebrow()}</div>}
				</Show>
				<h1 class="ui-application-header-title">{props.title}</h1>
			</div>
			<Show when={props.actions}>
				<div class="ui-application-header-actions">{props.actions?.()}</div>
			</Show>
			<Show when={props.status}>
				<div class="ui-application-header-status">{props.status?.()}</div>
			</Show>
		</header>
	)
}
