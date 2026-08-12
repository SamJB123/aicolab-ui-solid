/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { type ParentProps } from 'solid-js'
import type { ClassProp, ColorTreatmentProps } from '../../shared/color-treatment'

function treatmentAttributes(props: ColorTreatmentProps) {
	return {
		'data-ui-color-base': props.colorBase ?? 'primary',
		'data-ui-color-level': props.colorLevel ?? 500,
		'data-ui-color-variant': props.variant ?? 'solid',
	} as const
}

export function Button(
	props: ParentProps<{
		type?: 'button' | 'submit' | 'reset'
		onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>
		onMouseDown?: JSX.EventHandler<HTMLButtonElement, MouseEvent>
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
			type={props.type ?? 'button'}
			disabled={props.disabled}
			aria-pressed={props.pressed === undefined ? undefined : props.pressed ? 'true' : 'false'}
			title={props.title}
			role={props.role}
			popovertarget={props.popoverTarget}
			onClick={(event) => {
				if (!props.disabled) props.onClick?.(event)
			}}
			onMouseDown={props.onMouseDown}
			class={['ui-btn', props.class]}
			data-ui-color-base={props.colorBase ?? 'primary'}
			data-ui-color-level={props.colorLevel ?? 500}
			data-ui-color-variant={props.variant ?? 'solid'}
		>
			{props.children}
		</button>
	)
}

/** Native navigation with the same treatment contract as Button. */
export function ButtonLink(
	props: ParentProps<{
		href: string
		target?: '_blank' | '_self' | '_parent' | '_top'
		rel?: string
		title?: string
		class?: ClassProp
	} & ColorTreatmentProps>,
) {
	return (
		<a
			href={props.href}
			target={props.target}
			rel={props.rel}
			title={props.title}
			class={['ui-btn', props.class]}
			{...treatmentAttributes(props)}
		>
			{props.children}
		</a>
	)
}
