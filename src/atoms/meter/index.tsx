/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiColor } from '../../shared/knobs'

/** ink's wires land on the fill element itself (where it is consumed), so
 * both wires apply. The percentage is a MANDATORY wire (see shared/knobs.ts):
 * always emitted, registered directly in the stylesheet, no fallback
 * machinery — and no JS feature probing, since the stylesheet owns width
 * unconditionally and the inline part is only its input. */
const knobs = defineKnobs('ui-meter', { ink: '<color>' })

type MeterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
	value: number
	max: number
	/** @deprecated Use `ink`. */
	fillColor?: UiColor
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Meter(props: MeterProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'value',
		'max',
		'ink',
		'fillColor',
		'colorBase',
		'colorLevel',
		'variant',
	)
	const pct = () => Math.min(100, Math.round((props.value / props.max) * 100))
	const inkValue = () => ({ ink: props.ink ?? props.fillColor })
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			class={['ui-meter', props.class]}
			style={props.style}
		>
			<div
				class="ui-meter-fill"
				{...knobs.attributes(inkValue())}
				style={mergeKnobStyle(knobs.style(inkValue()), { '--ui-meter-pct': `${pct()}%` })}
			/>
		</div>
	)
}
