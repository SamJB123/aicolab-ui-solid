/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createEffect, createMemo, createUniqueId, For, Show } from 'solid-js'
import {
	type ClassProp,
	type ColorBase,
	type ColorTreatmentProps,
	colorTreatmentData,
} from '../../shared/color-treatment'
import { defineKnobs, type KnobProps, mergeKnobStyle } from '../../shared/knobs'
import { withScopedViewTransition } from '../../vt'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-fm', {
	nodeRadius: '<length-percentage>',
	gap: '<length>',
	discSize: '<length>',
	connectorInk: '<color>',
	connectorWidth: '<length>',
})

/** One box on the map. DATA-shaped, not domain-shaped: an app maps its steps into
 *  nodes; the map owns placement, connectors, previews and motion. */
export interface FlowMapNode {
	id: string
	label: JSX.Element
	/** What the disc shows (a step number, a glyph); a node without one has no disc. */
	badge?: JSX.Element
	/** Grid placement in the wide layout (1-based). Narrow layouts ignore it and flow the
	 *  nodes in the order given. */
	column: number
	row: number
	rowSpan?: number
	columnSpan?: number
	/** 'step' paints the family's solid roles; 'note' is a quiet outlined box. */
	kind?: 'step' | 'note'
	href?: string
	onSelect?: () => void
	/** The attention chip, when the map is interactive: one level, an optional count. */
	signal?: { level: 'success' | 'warning' | 'error'; count?: number; label: string }
	/** The hover/focus preview's content (lazy slot). */
	preview?: () => JSX.Element
}

export interface FlowMapEdge {
	from: string
	to: string
	/** 'arrow' points at `to`; 'both' points both ways; 'line' has no heads. */
	kind?: 'arrow' | 'both' | 'line'
	/** 'down': `to` sits below `from` in the same column. 'side': `to` sits beside `from`
	 *  in the same row. 'elbow': out of `from`'s side, then down into `to`'s top. */
	route: 'down' | 'side' | 'elbow'
}

export interface FlowMapRail {
	label: string
	colorBase?: ColorBase
	href?: string
	onSelect?: () => void
	preview?: () => JSX.Element
}

export interface FlowMapFooterItem {
	id: string
	label: JSX.Element
	icon?: () => JSX.Element
	href?: string
	onSelect?: () => void
}

export interface FlowMapFooter {
	label: string
	items: FlowMapFooterItem[]
	colorBase?: ColorBase
}

type FlowMapProps = {
	nodes: FlowMapNode[]
	edges?: FlowMapEdge[]
	/** A band spanning every row beside the nodes (a horizontal band above them when
	 *  narrow). */
	rail?: FlowMapRail
	/** The band under the map and its cards. */
	footer?: FlowMapFooter
	caption?: JSX.Element
	/** The node the reader is at; a ring rests on it and glides when it changes. */
	currentId?: string
	/** Previews, chips and the rail's preview; a published map turns them off. */
	interactive?: boolean
	/** Accessible name. */
	label: string
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '-')
const anchorName = (prefix: string, id: string) => `--fm-${prefix}-${safeId(id)}`

/** interestfor (Chromium 142+) shows the preview on hover/focus with the platform's own
 *  timing; where it is missing the same handlers do it by hand. Both are attached on
 *  every render so server and client markup agree; the handlers stand down where the
 *  platform does the work. */
const hasInterestInvokers = () =>
	typeof HTMLElement !== 'undefined' && 'interestForElement' in HTMLElement.prototype

/**
 * A link, a button or a plain box with the same class, attributes and content —
 * whichever the item's `href`/`onSelect` call for. One branch renders; the content slot
 * is a function so it is created once, in the branch that shows it (a pre-created
 * element would desync hydration keys, as would `Dynamic` under `For`).
 */
function Clickable(props: {
	href?: string
	onSelect?: () => void
	class: string
	attributes: Record<string, unknown>
	children: () => JSX.Element
}) {
	return (
		<Show
			when={props.href}
			fallback={
				<Show
					when={props.onSelect}
					fallback={
						<div class={props.class} {...props.attributes}>
							{props.children()}
						</div>
					}
				>
					{(onSelect) => (
						<button type="button" class={props.class} {...props.attributes} onClick={() => onSelect()()}>
							{props.children()}
						</button>
					)}
				</Show>
			}
		>
			{(href) => (
				<a class={props.class} href={href()} {...props.attributes}>
					{props.children()}
				</a>
			)}
		</Show>
	)
}

