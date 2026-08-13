/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, toLength, type UiLength } from '../../shared/knobs'

/** Colour + liveness for a status indicator. Apps map their own status
 *  vocabulary (online/away/flow/…) onto this shape. */
export type StatusVisual = { color: string; live?: boolean }

/** size is a knob; the status colour is a MANDATORY wire (--ui-dot-color,
 * supplied every render — see shared/knobs.ts) that the stylesheet ignores
 * in favour of the treatment family colour when treated. */
const knobs = defineKnobs('ui-dot', { size: '<length>' })

type StatusDotProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	status: StatusVisual
	/** Bare number = px (legacy convention); measurements/vars also accepted. */
	size?: number | UiLength
} & ColorTreatmentProps

export function StatusDot(props: StatusDotProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'status',
		'size',
		'colorBase',
		'colorLevel',
		'variant',
	)
	const values = () => ({ size: toLength(props.size) })
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(values())}
			class={['ui-dot', props.class]}
			style={mergeKnobStyle(knobs.style(values()), {
				'--ui-dot-color': props.status.color,
				...(typeof props.style === 'object' ? props.style : undefined),
			})}
		>
			<Show when={props.status.live}>
				<span class="ui-dot-ping" />
			</Show>
			<span class="ui-dot-core" />
		</span>
	)
}
