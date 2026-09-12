/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { children, createEffect, createSignal, createUniqueId, onSettled, Show } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import { RichList, RichListItem } from '../../molecules/rich-list'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). Structural surfaces
 * stay base chrome (knobbable); the treatment axes retarget only the ACCENT
 * (the bound-inspector seam), per the organisms surfaces rule. */
const knobs = defineKnobs('ui-workspace', {
	gutter: '<length>',
	navWidth: '<length>',
	inspectorWidth: '<length>',
	surface: '<color>',
	navSurface: '<color>',
	inspectorSurface: '<color>',
	accent: '<color>',
})

export type InspectorDetent = 'peek' | 'half' | 'full'

const DETENTS: readonly InspectorDetent[] = ['peek', 'half', 'full']
const DRAG_SLOP_PX = 9
const THROW_PROJECTION_MS = 220
const FLICK_VELOCITY = 0.25
const STALE_VELOCITY_MS = 120

function workspaceClass(name: string, value?: ClassProp): ClassProp {
	if (!value) return name
	if (typeof value === 'string') return `${name} ${value}`
	return { [name]: true, ...value }
}

/** A CSS length from a computed custom property, in px (rem and px only — what the shell's knobs use). */
function lengthPx(value: string, rootFontSize: number): number {
	const trimmed = value.trim()
	const number = Number.parseFloat(trimmed)
	if (Number.isNaN(number)) return 0
	return trimmed.endsWith('rem') ? number * rootFontSize : number
}

/**
 * The stops in px. The full stop mirrors the stylesheet's
 * --ui-inspector-full-height: the sheet stands on the bottom bar (its computed
 * `bottom`) and must leave the app bar plus the top safe area clear, so it is
 * the viewport minus both — not a viewport fraction, which on phones put the
 * grip under the header (fixed 2026-09-04). Before the sheet is measurable
 * (server, first paint) the fraction stands in.
 */
function detentHeights(sheet?: HTMLElement): Record<InspectorDetent, number> {
	const viewportHeight = window.innerHeight
	let full = viewportHeight * 0.88
	if (sheet) {
		const style = getComputedStyle(sheet)
		const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
		const bottom = Number.parseFloat(style.bottom) || 0
		const header = lengthPx(style.getPropertyValue('--ui-workspace-header-height'), rootFontSize)
		const safeTop = lengthPx(style.getPropertyValue('--ui-workspace-safe-area-top'), rootFontSize)
		if (header > 0) full = Math.min(full, viewportHeight - bottom - header - safeTop - 0.5 * rootFontSize)
	}
	return { peek: 58, half: viewportHeight * 0.42, full }
}

function nearestDetent(height: number, sheet?: HTMLElement): InspectorDetent {
	const heights = detentHeights(sheet)
	return DETENTS.reduce((best, detent) =>
		Math.abs(heights[detent] - height) < Math.abs(heights[best] - height) ? detent : best,
	)
}

function adjacentDetent(from: InspectorDetent, direction: 1 | -1): InspectorDetent {
	const index = DETENTS.indexOf(from) + direction
	return DETENTS[Math.max(0, Math.min(DETENTS.length - 1, index))] ?? from
}

