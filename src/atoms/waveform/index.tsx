/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { For, omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiColor } from '../../shared/knobs'

/** ink is a knob; each bar's level is a MANDATORY wire (--ui-wave-v, a
 * 0..1 number emitted per bar every render — see shared/knobs.ts) from
 * which the stylesheet derives both height and opacity. */
const knobs = defineKnobs('ui-wave', { ink: '<color>' })

type WaveformProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
	bars: number[]
	/** @deprecated Use `ink`. */
	barColor?: UiColor
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Waveform(props: WaveformProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'bars',
		'ink',
		'barColor',
		'colorBase',
		'colorLevel',
		'variant',
	)
	const values = () => ({ ink: props.ink ?? props.barColor })
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(values())}
			class={['ui-waveform', props.class]}
			style={mergeKnobStyle(knobs.style(values()), props.style)}
		>
			<For each={props.bars}>
				{(v) => <div class="ui-waveform-bar" style={{ '--ui-wave-v': String(v) }} />}
			</For>
		</div>
	)
}
