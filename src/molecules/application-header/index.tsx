/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The treatment axes
 * retarget the ACCENT family (double border, shadow tint) — the surface
 * stays the app chrome's base unless the surface knob says otherwise. */
const knobs = defineKnobs('ui-apph', {
	accent: '<color>',
	borderWidth: '<length>',
	surface: '<color>',
	padBlock: '<length>',
	padInline: '<length>',
	titleInk: '<color>',
	eyebrowInk: '<color>',
})

export function ApplicationHeader(
	props: {
		title: JSX.Element
		eyebrow?: JSX.Element
		/** Lazy slots keep reactive control state owned by the header subtree. */
		actions?: () => JSX.Element
		status?: () => JSX.Element
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<header
			class={['ui-application-header', props.class]}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<div class="ui-application-header-heading">
				<Show when={props.eyebrow}>
					{(eyebrow) => <div class="ui-application-header-eyebrow">{eyebrow()}</div>}
				</Show>
				<h1 class="ui-application-header-title">{props.title}</h1>
			</div>
			<Show when={props.status || props.actions}>
				<div class="ui-application-header-end">
					<Show when={props.status}>
						<div class="ui-application-header-status">{props.status?.()}</div>
					</Show>
					<Show when={props.actions}>
						<div class="ui-application-header-actions">{props.actions?.()}</div>
					</Show>
				</div>
			</Show>
		</header>
	)
}
