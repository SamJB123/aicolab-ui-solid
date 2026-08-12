/** @jsxImportSource @solidjs/web */
import { type ParentProps } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'

export function Eyebrow(props: ParentProps<{ class?: ClassProp } & ColorTreatmentProps>) {
	return <span {...colorTreatmentData(props)} class={['ui-eyebrow', props.class]}>{props.children}</span>
}
