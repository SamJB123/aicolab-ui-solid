/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { children, createEffect, Show } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The header is a
 * painted FAMILY surface (primary by default) — headerSurface/headerInk
 * travel as a pair and every header voice derives from them; `accent`
 * drives the seams, scrollbar and backdrop tint. The body stays the
 * structural base surface unless the surface knob overrides. */
const knobs = defineKnobs('ui-sheet', {
	headerSurface: '<color>',
	headerInk: '<color>',
	accent: '<color>',
	surface: '<color>',
	width: '<length>',
})

/**
 * A modal reading/work surface that enters from the inline edge on wide
 * screens and becomes a bottom sheet on compact screens. The caller owns
 * mounting and asynchronous content; this organism owns the adaptive shell.
 * The shell is a NATIVE top-layer <dialog>: modality, Escape (cancel),
 * focus containment and the ::backdrop come from the platform; the
 * component stays controlled through `open`/`onDismiss`.
 */
export function AdaptiveModalSheet(
	props: {
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
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	let dialog: HTMLDialogElement | undefined
	const eyebrow = children(() => props.eyebrow)
	const actions = children(() => props.actions)

	createEffect(
		() => props.open,
		(open) => {
			if (!dialog) return
			if (open && !dialog.open) dialog.showModal()
			else if (!open && dialog.open) dialog.close()
		},
	)

	return (
		<dialog
			class={['ui-adaptive-modal-sheet', props.class]}
			aria-label={props.label}
			ref={(element) => {
				dialog = element
			}}
			onCancel={(event) => {
				/* Stay controlled: the caller owns `open`. */
				event.preventDefault()
				props.onDismiss()
			}}
			onClick={(event) => {
				/* Clicks on ::backdrop land on the dialog element itself. */
				if (event.target === event.currentTarget) props.onDismiss()
			}}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<header class="ui-adaptive-modal-sheet-header">
				<div class="ui-adaptive-modal-sheet-heading">
					{/* Single-eval slot resolution (children()) — element-JSX props are
					    getters; double evaluation breaks hydration claiming. */}
					<Show when={eyebrow()}>
						<span class="ui-adaptive-modal-sheet-eyebrow">{eyebrow()}</span>
					</Show>
					<strong class="ui-adaptive-modal-sheet-title">{props.title}</strong>
				</div>
				<Show when={actions()}>
					<div class="ui-adaptive-modal-sheet-actions">{actions()}</div>
				</Show>
				<IconButton
					class="ui-adaptive-modal-sheet-close"
					label={props.closeLabel ?? `Close ${props.label}`}
					onClick={props.onDismiss}
					autofocus
				>
					<svg
						class="ui-adaptive-modal-sheet-close-icon"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path d="M6 6 18 18M18 6 6 18" />
					</svg>
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
		</dialog>
	)
}
