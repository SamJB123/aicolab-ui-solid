/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). `width`/`height`
 * size the track; the thumb derives from the height. */
const knobs = defineKnobs('ui-switch', {
	width: '<length>',
	height: '<length>',
	accent: '<color>',
	thumb: '<color>',
	focusRing: '<color>',
})

type SwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'class' | 'type' | 'size'> & {
	class?: ClassProp
	/** Visible label text; omit it (and supply aria-label) for a bare switch. */
	children?: JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * An on/off toggle: a native checkbox with `role="switch"` (announced as a
 * switch, keyboard/forms stay native) painted as a track + sliding thumb.
 * For exclusive multi-way choice use Segmented/ToggleGroup instead.
 */
export function Switch(props: SwitchProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'colorBase',
		'colorLevel',
		'variant',
		'width',
		'height',
		'accent',
		'thumb',
		'focusRing',
	)
	// Knob wires land on the CONSUMING elements (the Meter fill-element
	// pattern): geometry on input + track, thumb colour + the height it
	// derives its travel from on the thumb — so BOTH wires apply everywhere.
	const geometry = () => ({ width: props.width, height: props.height })
	const trackValues = () => ({
		width: props.width,
		height: props.height,
		accent: props.accent,
		focusRing: props.focusRing,
	})
	const thumbValues = () => ({ height: props.height, thumb: props.thumb })
	return (
		<label {...colorTreatmentData(props)} class={['ui-switch', props.class]} style={props.style}>
			<input
				{...attributes}
				type="checkbox"
				role="switch"
				class="ui-switch-input"
				{...knobs.attributes(geometry())}
				style={mergeKnobStyle(knobs.style(geometry()), false)}
			/>
			<span
				class="ui-switch-track"
				aria-hidden="true"
				{...knobs.attributes(trackValues())}
				style={mergeKnobStyle(knobs.style(trackValues()), false)}
			>
				<span
					class="ui-switch-thumb"
					{...knobs.attributes(thumbValues())}
					style={mergeKnobStyle(knobs.style(thumbValues()), false)}
				/>
			</span>
			<Show when={props.children}>
				<span class="ui-switch-label">{props.children}</span>
			</Show>
		</label>
	)
}
