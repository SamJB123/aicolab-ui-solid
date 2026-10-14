/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). size is the mark's
 * height; ink draws the line and, in the solid tone, the shell and frame;
 * cells is the ten cells' colour in the solid tone; lineWidth is the line
 * tone's stroke, in screen pixels at any size. */
const knobs = defineKnobs('ui-colabmark', {
	size: '<length>',
	ink: '<color>',
	cells: '<color>',
	lineWidth: '<length>',
})

/* The AI CoLab mark, as drawn in platform/landing/public/ai-colab-logo.svg
   (the paths verbatim; the file's provenance manifest and its own colours
   stay with the file): a hexagonal shell, the window cut into it, the
   frame line inside the window with its tail, and ten cells. */
const VIEW_BOX = '0 0 799.97 907.47'
const SHELL =
	'M406.6,1.03l9.74,3.74c.75.29,1.48.64,2.18,1.04l373.23,215.33c4.76,2.75,7.71,7.81,7.74,13.3.74,144.2.55,291.32-.01,436.65-.02,5.49-2.96,10.56-7.71,13.31l-381.58,220.99c-4.79,2.77-10.69,2.78-15.48,0L7.72,681.7C2.93,678.93-.02,673.81,0,668.27L1.31,236.98c.02-5.39,2.83-10.39,7.44-13.18C135.23,147.15,265.3,76.25,393.32,2.08c4.04-2.34,8.92-2.73,13.28-1.06Z'
const WINDOW =
	'M407.28,52.93c115.47,62.1,229,130.36,343.35,195.49,4.83,2.75,7.81,7.87,7.81,13.42v381.89c0,5.52-2.95,10.63-7.73,13.39l-340.56,196.45c-4.77,2.75-10.65,2.76-15.42.01L52.83,657.12c-4.8-2.76-7.76-7.87-7.76-13.4v-381.91c0-5.53,2.96-10.64,7.75-13.4L392.25,53.15c4.64-2.67,10.32-2.76,15.03-.22Z'
const FRAME =
	'M408.78,68.3l328.21,188.28c4.81,2.76,7.78,7.89,7.77,13.44l-.6,282.61c-.03,12.77-14.66,20-24.82,12.26l-9.47-7.21c-3.84-2.92-6.09-7.47-6.09-12.3v-252.23c0-5.52-2.95-10.63-7.73-13.39L410.15,114.72c-4.77-2.76-10.65-2.76-15.43-.02L107.54,279.75c-4.83,2.77-7.79,7.93-7.75,13.49l1.94,321.19c.03,5.5,2.99,10.57,7.76,13.31l283.91,163.09c4.76,2.73,10.6,2.74,15.37.02l221.61-126.62c4.45-2.54,9.88-2.71,14.48-.45l9.78,4.8c11.08,5.44,11.62,21.03.95,27.24l-245.41,142.68c-4.79,2.78-10.7,2.79-15.5.02l-328.22-189.59c-4.78-2.76-7.73-7.86-7.73-13.38v-365.57c0-5.53,2.95-10.64,7.74-13.39L393.37,68.31c4.77-2.75,10.63-2.75,15.41-.01Z'
