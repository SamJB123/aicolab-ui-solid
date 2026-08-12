/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export function ToolPanel(props: {
	label: string
	title: JSX.Element
	action?: () => JSX.Element
	class?: ClassProp
	children?: JSX.Element
}) {
	return (
		<aside class={['ui-tool-panel', props.class]} aria-label={props.label}>
			<header class="ui-tool-panel-header">
				<strong class="ui-tool-panel-title">{props.title}</strong>
				<Show when={props.action}>{props.action?.()}</Show>
			</header>
			{props.children}
		</aside>
	)
}

export function ToolPanelSection(props: {
	title?: JSX.Element
	meta?: JSX.Element
	class?: ClassProp
	children?: JSX.Element
}) {
	return (
		<section class={['ui-tool-panel-section', props.class]}>
			<Show when={props.title || props.meta}>
				<header class="ui-tool-panel-section-header">
					<Show when={props.title}>{(title) => <strong>{title()}</strong>}</Show>
					<Show when={props.meta}>{(meta) => <span>{meta()}</span>}</Show>
				</header>
			</Show>
			{props.children}
		</section>
	)
}

export function ToolPanelActions(props: { wrap?: boolean; class?: ClassProp; children?: JSX.Element }) {
	return <div class={['ui-tool-panel-actions', props.class]} data-wrap={props.wrap ? 'true' : undefined}>{props.children}</div>
}

export function ToolPanelList(props: { class?: ClassProp; children?: JSX.Element }) {
	return <div class={['ui-tool-panel-list', props.class]}>{props.children}</div>
}
