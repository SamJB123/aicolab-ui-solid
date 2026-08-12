/** @jsxImportSource @solidjs/web */
import { type ParentProps } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
export function IconButton(
	props: ParentProps<{
		onClick?: () => void
		label: string
		title?: string
		size?: 'sm' | 'md' | 'lg'
		disabled?: boolean
		class?: ClassProp
		ref?: (element: HTMLButtonElement) => void
	}>,
) {
	return (
		<button
			type="button"
			aria-label={props.label}
			title={props.title}
			disabled={props.disabled}
			ref={props.ref}
			onClick={() => props.onClick?.()}
			class={['ui-iconbtn', props.class]}
			data-size={props.size ?? 'md'}
		>
			{props.children}
		</button>
	)
}