export function WorkspaceShell(
	props: {
		navigation?: JSX.Element
		stage?: JSX.Element
		inspector?: JSX.Element
		mobileNavigation?: JSX.Element
		hasRaisedSheet?: boolean
		captureTarget?: string
		class?: ClassProp
		children?: JSX.Element
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	// Each region resolves through a children() memo: two or more ADJACENT
	// component-valued prop holes misalign hydration ids in solid 2.0.0-rc.0
	// (minimal repro M20 vs M21 in the hives hydration probe — raw holes leave
	// the whole region unclaimed; a children() memo per slot reserves its id
	// at registration on both sides and aligns).
	const navigation = children(() => props.navigation)
	const stage = children(() => props.stage)
	const inspector = children(() => props.inspector)
	const extra = children(() => props.children)
	const mobileNavigation = children(() => props.mobileNavigation)
	return (
		<div
			class={['ui-workspace', props.class]}
			data-ui-workspace-raised={props.hasRaisedSheet ? '' : undefined}
			data-capture-target={props.captureTarget}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			{navigation()}
			{stage()}
			{inspector()}
			{extra()}
			{mobileNavigation()}
		</div>
	)
}

export function WorkspaceNavigation(props: {
	label: string
	brand?: JSX.Element
	footer?: JSX.Element
	class?: ClassProp
	children?: JSX.Element
}) {
	// Element-JSX props compile to getters that create a NEW element per
	// access; gating one behind <Show when={…}> and rendering it again would
	// evaluate it twice, and the second instance cannot claim the first's
	// server-rendered DOM (hydration mismatch). `children()` resolves each
	// slot exactly ONCE — same fix across every slot-consuming component.
	const brand = children(() => props.brand)
	const footer = children(() => props.footer)
	return (
		<nav class={['ui-workspace-navigation', props.class]} aria-label={props.label}>
			<Show when={brand()}>
				<div class="ui-workspace-navigation-brand">{brand()}</div>
			</Show>
			{props.children}
			<Show when={footer()}>
				<div class="ui-workspace-navigation-footer">{footer()}</div>
			</Show>
		</nav>
	)
}

export function WorkspaceNavigationGroup(
	props: {
		id: string
		label: string
		class?: ClassProp
		children?: JSX.Element
	} & ColorTreatmentProps,
) {
	return (
		<section class={['ui-workspace-navigation-group', props.class]}>
			<h2 class="ui-workspace-navigation-group-label ui-eyebrow" id={props.id}>
				{props.label}
			</h2>
			<RichList
				navigation
				class="ui-workspace-navigation-list"
				label={props.label}
				colorBase={props.colorBase}
				colorLevel={props.colorLevel}
				variant={props.variant}
			>
				{props.children}
			</RichList>
		</section>
	)
}

export function WorkspaceNavigationList(
	props: {
		label: string
		class?: ClassProp
		children?: JSX.Element
	} & ColorTreatmentProps,
) {
	return (
		<RichList
			navigation
			class={workspaceClass('ui-workspace-navigation-list', props.class)}
			label={props.label}
			colorBase={props.colorBase}
			colorLevel={props.colorLevel}
			variant={props.variant}
		>
			{props.children}
		</RichList>
	)
}

export function WorkspaceNavigationItem(props: {
	label: string
	onSelect: () => void
	mark?: JSX.Element
	current?: boolean
	muted?: boolean
	class?: ClassProp
}) {
	return (
		<RichListItem
			title={props.label}
			leading={props.mark}
			onSelect={props.onSelect}
			selected={props.current}
			muted={props.muted}
			class={workspaceClass('ui-workspace-navigation-item', props.class)}
		/>
	)
}

export function WorkspaceStage(props: {
	label: string
	class?: ClassProp
	children?: JSX.Element
}) {
	return (
		<section class={['ui-workspace-stage', props.class]} aria-label={props.label}>
			{props.children}
		</section>
	)
}

export function RaisedSheet(props: {
	title: string
	onClose: () => void
	closeLabel?: string
	class?: ClassProp
	children?: JSX.Element
}) {
	const titleId = `ui-raised-sheet-${createUniqueId()}`
	return (
		<section class={['ui-raised-sheet', props.class]} role="dialog" aria-labelledby={titleId}>
			<header class="ui-raised-sheet-header">
				<h2
					class="ui-raised-sheet-title"
					id={titleId}
					tabindex="-1"
					ref={(element) => queueMicrotask(() => element.focus())}
				>
					{props.title}
				</h2>
				<IconButton
					label={props.closeLabel ?? `Close ${props.title}`}
					size="lg"
					onClick={props.onClose}
				>
					<span aria-hidden="true">✕</span>
				</IconButton>
			</header>
			<div class="ui-raised-sheet-body">{props.children}</div>
		</section>
	)
}

export function ResponsiveInspector(props: {
	label: string
	/** A stable selection identity. Truthy values bind and raise the inspector. */
	activeKey?: string | null
	hidden?: boolean
	/** Reports how many pixels of the stage this inspector currently COVERS
	 * from the bottom: the sheet's target height on narrow viewports (live
	 * during grip drags), 0 in side-panel mode where the panel shrinks the
	 * stage instead of overlaying it. Lets the stage keep its subject inside
	 * the uncovered strip (settled 2026-08-16). */
	onOcclusionChange?: (px: number) => void
	/** A host "show me the reading" gesture (a bottom-bar item, say): every
	 * change of this value lifts a peeking sheet to half, and leaves a sheet
	 * the reader has already raised where it is. Ignored in side-panel mode,
	 * where the panel is always visible. */
	raise?: number
	class?: ClassProp
	children?: JSX.Element
}) {
	const [detent, setDetent] = createSignal<InspectorDetent>('peek', { ownedWrite: true })
	const [dragHeight, setDragHeight] = createSignal<number | null>(null)
	// Bumped on viewport resizes so the reported occlusion re-derives (the
	// half/full detents are viewport-proportional, and the side-panel media
	// boundary can flip).
	const [viewportEpoch, setViewportEpoch] = createSignal(0)
	let root: HTMLElement | undefined
	let dragMoved = false

	const onViewportResize = (): void => {
		setViewportEpoch((epoch) => epoch + 1)
	}
	// Component-level setup/teardown: subscribed after the first settle, so
	// the server never touches `window` and the inspector renders on both
	// sides from the same deterministic state (detent 'peek').
	onSettled(() => {
		window.addEventListener('resize', onViewportResize)
		return () => window.removeEventListener('resize', onViewportResize)
	})

	createEffect(
		() => ({
			detent: detent(),
			dragHeight: dragHeight(),
			hidden: props.hidden,
			report: props.onOcclusionChange,
			epoch: viewportEpoch(),
		}),
		({ detent, dragHeight, hidden, report }) => {
			if (!report) return
			const sheet = window.matchMedia('(max-width: 900px)').matches
			report(sheet && !hidden ? Math.round(dragHeight ?? detentHeights(root)[detent]) : 0)
		},
	)

	createEffect(
		() => props.activeKey,
		(activeKey) => {
			// A NEW binding raises the sheet so the reading is visible; a
			// CLEARED binding keeps the current detent — the resting surface
			// is real content (the galaxy's drill) and a reader's up-control
			// must not slam the drawer shut (fixed 2026-08-16). The functional
			// setter reads the current detent WITHOUT a reactive read: this
			// effect must key on the binding only — tracking the detent would
			// bounce a manually-lowered sheet back up while bound.
			if (activeKey) setDetent((current) => (current === 'peek' ? 'half' : current))
		},
	)
	createEffect(
		() => props.raise,
		(raise) => {
			if (raise) setDetent((current) => (current === 'peek' ? 'half' : current))
		},
	)

	const onGripPointerDown = (event: PointerEvent): void => {
		if (!window.matchMedia('(max-width: 900px)').matches || !root || event.button !== 0) return
		const startY = event.clientY
		const startHeight = root.getBoundingClientRect().height
		const startDetent = detent()
		// no dragging past the top stop: the header must stay reachable
		const maxHeight = detentHeights(root).full
		dragMoved = false
		let latest = startHeight
		let velocity = 0
		let lastY = startY
		let lastAt = performance.now()

		const onMove = (move: PointerEvent): void => {
			latest = Math.min(maxHeight, Math.max(0, startHeight - (move.clientY - startY)))
			if (Math.abs(latest - startHeight) > DRAG_SLOP_PX) dragMoved = true
			const now = performance.now()
			const elapsed = now - lastAt
			if (elapsed > 0) {
				const instant = (lastY - move.clientY) / elapsed
				velocity = velocity * 0.7 + instant * 0.3
				lastY = move.clientY
				lastAt = now
			}
			setDragHeight(latest)
		}

		const onUp = (): void => {
			window.removeEventListener('pointermove', onMove)
			window.removeEventListener('pointerup', onUp)
			window.removeEventListener('pointercancel', onUp)
			setDragHeight(null)
			if (!dragMoved) return
			const thrown = performance.now() - lastAt < STALE_VELOCITY_MS ? velocity : 0
			let next = nearestDetent(latest + thrown * THROW_PROJECTION_MS, root)
			if (Math.abs(thrown) > FLICK_VELOCITY && next === startDetent) {
				next = adjacentDetent(startDetent, thrown > 0 ? 1 : -1)
			}
			setDetent(next)
		}

		window.addEventListener('pointermove', onMove)
		window.addEventListener('pointerup', onUp)
		window.addEventListener('pointercancel', onUp)
	}

	const stepDetent = (): void => {
		if (dragMoved) {
			dragMoved = false
			return
		}
		const next = DETENTS[DETENTS.indexOf(detent()) + 1] ?? DETENTS[0]
		if (next) setDetent(next)
	}

	return (
		<aside
			class={['ui-responsive-inspector', props.class]}
			aria-label={props.label}
			data-detent={detent()}
			data-bound={props.activeKey ? '' : undefined}
			data-hidden={props.hidden ? '' : undefined}
			style={dragHeight() !== null ? { height: `${dragHeight()}px` } : undefined}
			ref={(element) => {
				root = element
			}}
		>
			<button
				type="button"
				class="ui-responsive-inspector-grip"
				aria-label={detent() === 'full' ? 'Collapse details' : 'Expand details'}
				onPointerDown={onGripPointerDown}
				onClick={stepDetent}
			>
				<span class="ui-responsive-inspector-grip-bar" aria-hidden="true" />
				<span class="ui-responsive-inspector-grip-title">{props.label}</span>
			</button>
			<div class="ui-responsive-inspector-content">{props.children}</div>
		</aside>
	)
}

export function InspectorHeader(props: {
	eyebrow?: JSX.Element
	title: JSX.Element
	children?: JSX.Element
}) {
	// Single-eval slot resolution — see WorkspaceNavigation.
	const description = children(() => props.children)
	return (
		<header class="ui-inspector-header">
			{props.eyebrow}
			<h2 class="ui-inspector-title">{props.title}</h2>
			<Show when={description()}>
				<div class="ui-inspector-description">{description()}</div>
			</Show>
		</header>
	)
}

/** Compact, non-interactive feedback positioned over an active workspace stage. */
export function WorkspaceStageTooltip(props: {
	label: JSX.Element
	detail?: JSX.Element
	class?: ClassProp
}) {
	// Single-eval slot resolution — see WorkspaceNavigation.
	const detail = children(() => props.detail)
	return (
		<div class={['ui-workspace-stage-tooltip', props.class]} aria-hidden="true">
			<span class="ui-workspace-stage-tooltip-label">{props.label}</span>
			<Show when={detail()}>
				<span class="ui-workspace-stage-tooltip-detail">{detail()}</span>
			</Show>
		</div>
	)
}
