/** @jsxImportSource @solidjs/web */
import { type ParentProps } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'

export function Chip(
	props: ParentProps<{ tone?: 'plain' | 'accent' | 'live'; class?: ClassProp } & ColorTreatmentProps>,
) {
	const tone = () => props.tone ?? 'plain'
	const colorBase = () => props.colorBase ?? (tone() === 'live' ? 'success' : tone() === 'accent' ? 'primary' : undefined)
	const variant = () => props.variant ?? (tone() === 'plain' ? undefined : 'soft')
	return (
		<span
			{...colorTreatmentData({ colorBase: colorBase(), colorLevel: props.colorLevel, variant: variant() })}
			class={['ui-chip', props.class]}
		>
			{props.children}
		</span>
	)
}
