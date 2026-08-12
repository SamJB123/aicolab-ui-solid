/** @jsxImportSource @solidjs/web */
import { type ParentProps } from 'solid-js'
import type { ClassProp, ColorTreatmentProps } from '../../shared/color-treatment'

export function Button(
	props: ParentProps<{
		onClick?: () => void
		/** Real native disabled — event suppression, focus exclusion and aria
		 *  semantics come from the <button> attribute, not a class hack. */
		disabled?: boolean
		class?: ClassProp
	} & ColorTreatmentProps>,
) {
	return (
		<button
			type="button"
			disabled={props.disabled}
			onClick={() => {
				if (!props.disabled) props.onClick?.()
			}}
			class={['ui-btn', props.class]}
			data-ui-color-base={props.colorBase ?? 'primary'}
			data-ui-color-level={props.colorLevel ?? 500}
			data-ui-color-variant={props.variant ?? 'solid'}
		>
			{props.children}
		</button>
	)
}
