// InteractivePanel — the production home of the A3 pointer-slide machine,
// ported from threejs-playground curved-slide-scene.ts (lines cited inline)
// per the verbatim manifest. Consumers inherit the complete contract: slide,
// arming, hover/:active emulation, cursor mirroring, focus mode with forward
// pre-slide, popup anchoring, date-picker opening, selection enablement.
//
// Commissioned deviations ONLY (each agreed in-session):
//  - pointer feed comes from the runtime's document-level listeners (the depth
//    layer's canvas is pointer-events:none, so canvas listeners would starve —
//    this also makes the scene's forwardPanelMove structurally unnecessary);
//  - arming is exposed as DESIRED state; the runtime's ownership enforcement
//    writes pointer-events (replaces the data-slide-panel/!important world);
//  - hover targets + looks ride the auto-twin machinery (hover-twin.ts), not
//    the demo's [data-probe] marker + injected stylesheet;
//  - the cursor mirrors onto document.body (the canvas never hosts the pointer).

import * as THREE from 'three/webgpu'
import { ACTIVE_TWIN, HOVER_TWIN_CLASS, hoverTargetFor } from './hover-twin'
import { hasShowPicker, subElementAt, uvToWorld } from './panel-shared'

export interface InteractivePanelInit {
	/** The face element (already adopted into the capture canvas subtree). */
	el: HTMLElement
	/** The mesh the face is textured onto (uvToWorld reads its geometry). */
	mesh: THREE.Mesh
	widthPx: number
	heightPx: number
	canvas: HTMLCanvasElement
	camera: THREE.Camera
	/** nativeHtmlInCanvasActive() — hover/:active emulation is native-only
	 *  (the polyfill renders real UA hover; scene.ts:986,1002 self-gating). */
	native: boolean | null
	/** Arm links/buttons inside the face (default true). */
	interactive?: boolean
}

export interface InteractivePanel {
	/** Per-frame: the picker's resolved surface UV for this panel (or null),
	 *  the pointer's client position, and whether the pointer moved since last
	 *  frame (slide writes are pointer-intent-gated — session discipline). */
	resolve(uv: THREE.Vector2 | null, pointerX: number, pointerY: number, moved: boolean): void
	/** Runtime feeds pointerdown (popup anchor decision + :active + slide target). */
	pointerDown(e: PointerEvent): void
	/** The pointer left the tracked area entirely (scene.ts:1145-1147). */
	pointerGone(): void
	/** Whether the machine currently wants the real DOM hittable. */
	wantsArmed(): boolean
	dispose(): void
}

// Native popup triggers needing slide-anchoring (scene.ts:877-896).
const POPUP_INPUT_TYPES = new Set([
	'date',
	'time',
	'datetime-local',
	'month',
	'week',
	'color',
	'file',
])
// Keys that open a focused control's popup (scene.ts:1045).
const POPUP_KEYS = new Set([' ', 'Enter', 'ArrowDown', 'ArrowUp', 'F4'])
// Date-family inputs whose picker needs showPicker() inside the click's user
// activation (plain field-clicks don't open them on Chrome — scene.ts:656-675).
const DATE_TYPES = new Set(['date', 'time', 'datetime-local', 'month', 'week'])

/** Mirror the resolved control's cursor (scene.ts:798-816): the browser shows
 *  the pointer-hosting surface's cursor, never the invisible child's. */
function computeCursor(el: HTMLElement): string {
	const c = getComputedStyle(el).cursor
	if (c && c !== 'auto') return c
	const textTypes = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number'])
	if (
		(el instanceof HTMLInputElement && textTypes.has(el.type)) ||
		el instanceof HTMLTextAreaElement ||
		el.isContentEditable
	) {
		return 'text'
	}
	return 'default'
}

