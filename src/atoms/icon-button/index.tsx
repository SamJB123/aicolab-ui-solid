/** @jsxImportSource @solidjs/web */
import { type ParentProps } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
export function IconButton(
	props: ParentProps<{
		onClick?: () => void
		label: string
		disabled?: boolean
		class?: ClassProp
	}>,
) {
	return (
		<button
			type="button"
			aria-label={props.label}
			disabled={props.disabled}
			onClick={() => props.onClick?.()}
			class={['ui-iconbtn', props.class]}
		>
			{props.children}
		</button>
	)
}