const CELLS = [
	'M637.2,347.85l29.37,50.92c2.76,4.78,2.76,10.67,0,15.45l-31.41,54.41c-2.71,4.7-7.7,7.64-13.13,7.73l-56.83.96c-5.61.09-10.82-2.85-13.63-7.7l-30.82-53.19c-2.77-4.79-2.78-10.69-.01-15.48l30.17-52.26c2.72-4.71,7.72-7.65,13.17-7.73l59.53-.84c5.6-.08,10.81,2.88,13.61,7.73Z',
	'M502.22,584.36l28.01,51.12c2.59,4.73,2.53,10.48-.17,15.16l-30.94,53.6c-2.7,4.68-7.64,7.6-13.04,7.72l-58.28,1.3c-5.75.13-11.1-2.95-13.88-7.99l-29.46-53.4c-2.62-4.74-2.56-10.51.15-15.2l29.7-51.43c2.71-4.69,7.67-7.62,13.09-7.73l60.97-1.19c5.75-.11,11.09,2.98,13.86,8.03Z',
	'M252.05,439.91l29.34,53.46c2.6,4.75,2.54,10.51-.18,15.19l-29.81,51.37c-2.72,4.68-7.69,7.6-13.1,7.7l-61.12,1.05c-5.68.1-10.95-2.92-13.73-7.87l-28.3-50.25c-2.69-4.77-2.65-10.61.1-15.34l31.61-54.46c2.71-4.67,7.66-7.59,13.06-7.7l58.28-1.17c5.75-.12,11.09,2.97,13.86,8.02Z',
	'M386.89,203.24l30.29,51.58c2.82,4.8,2.84,10.74.06,15.56l-30.79,53.33c-2.7,4.68-7.64,7.6-13.04,7.72l-58.48,1.3c-5.65.13-10.91-2.84-13.73-7.73l-29.32-50.85c-2.76-4.78-2.76-10.67,0-15.45l31.41-54.41c2.71-4.7,7.7-7.64,13.13-7.73l56.89-.96c5.57-.09,10.77,2.82,13.59,7.63Z',
	'M505.52,429.67l29.89,52.51c2.71,4.77,2.7,10.62-.05,15.37l-29.64,51.34c-2.7,4.68-7.64,7.6-13.04,7.72l-59.77,1.33c-5.32.12-10.33-2.5-13.25-6.94-8.18-12.45-23.08-38.05-29.69-51.27-2.32-4.64-2.14-10.12.45-14.61l31.52-54.59c2.71-4.7,7.7-7.64,13.13-7.73l56.75-.95c5.65-.1,10.9,2.9,13.69,7.81Z',
	'M381.88,358.27l28.47,50.29c2.7,4.76,2.67,10.6-.07,15.34l-31.46,54.48c-2.71,4.7-7.7,7.64-13.13,7.73l-56.67.95c-5.69.1-10.98-2.95-13.75-7.92l-28.96-51.83c-2.66-4.75-2.61-10.55.11-15.27l30.83-53.4c2.74-4.74,7.78-7.68,13.25-7.73l57.78-.49c5.62-.05,10.82,2.95,13.58,7.84Z',
	'M511.28,278.2l27.45,49.44c2.68,4.82,2.58,10.7-.25,15.44l-31.7,53c-2.75,4.6-7.69,7.45-13.05,7.52l-54.61.76c-5.24.07-10.15-2.52-13.07-6.87-8.17-12.17-20.93-37.04-27.91-50.42-2.45-4.69-2.33-10.3.31-14.88l30.95-53.6c2.73-4.73,7.75-7.67,13.21-7.73l54.98-.61c5.68-.06,10.93,2.99,13.69,7.95Z',
	'M375.96,512.82l27.45,49.45c2.64,4.75,2.59,10.53-.13,15.23l-30.29,52.47c-2.71,4.69-7.67,7.62-13.08,7.73l-54.01,1.07c-5.68.11-10.96-2.9-13.76-7.84l-28.41-50.19c-2.7-4.76-2.67-10.6.07-15.34l29.67-51.39c2.69-4.66,7.61-7.59,12.99-7.72l55.59-1.41c5.75-.15,11.11,2.92,13.91,7.95Z',
	'M629.62,502.63l27.3,46.91c2.79,4.79,2.8,10.7.03,15.5l-32.02,55.46c-2.71,4.69-7.67,7.62-13.08,7.73l-53.92,1.06c-5.72.11-11.04-2.95-13.82-7.95l-27.48-49.5c-2.64-4.75-2.59-10.53.13-15.23l30.32-52.52c2.69-4.66,7.61-7.59,12.99-7.72l55.8-1.41c5.64-.14,10.91,2.8,13.75,7.68Z',
	'M257.72,288.19l27.4,49.36c2.68,4.82,2.58,10.7-.25,15.44l-31.68,52.98c-2.76,4.61-7.72,7.46-13.09,7.52l-55.1.61c-5.69.06-10.96-3.01-13.71-7.99l-26.07-47.28c-2.61-4.74-2.56-10.5.15-15.19l31.53-54.61c2.71-4.69,7.67-7.62,13.08-7.73l53.92-1.06c5.72-.11,11.04,2.95,13.82,7.95Z',
]

/** The artwork once, for one layer. The solid layer's shell carries the
 * window as a second subpath under the even-odd rule, so the window is cut
 * out of it and whatever the mark sits on shows through; the line layer
 * strokes the shell's outer edge, the frame and the cells, and leaves the
 * window edge undrawn (the frame already runs along it). */
function Artwork(props: { layer: 'line' | 'solid' }) {
	const shell = () => (props.layer === 'solid' ? `${SHELL}${WINDOW}` : SHELL)
	return (
		<>
			<path class="ui-colab-mark-shell" d={shell()} fill-rule="evenodd" />
			<path class="ui-colab-mark-frame" d={FRAME} />
			{CELLS.map((d) => (
				<path class="ui-colab-mark-cells" d={d} />
			))}
		</>
	)
}

type CoLabMarkProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	/** `line` = the mark as a line drawing in the ink. `solid` = the mark
	 *  filled: shell and frame in the ink, the cells in their colour, the
	 *  window open. `reveal` = the line drawing at rest; the solid mark fades
	 *  in while the link or button the mark sits in is hovered or focused. */
	tone?: 'line' | 'solid' | 'reveal'
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * The AI CoLab mark. Decorative — it carries no name of its own, so it sits
 * beside the wordmark or inside a labelled link. Both layers are drawn from
 * the same paths, so the reveal tone is a pure crossfade.
 */
export function CoLabMark(props: CoLabMarkProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'tone',
		'colorBase',
		'colorLevel',
		'variant',
		'size',
		'ink',
		'cells',
		'lineWidth',
	)
	const tone = () => props.tone ?? 'line'
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			data-tone={tone()}
			class={['ui-colab-mark', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			aria-hidden="true"
		>
			<svg viewBox={VIEW_BOX}>
				<Show when={tone() !== 'solid'}>
					<g class="ui-colab-mark-line">
						<Artwork layer="line" />
					</g>
				</Show>
				<Show when={tone() !== 'line'}>
					<g class="ui-colab-mark-solid">
						<Artwork layer="solid" />
					</g>
				</Show>
			</svg>
		</span>
	)
}
