/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createSignal, For, omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorBase,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export interface ToastOptions {
	/** Colour family; the whole three-axis treatment applies per toast. */
	colorBase?: ColorBase
	/** ms before auto-dismiss; 0 disables (sticky until closed). */
	duration?: number
	/** Second line under the message. */
	detail?: JSX.Element
}

interface ToastEntry {
	id: number
	message: JSX.Element
	colorBase: ColorBase
	duration: number
	detail?: JSX.Element
	/** 'alert' interrupts (errors); 'status' is polite. */
	role: 'status' | 'alert'
}

/* Module-level store: `toast(...)` is callable from anywhere (transfer
   loops, serverFn catch blocks) without threading context. ToastHost renders
   whatever is queued; without a mounted host, toasts queue harmlessly. */
const [entries, setEntries] = createSignal<ToastEntry[]>([])
let nextId = 0
const timers = new Map<number, ReturnType<typeof setTimeout>>()

export function dismissToast(id: number): void {
	const timer = timers.get(id)
	if (timer) clearTimeout(timer)
	timers.delete(id)
	setEntries((current) => current.filter((entry) => entry.id !== id))
}

function push(message: JSX.Element, options: ToastOptions | undefined, role: ToastEntry['role']) {
	const id = ++nextId
	const entry: ToastEntry = {
		id,
		message,
		colorBase: options?.colorBase ?? 'neutral',
		duration: options?.duration ?? 5000,
		detail: options?.detail,
		role,
	}
	setEntries((current) => [...current, entry])
	if (entry.duration > 0) {
		timers.set(
			id,
			setTimeout(() => dismissToast(id), entry.duration),
		)
	}
	return id
}

/** Show a toast. Returns its id (pass to `dismissToast`). */
export function toast(message: JSX.Element, options?: ToastOptions): number {
	return push(message, options, 'status')
}
toast.success = (message: JSX.Element, options?: ToastOptions) =>
	push(message, { colorBase: 'success', ...options }, 'status')
toast.info = (message: JSX.Element, options?: ToastOptions) =>
	push(message, { colorBase: 'info', ...options }, 'status')
toast.warning = (message: JSX.Element, options?: ToastOptions) =>
	push(message, { colorBase: 'warning', ...options }, 'status')
toast.error = (message: JSX.Element, options?: ToastOptions) =>
	push(message, { colorBase: 'error', duration: 0, ...options }, 'alert')

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-toast', {
	inset: '<length>',
	gap: '<length>',
	width: '<length>',
	radius: '<length-percentage>',
	pad: '<length>',
})

type ToastHostProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
} & KnobProps<typeof knobs.spec>

/**
 * The toast stack — mount ONCE near the app root. Each toast is a soft-
 * variant treated surface with a close button; timed toasts pause their
 * countdown while hovered.
 */
export function ToastHost(props: ToastHostProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'inset',
		'gap',
		'width',
		'radius',
		'pad',
	)
	const pause = (id: number): void => {
		const timer = timers.get(id)
		if (timer) {
			clearTimeout(timer)
			timers.delete(id)
		}
	}
	const resume = (entry: ToastEntry): void => {
		if (entry.duration > 0 && !timers.has(entry.id)) {
			timers.set(
				entry.id,
				setTimeout(() => dismissToast(entry.id), Math.min(entry.duration, 2500)),
			)
		}
	}
	// Host-consumed knobs (inset, gap, width) ride the host; radius/pad are
	// consumed on each TOAST, so their wires land per toast (the Meter
	// fill-element pattern).
	const hostValues = () => ({ inset: props.inset, gap: props.gap, width: props.width })
	const toastValues = () => ({ radius: props.radius, pad: props.pad })
	return (
		<div
			{...attributes}
			{...knobs.attributes(hostValues())}
			class={['ui-toast-host', props.class]}
			style={mergeKnobStyle(knobs.style(hostValues()), props.style)}
		>
			<For each={entries()}>
				{(entry) => (
					<div
						{...colorTreatmentData({ colorBase: entry.colorBase, variant: 'soft' })}
						{...knobs.attributes(toastValues())}
						class="ui-toast"
						role={entry.role}
						style={mergeKnobStyle(knobs.style(toastValues()), false)}
						onMouseEnter={() => pause(entry.id)}
						onMouseLeave={() => resume(entry)}
					>
						<div class="ui-toast-body">
							<span class="ui-toast-message">{entry.message}</span>
							<Show when={entry.detail !== undefined}>
								<span class="ui-toast-detail">{entry.detail}</span>
							</Show>
						</div>
						<button
							type="button"
							class="ui-toast-close"
							aria-label="Dismiss notification"
							onClick={() => dismissToast(entry.id)}
						>
							✕
						</button>
					</div>
				)}
			</For>
		</div>
	)
}
