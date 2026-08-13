/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { For, Show } from 'solid-js'
import { Panel } from '../../atoms/panel'
import type { ClassProp, ColorTreatmentProps } from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiColor } from '../../shared/knobs'

export type Feature = {
	title: string
	body: JSX.Element
	icon?: JSX.Element
	/** Per-item accent hue (icon tint + wash); defaults to the grid's accent
	 *  knob, then the house accent. */
	accent?: UiColor
}

/** Per-instance styling contract (see shared/knobs.ts). `accent` doubles as
 * the grid-level default for per-item accents (it rides the inheriting
 * public variable; an item's own accent wins on its card). */
const knobs = defineKnobs('ui-feature', {
	gap: '<length>',
	iconSize: '<length>',
	iconRadius: '<length-percentage>',
	accent: '<color>',
})

/** Responsive card grid for feature/value/pillar sets. Cards are composed
 * Panels — treatment drills into each card; card surface/radius/pad ride
 * Panel's own knob contract (settable per grid via Panel's public vars). */
export function FeatureGrid(
	props: {
		items: Feature[]
		columns?: 2 | 3
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<div
			class={['ui-feature-grid', props.class]}
			data-columns={String(props.columns ?? 3)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<For each={props.items}>
				{(item) => (
					<Panel
						class="ui-feature-card ui-reveal"
						title={item.title}
						colorBase={props.colorBase}
						colorLevel={props.colorLevel}
						variant={props.variant}
						{...knobs.attributes({ accent: item.accent })}
						style={knobs.style({ accent: item.accent })}
					>
						<Show when={item.icon}>
							<span class="ui-feature-icon">{item.icon}</span>
						</Show>
						<div class="ui-feature-body">{item.body}</div>
					</Panel>
				)}
			</For>
		</div>
	)
}
