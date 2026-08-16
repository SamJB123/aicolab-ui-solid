/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createEffect, createSignal, createUniqueId, Show } from 'solid-js'
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

function detentHeights(): Record<InspectorDetent, number> {
	const viewportHeight = window.innerHeight
	return { peek: 58, half: viewportHeight * 0.42, full: viewportHeight * 0.88 }
}

function nearestDetent(height: number): InspectorDetent {
	const heights = detentHeights()
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
	return (
		<div
			class={['ui-workspace', props.class]}
			data-ui-workspace-raised={props.hasRaisedSheet ? '' : undefined}
			data-capture-target={props.captureTarget}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			{props.navigation}
			{props.stage}
			{props.inspector}
			{props.children}
			{props.mobileNavigation}
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
	return (
		<nav class={['ui-workspace-navigation', props.class]} aria-label={props.label}>
			<Show when={props.brand}>
				{(brand) => <div class="ui-workspace-navigation-brand">{brand()}</div>}
			</Show>
			{props.children}
			<Show when={props.footer}>
				{(footer) => <div class="ui-workspace-navigation-footer">{footer()}</div>}
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
	class?: ClassProp
	children?: JSX.Element
}) {
	const [detent, setDetent] = createSignal<InspectorDetent>('peek', { ownedWrite: true })
	const [dragHeight, setDragHeight] = createSignal<number | null>(null)
	let root: HTMLElement | undefined
	let dragMoved = false

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

	const onGripPointerDown = (event: PointerEvent): void => {
		if (!window.matchMedia('(max-width: 900px)').matches || !root || event.button !== 0) return
		const startY = event.clientY
		const startHeight = root.getBoundingClientRect().height
		const startDetent = detent()
		const maxHeight = window.innerHeight * 0.92
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
			let next = nearestDetent(latest + thrown * THROW_PROJECTION_MS)
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
	return (
		<header class="ui-inspector-header">
			{props.eyebrow}
			<h2 class="ui-inspector-title">{props.title}</h2>
			<Show when={props.children}>
				{(content) => <div class="ui-inspector-description">{content()}</div>}
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
	return (
		<div class={['ui-workspace-stage-tooltip', props.class]} aria-hidden="true">
			<span class="ui-workspace-stage-tooltip-label">{props.label}</span>
			<Show when={props.detail}>
				{(detail) => <span class="ui-workspace-stage-tooltip-detail">{detail()}</span>}
			</Show>
		</div>
	)
}
