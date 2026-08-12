/** @jsxImportSource @solidjs/web */
import type { ParentProps } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'

/** A native button for continuous press interactions such as movement, voice,
 * scrubbing, or spatial controls. Pointer capture keeps release semantics
 * reliable when a pointer leaves the button. */
export function HoldButton(props: ParentProps<{
	onPressedChange: (pressed: boolean) => void
	disabled?: boolean
	class?: ClassProp
} & ColorTreatmentProps>) {
	const release = () => props.onPressedChange(false)
	return (
		<button
			{...colorTreatmentData(props)}
			type="button"
			disabled={props.disabled}
			class={['ui-hold-button', props.class]}
			onPointerDown={(event) => {
				if (props.disabled) return
				event.currentTarget.setPointerCapture(event.pointerId)
				props.onPressedChange(true)
			}}
			onPointerUp={release}
			onPointerCancel={release}
			onLostPointerCapture={release}
		>
			{props.children}
		</button>
	)
}
