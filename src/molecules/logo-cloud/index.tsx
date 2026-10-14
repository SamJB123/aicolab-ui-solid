/** @jsxImportSource @solidjs/web */
import { For, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** One logo. `onDark` says how its artwork reads on a dark scheme — a
 * decision per brand, since brands differ in what may be done to their
 * marks: `ink` recolours the dark parts of the artwork to the scheme's ink
 * (a black wordmark reads light; coloured parts keep their hue), `tile`
 * sets the logo on a tile of the scheme's light anchor, and none leaves
 * it as drawn (a mark that already reads on dark). */
export type LogoItem = { name: string; src?: string; onDark?: 'ink' | 'tile' }

/** Per-instance styling contract (see shared/knobs.ts). `duration` is the
 * seconds one pass of the marquee takes. */
const knobs = defineKnobs('ui-logocloud', {
	gap: '<length>',
	logoHeight: '<length>',
	logoMaxWidth: '<length>',
	duration: '<number>',
	nameInk: '<color>',
})

/* The `ink` treatment's filter: the artwork's dark parts (alpha less
   luminance) flooded with the scheme's ink and laid over the original. The
   flood is a theme colour set in the stylesheet — transparent on a light
   scheme, so the artwork shows as drawn — which is what lets the treatment
   follow a forced scheme, as a CSS filter could not. One id serves every
   cloud on a page: the graph is the same in each. */
const INK_FILTER = 'ui-logo-cloud-ink'

/**
 * A marquee of logos: one continuous row that drifts sideways and loops,
 * pauses under the pointer, fades at its edges, and lifts a logo on hover.
 * Under reduced motion it is a wrapping row that does not move.
 */
export function LogoCloud(
	props: {
		logos: LogoItem[]
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	const items = (hidden: boolean) => (
		<ul class="ui-logo-cloud-track" aria-hidden={hidden ? 'true' : undefined}>
			<For each={props.logos}>
				{(logo) => (
					<li class="ui-logo-item" data-on-dark={logo.onDark}>
						<Show when={logo.src} fallback={<span class="ui-logo-name">{logo.name}</span>}>
							<img src={logo.src} alt={hidden ? '' : logo.name} />
						</Show>
					</li>
				)}
			</For>
		</ul>
	)
	return (
		<div
			class={['ui-logo-cloud', props.class]}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<Show when={props.logos.some((logo) => logo.onDark === 'ink')}>
				<svg class="ui-logo-cloud-filter" aria-hidden="true">
					<defs>
						<filter id={INK_FILTER} color-interpolation-filters="sRGB">
							<feColorMatrix
								in="SourceGraphic"
								type="matrix"
								values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.2126 -0.7152 -0.0722 1 0"
								result="dark-marks"
							/>
							<feFlood class="ui-logo-cloud-ink-flood" result="ink" />
							<feComposite in="ink" in2="dark-marks" operator="in" result="tinted" />
							<feComposite in="tinted" in2="SourceGraphic" operator="over" />
						</filter>
					</defs>
				</svg>
			</Show>
			{items(false)}
			{items(true)}
		</div>
	)
}
