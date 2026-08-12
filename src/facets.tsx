/** @jsxImportSource @solidjs/web */
// Facets — N facets of one subject; one expanded at a time. Ported from the
// legacy site's ExpandableSectors (tabs across the top + a glyph rail on the
// left + a swapped content pane), generalised: content is a JSX slot, the tab
// row has three visual variants (A/B-testable via `tabStyle`), and the pane
// swap rides element-scoped view transitions (falling back to a document
// transition, then an instant swap — see vt.ts).
//
// A11y: the top row is a real WAI-ARIA tablist (arrow keys, Home/End); the
// glyph rail is a mouse-only duplicate affordance and is hidden from the
// accessibility tree so the widget exposes exactly one set of tabs.
//
// Structural CSS lives in styles.css under "── Facets ──".

import type { JSX } from '@solidjs/web'
import { createSignal, createUniqueId, For } from 'solid-js'
import type { ClassProp } from './primitives'
import { createEffect } from './solid-v2'
import { withScopedViewTransition } from './vt'

export type FacetItem = {
	/** Rail glyph — emoji or any inline JSX; grayscaled when inactive. */
	glyph: JSX.Element
	/** Tab label. */
	label: string
	/** Pane content — lazy slot so hydration keys align (see Panel.action). */
	content: () => JSX.Element
}

export type FacetTabStyle = 'bar' | 'pill' | 'pill-stretch'

export function Facets(props: {
	items: FacetItem[]
	/** Tab-row look: 'bar' = full-width divided bar (legacy-faithful),
	 *  'pill' = content-hugging sliding pill (Segmented-style),
	 *  'pill-stretch' = sliding pill stretched across the frame. */
	tabStyle?: FacetTabStyle
	label?: string
	class?: ClassProp
}) {
	const uid = createUniqueId()
	const anchor = `--facets-${uid}`
	const [active, setActive] = createSignal(0)
	const style = () => props.tabStyle ?? 'bar'
	const isPill = () => style() !== 'bar'

	let paneEl: HTMLDivElement | undefined
	const tabEls: HTMLButtonElement[] = []

	const select = (i: number) => {
		if (i === active()) return
		withScopedViewTransition(paneEl, () => setActive(i))
	}

	// Standard tablist keyboard interaction: arrows move focus AND selection.
	const onKeyDown = (e: KeyboardEvent) => {
		const n = props.items.length
		const next =
			e.key === 'ArrowRight'
				? (active() + 1) % n
				: e.key === 'ArrowLeft'
					? (active() - 1 + n) % n
					: e.key === 'Home'
						? 0
						: e.key === 'End'
							? n - 1
							: null
		if (next === null) return
		e.preventDefault()
		select(next)
		tabEls[next]?.focus()
	}

	return (
		<div class={['facets', props.class]}>
			<div
				class={{
					'facets-tabs': true,
					'facets-tabs-bar': style() === 'bar',
					'facets-tabs-pill': style() === 'pill',
					'facets-tabs-stretch': style() === 'pill-stretch',
				}}
				role="tablist"
				aria-label={props.label ?? 'Facets'}
				onKeyDown={onKeyDown}
			>
				<For each={props.items}>
					{(item, i) => {
						// Registering the element under its index is a reactive concern —
						// ref callbacks run in <For>'s untracked map scope, so a bare i()
						// there would go stale on reorder (and trips STRICT_READ_UNTRACKED).
						// Tracking i in an effect keeps the slot map correct for free.
						let el!: HTMLButtonElement
						createEffect(i, (idx) => {
							tabEls[idx] = el
						})
						return (
							<button
								type="button"
								role="tab"
								id={`facets-${uid}-tab-${i()}`}
								aria-selected={active() === i() ? 'true' : 'false'}
								aria-controls={`facets-${uid}-panel`}
								tabindex={active() === i() ? 0 : -1}
								class={{ 'facets-tab': true, 'facets-tab-active': active() === i() }}
								style={active() === i() && isPill() ? `anchor-name:${anchor}` : undefined}
								ref={el}
								onClick={() => select(i())}
							>
								{item.label}
							</button>
						)
					}}
				</For>
				{/* Sliding indicator for the pill variants — anchor-positioned to the
				    active tab; where unsupported the active tab carries the pill look. */}
				<span class="facets-pill" style={`position-anchor:${anchor}`} aria-hidden="true" />
			</div>
			<div class="facets-body">
				<div class="facets-rail" aria-hidden="true">
					<For each={props.items}>
						{(item, i) => (
							<button
								type="button"
								tabindex={-1}
								class={{ 'facets-rail-btn': true, 'facets-rail-active': active() === i() }}
								onClick={() => select(i())}
							>
								<span>{item.glyph}</span>
							</button>
						)}
					</For>
				</div>
				<div
					class="facets-pane"
					id={`facets-${uid}-panel`}
					role="tabpanel"
					aria-labelledby={`facets-${uid}-tab-${active()}`}
					ref={paneEl}
				>
					{props.items[active()]?.content()}
				</div>
			</div>
		</div>
	)
}
