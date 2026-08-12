/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createEffect, Show } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import type { ClassProp } from '../../shared/color-treatment'

/**
 * A modal reading/work surface that enters from the inline edge on wide
 * screens and becomes a bottom sheet on compact screens. The caller owns
 * mounting and asynchronous content; this organism owns the adaptive shell.
 */
export function AdaptiveModalSheet(props: {
	open: boolean
	label: string
	title: JSX.Element
	eyebrow?: JSX.Element
	actions?: JSX.Element
	closeLabel?: string
	scrollLabel?: string
	onDismiss: () => void
	class?: ClassProp
	children?: JSX.Element
}) {
	let closeButton: HTMLButtonElement | undefined

	createEffect(
		() => props.open,
		(open) => {
			if (open) queueMicrotask(() => closeButton?.focus())
		},
	)

	return (
		<div
			class={['ui-adaptive-modal-sheet', props.class]}
			data-open={props.open ? '' : undefined}
			role="dialog"
			aria-modal="true"
			aria-label={props.label}
			onKeyDown={(event) => {
				event.stopPropagation()
				if (event.key === 'Escape') props.onDismiss()
			}}
		>
			<button
				class="ui-adaptive-modal-sheet-backdrop"
				type="button"
				aria-label={props.closeLabel ?? `Close ${props.label}`}
				onClick={props.onDismiss}
			/>
			<section class="ui-adaptive-modal-sheet-surface">
				<header class="ui-adaptive-modal-sheet-header">
					<div class="ui-adaptive-modal-sheet-heading">
						<Show when={props.eyebrow}>
							{(eyebrow) => <span class="ui-adaptive-modal-sheet-eyebrow">{eyebrow()}</span>}
						</Show>
						<strong class="ui-adaptive-modal-sheet-title">{props.title}</strong>
					</div>
					<Show when={props.actions}>
						{(actions) => <div class="ui-adaptive-modal-sheet-actions">{actions()}</div>}
					</Show>
					<IconButton
						class="ui-adaptive-modal-sheet-close"
						label={props.closeLabel ?? `Close ${props.label}`}
						onClick={props.onDismiss}
						ref={(element: HTMLButtonElement) => {
							closeButton = element
						}}
					>
						<span aria-hidden="true">×</span>
					</IconButton>
				</header>
				<div
					class="ui-adaptive-modal-sheet-body"
					tabindex="0"
					aria-label={props.scrollLabel}
					onWheel={(event) => event.stopPropagation()}
					onTouchMove={(event) => event.stopPropagation()}
				>
					{props.children}
				</div>
			</section>
		</div>
	)
}
