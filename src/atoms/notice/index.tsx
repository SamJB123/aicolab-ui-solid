/** @jsxImportSource @solidjs/web */
import type { ParentProps } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'

export function Notice(props: ParentProps<{
	class?: ClassProp
	role?: 'status' | 'alert'
} & ColorTreatmentProps>) {
	return (
		<div
			{...colorTreatmentData(props)}
			class={['ui-notice', props.class]}
			role={props.role ?? 'status'}
		>
			{props.children}
		</div>
	)
}
