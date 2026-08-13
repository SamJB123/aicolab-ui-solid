/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). ToolPanel is the
 * OVERLAY environment provider — its surfaces stay the overlay tokens; the
 * treatment axes retarget only the ACCENT family (double border, section
 * header tint), primary by default. */
const knobs = defineKnobs('ui-toolpanel', {
	accent: '<color>',
	borderWidth: '<length>',
	width: '<length-percentage>',
	pad: '<length>',
	gap: '<length>',
})

export function ToolPanel(
	props: {
		label: string
		title: JSX.Element
		action?: () => JSX.Element
		class?: ClassProp
		children?: JSX.Element
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<aside
			class={['ui-tool-panel', props.class]}
			aria-label={props.label}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
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
