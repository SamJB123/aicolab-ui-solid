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
 * marks: `ink` recolours the black and grey parts of the artwork to the
 * scheme's ink (a black wordmark reads light; every colour stays as
 * drawn), `tile` sets the logo on a tile of the scheme's light anchor, and
 * none leaves it as drawn (a mark that already reads on dark). */
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

/* The `ink` treatment's filter: the artwork's black and grey marks flooded
   with the scheme's ink and laid over the original. A pixel is a mark to
   the degree it is both dark (its luminance low) and neutral (no channel
   far above that luminance); each measure passes through a steep ramp, so
   a saturated colour, however dark, and a pale tint, however neutral, are
   left alone, while black and grey take the ink in full. The weight is the
   product of the two, scaled by the artwork's own coverage so edges stay
   antialiased. The flood is a theme colour set in the stylesheet —
   transparent on a light scheme, so the artwork shows as drawn — which is
   what lets the treatment follow a forced scheme, as a CSS filter could
   not. One id serves every cloud on a page: the graph is the same in each. */
const INK_FILTER = 'ui-logo-cloud-ink'
const LUMA = '-0.2126 -0.7152 -0.0722'

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
							{/* darkness: alpha = 1 − luminance, opaque everywhere */}
							<feColorMatrix
								in="SourceGraphic"
								type="matrix"
								values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${LUMA} 0 1`}
								result="dark"
							/>
							<feComponentTransfer in="dark" result="dark-ramp">
								<feFuncA type="table" tableValues="0 0 0 0 0 0.33 0.67 1 1 1 1" />
							</feComponentTransfer>
							{/* colourfulness: each channel's excess over the luminance, clamped at 0 */}
							<feColorMatrix
								in="SourceGraphic"
								type="matrix"
								values="0.7874 -0.7152 -0.0722 0 0  -0.2126 0.2848 -0.0722 0 0  -0.2126 -0.7152 0.9278 0 0  0 0 0 0 1"
								result="excess"
							/>
							{/* neutrality: alpha = 1 − the excess summed */}
							<feColorMatrix
								in="excess"
								type="matrix"
								values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 -1 -1 0 1"
								result="neutral"
							/>
							<feComponentTransfer in="neutral" result="neutral-ramp">
								<feFuncA type="table" tableValues="0 0 0 0 0 0 0 0.5 1 1 1" />
							</feComponentTransfer>
							<feComposite in="dark-ramp" in2="neutral-ramp" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="weight" />
							<feFlood class="ui-logo-cloud-ink-flood" result="ink" />
							<feComposite in="ink" in2="weight" operator="in" result="tinted" />
							<feComposite in="tinted" in2="SourceAlpha" operator="in" result="tinted-covered" />
							<feComposite in="tinted-covered" in2="SourceGraphic" operator="over" />
						</filter>
					</defs>
				</svg>
			</Show>
			{items(false)}
			{items(true)}
		</div>
	)
}
