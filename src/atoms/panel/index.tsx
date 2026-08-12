/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { type ParentProps, Show } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'

export function Panel(
	props: ParentProps<{
		index?: string
		title: string
		kicker?: string
		// A render function (lazy slot), not a pre-created element: created in
		// Panel's own scope so its hydration keys align (a pre-created element
		// from the caller's scope leaves an unclaimed node on hydration).
		action?: () => JSX.Element
		class?: ClassProp
		style?: JSX.CSSProperties
		glow?: boolean
	} & ColorTreatmentProps>,
) {
	return (
		// `group` is kept as a marker class for consumers' group-hover styling.
		<section {...colorTreatmentData(props)} class={['ui-panel group', props.class]} style={props.style}>
			<Show when={props.glow}>
				<span class="ui-panel-glow" />
			</Show>
			<header>
				<div class="ui-panel-head-left">
					<Show when={props.index}>
						<span class="ui-panel-index">{props.index}</span>
					</Show>
					<div>
						<h2>{props.title}</h2>
						<Show when={props.kicker}>
							<p class="ui-panel-kicker">{props.kicker}</p>
						</Show>
					</div>
				</div>
				{props.action?.()}
			</header>
			{props.children}
		</section>
	)
}
