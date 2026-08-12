/** @jsxImportSource @solidjs/web */
import { type ParentProps } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'

export function Chip(
	props: ParentProps<{ tone?: 'plain' | 'accent' | 'live'; class?: ClassProp } & ColorTreatmentProps>,
) {
	const tone = () => props.tone ?? 'plain'
	return (
		<span {...colorTreatmentData(props)} class={['ui-chip', props.class]} data-tone={tone() === 'plain' ? undefined : tone()}>
			{props.children}
		</span>
	)
}
