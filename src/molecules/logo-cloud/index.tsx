/** @jsxImportSource @solidjs/web */
import { For, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export type LogoItem = { name: string; src?: string }

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-logocloud', {
	columnGap: '<length>',
	rowGap: '<length>',
	logoMaxHeight: '<length>',
	logoMaxWidth: '<length>',
	nameInk: '<color>',
})

export function LogoCloud(
	props: {
		logos: LogoItem[]
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<ul
			class={['ui-logo-cloud', props.class]}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<For each={props.logos}>
				{(logo) => (
					<li class="ui-logo-item">
						<Show when={logo.src} fallback={<span class="ui-logo-name">{logo.name}</span>}>
							<img src={logo.src} alt={logo.name} loading="lazy" />
						</Show>
					</li>
				)}
			</For>
		</ul>
	)
}
