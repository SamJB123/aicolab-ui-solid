/** @jsxImportSource @solidjs/web */
// Shared interactive controls: a sliding segmented switcher, an icon button,
// a labelled field wrapper, and a reusable outside/Escape dismiss hook.
// Extracted verbatim from solid-playground's dashboard controls.

import type { JSX } from '@solidjs/web'
import { For, onSettled, type ParentProps } from 'solid-js'
import type { ClassProp } from './primitives'

export type SegOption<T extends string> = { id: T; label: string }

// The tabs are content-sized and the strip scrolls when there are too many for
// the viewport (so labels never truncate or shrink the columns). The active
// indicator is a single pill anchored — via CSS anchor positioning — to whichever
// tab is active, so it always matches that tab's real box regardless of widths or
// scroll. Where anchor positioning is unsupported, the active tab carries the
// pill look itself (see styles.css `.seg*`).
export function Segmented<T extends string>(props: {
	options: SegOption<T>[]
	value: T
	onChange: (v: T) => void
}) {
	return (
		<div class="seg" role="tablist">
			<For each={props.options}>
				{(o) => (
					<button
						type="button"
						role="tab"
						aria-selected={props.value === o.id ? 'true' : 'false'}
						onClick={(e) => {
							props.onChange(o.id)
							// One-shot side effect: keep the clicked tab visible when the
							// strip scrolls. Called directly in the handler (per the Solid
							// cheatsheet) — no reactive effect needed.
							e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
						}}
						class={['seg-btn', { 'seg-btn-active': props.value === o.id }]}
					>
						{o.label}
					</button>
				)}
			</For>
			<span class="seg-pill" aria-hidden="true" />
		</div>
	)
}

export function IconButton(
	props: ParentProps<{ onClick?: () => void; label: string; class?: ClassProp }>,
) {
	return (
		<button
			type="button"
			aria-label={props.label}
			onClick={() => props.onClick?.()}
			class={[
				'grid h-9 w-9 place-items-center rounded-full text-[var(--c-muted)] ring-1 ring-[var(--c-line)] transition-all duration-200 hover:bg-[var(--c-panel-2)] hover:text-[var(--c-paper)] active:scale-90',
				props.class,
			]}
		>
			{props.children}
		</button>
	)
}

/** Close a disclosure on outside mousedown / Escape. Call from component setup. */
export function dismissOnOutside(getRoot: () => HTMLElement | undefined, close: () => void): void {
	onSettled(() => {
		const onDoc = (e: MouseEvent) => {
			const r = getRoot()
			if (r && e.target instanceof Node && !r.contains(e.target)) close()
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close()
		}
		document.addEventListener('mousedown', onDoc)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDoc)
			document.removeEventListener('keydown', onKey)
		}
	})
}

export function Field(props: ParentProps<{ label: string; class?: ClassProp }>) {
	const child = (): JSX.Element => props.children
	return (
		<div class={['flex flex-col gap-1.5', props.class]}>
			<span class="font-data text-[10px] uppercase tracking-[0.2em] text-[var(--c-faint)]">
				{props.label}
			</span>
			{child()}
		</div>
	)
}
