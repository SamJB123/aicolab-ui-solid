/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { type ParentProps } from 'solid-js'
import type { ClassProp, ColorTreatmentProps } from '../../shared/color-treatment'

export function Button(
	props: ParentProps<{
		onClick?: () => void
		/** Real native disabled — event suppression, focus exclusion and aria
		 *  semantics come from the <button> attribute, not a class hack. */
		disabled?: boolean
		pressed?: boolean
		title?: string
		role?: JSX.HTMLAttributes<HTMLButtonElement>['role']
		/** Native Popover API target for declarative overlay triggers. */
		popoverTarget?: string
		class?: ClassProp
	} & ColorTreatmentProps>,
) {
	return (
		<button
			type="button"
			disabled={props.disabled}
			aria-pressed={props.pressed === undefined ? undefined : props.pressed ? 'true' : 'false'}
			title={props.title}
			role={props.role}
			popovertarget={props.popoverTarget}
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