export function createInteractivePanel(init: InteractivePanelInit): InteractivePanel {
	const { el, mesh, widthPx, heightPx, canvas, camera } = init
	const cleanups: Array<() => void> = []

	// Element contract (scene.ts:130-145): absolute at 0,0 is the slide ORIGIN
	// (slide applies via transform); selection must be declared explicitly or
	// stricter engines silently refuse it under an ancestor user-select:none.
	el.style.position = 'absolute'
	el.style.left = '0'
	el.style.top = '0'
	el.style.userSelect = 'text'
	el.style.webkitUserSelect = 'text'
	el.style.setProperty('-webkit-touch-callout', 'none')

	// Element-space texture transform for a flat, V-flipped panel (the source of
	// truth for uv↔DOM mapping — scene.ts:379-388).
	const elementRepeat = new THREE.Vector2(1, -1)
	const elementOffset = new THREE.Vector2(0, 1)

	// ── uv → DOM client px (scene.ts:701-718; FORKED V-MATH: element-space sv
	// is already DOM-V, no `1 − sv`). ──
	const pointToClient = (
		uv: THREE.Vector2,
	): { x: number; y: number; domX: number; domY: number } => {
		const su = uv.x * elementRepeat.x + elementOffset.x
		const sv = uv.y * elementRepeat.y + elementOffset.y
		const domX = su * widthPx
		const domY = sv * heightPx
		const rect = el.getBoundingClientRect()
		return { x: rect.left + domX, y: rect.top + domY, domX, domY }
	}
	// Inverse (scene.ts:852-862).
	const localToUv = (localX: number, localY: number): THREE.Vector2 => {
		const su = localX / widthPx
		const sv = localY / heightPx
		return new THREE.Vector2(
			(su - elementOffset.x) / elementRepeat.x,
			(sv - elementOffset.y) / elementRepeat.y,
		)
	}

	// ── The slide (scene.ts:720-748): containing-block-agnostic delta method;
	// accumulators are PER ELEMENT (the "prior value is already baked into the
	// measured rect" invariant). ──
	const lastClient = { x: 0, y: 0 }
	let slideTx = 0
	let slideTy = 0
	const slideLocalPointTo = (lx: number, ly: number, sx: number, sy: number): void => {
		const pr = el.getBoundingClientRect()
		slideTx += sx - (pr.left + lx)
		slideTy += sy - (pr.top + ly)
		const next = `translate(${slideTx}px, ${slideTy}px)`
		if (el.style.transform !== next) el.style.transform = next
	}
	const slideTo = (domX: number, domY: number): void =>
		slideLocalPointTo(domX, domY, lastClient.x, lastClient.y)

	// world → screen (scene.ts:926-933).
	const worldToScreen = (world: THREE.Vector3): { x: number; y: number } => {
		const ndc = world.clone().project(camera)
		const rect = canvas.getBoundingClientRect()
		return {
			x: rect.left + ((ndc.x + 1) / 2) * rect.width,
			y: rect.top + ((1 - ndc.y) / 2) * rect.height,
		}
	}
	// Forward pre-slide for focus/keyboard popups (scene.ts:864-872).
	const alignLocalToSurface = (localX: number, localY: number): void => {
		const world = uvToWorld(mesh, localToUv(localX, localY))
		if (!world) return
		const s = worldToScreen(world)
		slideLocalPointTo(localX, localY, s.x, s.y)
	}

	// ── Arming as desired state; runtime writes pointer-events. ──
	let wantArmed = false
	const setPanelInteractive = (on: boolean): void => {
		wantArmed = init.interactive === false ? false : on
	}

	// ── Hover + :active emulation, native path only (scene.ts:778-845). ──
	let hoverTarget: HTMLElement | null = null
	const setHover = (sub: HTMLElement | null): void => {
		const target = hoverTargetFor(sub, el)
		if (target === hoverTarget) return
		hoverTarget?.classList.remove(HOVER_TWIN_CLASS)
		target?.classList.add(HOVER_TWIN_CLASS)
		hoverTarget = target
		document.body.style.cursor = target ? computeCursor(target) : ''
		canvas.requestPaint?.()
	}
	let activeTarget: HTMLElement | null = null
	const setActive = (on: boolean): void => {
		if (on) {
			activeTarget = hoverTarget
			activeTarget?.classList.add(ACTIVE_TWIN)
		} else {
			activeTarget?.classList.remove(ACTIVE_TWIN)
			activeTarget = null
		}
		canvas.requestPaint?.()
	}
	const onWindowPointerUp = (): void => setActive(false)
	window.addEventListener('pointerup', onWindowPointerUp)
	cleanups.push(() => window.removeEventListener('pointerup', onWindowPointerUp))

	// ── Focus / popup state machine (scene.ts:689-699, 874-923, 1012-1061). ──
	let inputMode: 'pointer' | 'focus' = 'pointer'
	let anchoredTrigger: HTMLElement | null = null
	const findPopupTrigger = (start: EventTarget | null): HTMLElement | null => {
		let node = start instanceof HTMLElement ? start : null
		while (node && node !== canvas) {
			if (node instanceof HTMLSelectElement) return node
			if (node instanceof HTMLInputElement && POPUP_INPUT_TYPES.has(node.type)) return node
			if (node.hasAttribute('popovertarget')) return node
			if (node === el) break
			node = node.parentElement
		}
		return null
	}
	const alignTriggerCenter = (trigger: HTMLElement): void => {
		const tr = trigger.getBoundingClientRect()
		const pr = el.getBoundingClientRect()
		alignLocalToSurface(tr.left - pr.left + tr.width / 2, tr.top - pr.top + tr.height / 2)
	}
	const releaseAnchor = (): void => {
		if (!anchoredTrigger) return
		anchoredTrigger.removeEventListener('change', releaseAnchor)
		anchoredTrigger.removeEventListener('blur', releaseAnchor)
		anchoredTrigger = null
	}
	const anchorTo = (trigger: HTMLElement): void => {
		if (anchoredTrigger === trigger) return
		releaseAnchor()
		anchoredTrigger = trigger
		setPanelInteractive(true) // popup open → hittable even off-cursor
		trigger.addEventListener('change', releaseAnchor)
		trigger.addEventListener('blur', releaseAnchor)
	}

	const onFocusIn = (e: FocusEvent): void => {
		inputMode = 'focus'
		setPanelInteractive(true)
		const focused = e.target
		if (focused instanceof HTMLElement && el.contains(focused)) {
			const fr = focused.getBoundingClientRect()
			const pr = el.getBoundingClientRect()
			alignLocalToSurface(fr.left - pr.left + fr.width / 2, fr.top - pr.top + fr.height / 2)
		}
	}
	const onFocusOut = (e: FocusEvent): void => {
		const next = e.relatedTarget
		if (!(next instanceof Node) || !el.contains(next)) inputMode = 'pointer'
	}
	el.addEventListener('focusin', onFocusIn)
	el.addEventListener('focusout', onFocusOut)
	cleanups.push(() => {
		el.removeEventListener('focusin', onFocusIn)
		el.removeEventListener('focusout', onFocusOut)
	})

	const onKeyDown = (e: KeyboardEvent): void => {
		if (e.key === 'Escape') {
			releaseAnchor()
			return
		}
		if (!POPUP_KEYS.has(e.key)) return
		const trigger = findPopupTrigger(document.activeElement)
		if (trigger && el.contains(trigger)) {
			anchorTo(trigger)
			alignTriggerCenter(trigger)
		}
	}
	window.addEventListener('keydown', onKeyDown)
	cleanups.push(() => window.removeEventListener('keydown', onKeyDown))

	// Outside pointerdown dismisses an open anchor (scene.ts:1151-1160).
	const onDocPointerDown = (e: PointerEvent): void => {
		if (e.target instanceof Node && (canvas.contains(e.target) || el.contains(e.target))) return
		if (findPopupTrigger(e.target)) return
		releaseAnchor()
	}
	document.addEventListener('pointerdown', onDocPointerDown, true)
	cleanups.push(() => document.removeEventListener('pointerdown', onDocPointerDown, true))

	// Real click on a date-family input → open its picker inside the activation
	// (scene.ts:656-675).
	const onDateClick = (e: MouseEvent): void => {
		const t = e.target instanceof HTMLElement ? e.target.closest('input') : null
		if (t instanceof HTMLInputElement && DATE_TYPES.has(t.type) && hasShowPicker(t)) {
			try {
				t.showPicker()
			} catch {
				/* not allowed / unsupported — the field keeps focus */
			}
		}
	}
	el.addEventListener('click', onDateClick)
	cleanups.push(() => el.removeEventListener('click', onDateClick))

	return {
		// The per-frame resolve — the scene's onResolve body (scene.ts:969-1005),
		// slide gated on pointer intent per the session's churn fix.
		resolve(uv, px, py, moved) {
			lastClient.x = px
			lastClient.y = py
			if (uv) {
				const c = pointToClient(uv)
				if (inputMode === 'pointer' && !anchoredTrigger) {
					setPanelInteractive(true)
					if (moved) slideTo(c.domX, c.domY)
				}
				if (init.native) setHover(subElementAt(el, c.x, c.y).el)
			} else {
				if (!anchoredTrigger && inputMode !== 'focus') setPanelInteractive(false)
				if (init.native) setHover(null)
			}
		},
		pointerDown(e) {
			lastClient.x = e.clientX
			lastClient.y = e.clientY
			setActive(true)
			const trigger = findPopupTrigger(e.target)
			if (trigger && el.contains(trigger)) {
				anchorTo(trigger)
			} else {
				releaseAnchor()
				inputMode = 'pointer'
			}
		},
		pointerGone() {
			if (!anchoredTrigger && inputMode !== 'focus') setPanelInteractive(false)
			if (init.native) setHover(null)
		},
		wantsArmed: () => wantArmed,
		dispose() {
			releaseAnchor()
			setHover(null)
			setActive(false)
			for (const c of cleanups) c()
		},
	}
}