/**
 * A flow map: boxes placed on a grid with connectors drawn between them, a spanning
 * rail, a footer band with cards, a moving ring on the current node, and a preview
 * popover per node. Everything the browser can own, it owns: connectors take their
 * ends from the nodes' anchor names and reflow with the grid; previews are top-layer
 * popovers anchored to their node; the ring glides by view transition; the nodes reveal
 * on a scroll timeline, staggered by sibling-index(); the layout answers its container,
 * not the viewport. Reduced motion turns every animation off.
 */
export function FlowMap(props: FlowMapProps) {
	const uid = createUniqueId()
	const columns = createMemo(() =>
		Math.max(1, ...props.nodes.map((n) => n.column + (n.columnSpan ?? 1) - 1)),
	)
	// The explicit row count lets the rail span every row (`1 / -1` counts from the
	// explicit grid's end).
	const rows = createMemo(() =>
		Math.max(1, ...props.nodes.map((n) => n.row + (n.rowSpan ?? 1) - 1)),
	)
	const interactive = () => props.interactive ?? true
	const treatment = (): ColorTreatmentProps => ({
		colorBase: props.colorBase ?? 'secondary',
		colorLevel: props.colorLevel,
		variant: props.variant ?? 'solid',
	})
	const nodeById = (id: string) => props.nodes.find((n) => n.id === id)

	let root: HTMLElement | undefined
	// The ring's anchor follows `currentId`; a change is wrapped in a scoped view
	// transition so the ring glides from the old node to the new one. The first run
	// places it without a transition.
	let placed = false
	createEffect(
		() => props.currentId,
		(current) => {
			const ring = root?.querySelector<HTMLElement>('.ui-flow-map-ring')
			if (!root || !ring) return
			const place = () =>
				ring.style.setProperty('position-anchor', current ? anchorName(uid, current) : 'none')
			if (placed) withScopedViewTransition(root, place)
			else place()
			placed = true
		},
	)

	/** Hover/focus interest with a short delay, for browsers without interest invokers. */
	const interest = (popoverId: string) => {
		let timer: ReturnType<typeof setTimeout> | null = null
		// By id, not a `#id` selector: a unique id may open with a digit, which no selector
		// can name unescaped.
		const pop = () => (root ? document.getElementById(popoverId) : null)
		const show = () => {
			if (hasInterestInvokers()) return
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => {
				const p = pop()
				if (p && !p.matches(':popover-open')) p.showPopover()
			}, 250)
		}
		const hide = () => {
			if (hasInterestInvokers()) return
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => {
				const p = pop()
				if (p?.matches(':popover-open') && !p.matches(':hover')) p.hidePopover()
			}, 200)
		}
		return {
			interestfor: popoverId,
			onPointerEnter: show,
			onPointerLeave: hide,
			onFocusIn: show,
			onFocusOut: hide,
		}
	}

	return (
		<nav
			ref={(el) => {
				root = el
			}}
			class={['ui-flow-map', props.class]}
			aria-label={props.label}
			data-interactive={interactive() ? '' : undefined}
			{...colorTreatmentData(treatment())}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), {
				'--ui-fm-columns': String(columns()),
				'--ui-fm-row-count': String(rows()),
			})}
		>
			<div class="ui-flow-map-field">
				<Show when={props.rail}>
					{(rail) => {
						const popId = `${uid}-rail`
						const previewing = () => interactive() && rail().preview !== undefined
						return (
							<>
								<Clickable
									href={rail().href}
									onSelect={rail().onSelect}
									class="ui-flow-map-rail"
									attributes={{
										...colorTreatmentData({
											colorBase: rail().colorBase ?? 'success',
											variant: 'solid',
										}),
										style: { 'anchor-name': anchorName(uid, 'rail') },
										...(previewing() ? interest(popId) : {}),
									}}
								>
									{() => <span class="ui-flow-map-rail-label">{rail().label}</span>}
								</Clickable>
								<Show when={previewing() ? rail().preview : undefined}>
									{(preview) => (
										<div
											id={popId}
											popover="auto"
											class="ui-anchored ui-flow-map-preview"
											style={{ 'position-anchor': anchorName(uid, 'rail') }}
										>
											{preview()()}
										</div>
									)}
								</Show>
							</>
						)
					}}
				</Show>
				<For each={props.nodes}>
					{(node) => {
						const popId = `${uid}-${safeId(node.id)}`
						const previewing = () => interactive() && node.preview !== undefined
						const isCurrent = () => props.currentId === node.id
						return (
							<>
								<div
									class="ui-flow-map-node"
									data-kind={node.kind ?? 'step'}
									data-current={isCurrent() ? '' : undefined}
									style={{
										'anchor-name': anchorName(uid, node.id),
										'--ui-fm-col': String(node.column),
										'--ui-fm-row': String(node.row),
										'--ui-fm-cols': String(node.columnSpan ?? 1),
										'--ui-fm-rows': String(node.rowSpan ?? 1),
									}}
									{...colorTreatmentData(
										node.kind === 'note'
											? {
													colorBase: treatment().colorBase,
													colorLevel: treatment().colorLevel,
													variant: 'outline',
												}
											: treatment(),
									)}
								>
									<Clickable
										href={node.href}
										onSelect={node.onSelect}
										class="ui-flow-map-node-body"
										attributes={{
											'aria-current': isCurrent() ? 'step' : undefined,
											...(previewing() ? interest(popId) : {}),
										}}
									>
										{() => (
											<>
												<Show when={node.badge !== undefined}>
													<span class="ui-flow-map-disc" aria-hidden="true">
														{node.badge}
													</span>
												</Show>
												<span class="ui-flow-map-label">{node.label}</span>
											</>
										)}
									</Clickable>
									<Show when={interactive() ? node.signal : undefined}>
										{(signal) => (
											<span
												class="ui-flow-map-chip"
												title={signal().label}
												{...colorTreatmentData({ colorBase: signal().level, variant: 'solid' })}
											>
												<Show
													when={signal().count !== undefined}
													fallback={<span class="ui-flow-map-chip-dot" />}
												>
													{signal().count}
												</Show>
												<span class="ui-visually-hidden">{signal().label}</span>
											</span>
										)}
									</Show>
								</div>
								<Show when={previewing() ? node.preview : undefined}>
									{(preview) => (
										<div
											id={popId}
											popover="auto"
											class="ui-anchored ui-flow-map-preview"
											style={{ 'position-anchor': anchorName(uid, node.id) }}
										>
											{preview()()}
										</div>
									)}
								</Show>
							</>
						)
					}}
				</For>
				{/* Connectors: drawn after the nodes (an anchor must precede what anchors to it),
				    ends taken from the nodes' anchor names. */}
				<For each={props.edges ?? []}>
					{(edge) => (
						<Show when={nodeById(edge.from) && nodeById(edge.to)}>
							<span
								class="ui-flow-map-edge"
								aria-hidden="true"
								data-route={edge.route}
								data-heads={edge.kind ?? 'arrow'}
								style={{
									'--ui-fm-from': anchorName(uid, edge.from),
									'--ui-fm-to': anchorName(uid, edge.to),
								}}
							/>
						</Show>
					)}
				</For>
				<Show when={props.currentId}>
					<span class="ui-flow-map-ring" aria-hidden="true" />
				</Show>
			</div>
			<Show when={props.footer}>
				{(footer) => (
					<div class="ui-flow-map-footer">
						<div
							class="ui-flow-map-footer-band"
							{...colorTreatmentData({ colorBase: 'neutral', variant: 'solid' })}
						>
							{footer().label}
						</div>
						<ul class="ui-flow-map-cards">
							<For each={footer().items}>
								{(item) => (
									<li>
										<Clickable
											href={item.href}
											onSelect={item.onSelect}
											class="ui-flow-map-card"
											attributes={colorTreatmentData({
												colorBase: footer().colorBase ?? 'info',
												variant: 'soft',
											})}
										>
											{() => (
												<>
													<Show when={item.icon}>
														{(icon) => (
															<span class="ui-flow-map-card-icon" aria-hidden="true">
																{icon()()}
															</span>
														)}
													</Show>
													<span class="ui-flow-map-card-label">{item.label}</span>
												</>
											)}
										</Clickable>
									</li>
								)}
							</For>
						</ul>
					</div>
				)}
			</Show>
			<Show when={props.caption}>
				<p class="ui-flow-map-caption">{props.caption}</p>
			</Show>
		</nav>
	)
}
