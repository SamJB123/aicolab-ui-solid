// The depth layer — a persistent, transparent, click-through canvas that
// renders DOM-textured panels in real 3D, positioned to match anchor elements
// in the page flow. The page-level DOM↔three bridge:
//
//   - PAGE-LEVEL FIRST: one layer per app, mounted once (root shell) and
//     surviving SPA navigations; panels register/unregister as routes come and
//     go. Section-scoped use is the same API pointed at a smaller canvas.
//   - PIXEL-MATCHED CAMERA: a perspective camera placed so the z=0 plane maps
//     1 world unit = 1 CSS px (the CSS `perspective` model) — panels line up
//     exactly with their anchors, and tilt/flip get true perspective.
//   - CAPTURE: faces are live DOM elements adopted into the canvas subtree and
//     captured via HtmlTexture (WebGPU strategy with owned resolution, or the
//     WebGL2 fallback strategy — see html-texture.ts). Alpha is preserved, so
//     rounded corners/shadows come from the DOM itself.
//   - HIT RESOLUTION: a CPU Raycaster — exact for rigid planar panels, and
//     identical on both backends. This is a deliberate v1 seam: the GPU pick
//     MRT (pickPos/pickId/pickUv, see threejs-playground archipelago setup)
//     drops in behind `resolveHit` when deformed/instanced panels arrive.
//   - ARMING (the multi-HtmlTexture rule): every face element defaults to
//     `pointer-events:none`; each frame, ONLY the face the resolver puts under
//     the cursor is armed (`pointer-events:auto`) and slid so the hit UV's DOM
//     point sits exactly under the cursor — so links/buttons inside the
//     texture are genuinely clickable, occlusion-correct, one panel at most.
//
// Client-only module: import dynamically after mount (never on the server).

import {
	atan,
	clamp,
	colorSpaceToWorking,
	float,
	fract,
	fwidth,
	length,
	max,
	min,
	smoothstep,
	texture as textureNode,
	uniform,
	uv,
	vec2,
} from 'three/tsl'
import { mountStatsPanel } from '@aicolab/kolo/rendering/stats-panel'
import { setBackendTrackTimestamp } from '@aicolab/kolo/webgpu'
import * as THREE from 'three/webgpu'
import { POLYFILL_HOST_SELECTOR } from './html-in-canvas'
import { HtmlTexture } from './html-texture'

/** Perspective distance in CSS px — matches a CSS `perspective: 1400px`. */
const PERSPECTIVE = 1400
/** Capture density relative to devicePixelRatio (supersampling headroom). */
const CAPTURE_SCALE = 1.5
/** Max radians of pointer tilt around each axis. */
const MAX_TILT = 0.12
/** Z-lift (CSS px) for a structured card's [data-depth-lift] media block —
 *  the real-plane counterpart of the CSS face's translateZ(50px) (halved:
 *  the layer's tilt reads deeper than the CSS preview at equal z). */
const MEDIA_LIFT_Z = 24
/** Projection compensation for the lift plane: a point at z projects scaled
 *  by P/(P−z) about the camera axis; scaling the plane (and correcting its
 *  offset per frame) by the inverse keeps it exactly over the base media at
 *  rest, so the lift shows only under tilt parallax. */
const LIFT_K = (PERSPECTIVE - MEDIA_LIFT_Z) / PERSPECTIVE
/** Per-frame lerp factors (60fps-tuned; frame-rate drift is acceptable here). */
const TILT_LERP = 0.14
const FLIP_LERP = 0.16
const RING_LERP = 0.12

// The DOM face's ::after ring, ported exactly (see styles.css "DepthCard"):
// an 18px-rounded-rect outline band, RING_THICKNESS px deep, filled with
// conic-gradient(from --dc-angle, transparent 12%, accent 50%, transparent 88%).
const RING_RADIUS = 18
const RING_THICKNESS = 1.5
/** Turn-distance from the 50% peak to a transparent stop: 0.5 − 0.12. */
const RING_FADE = 0.38
const TURN = Math.PI * 2 // PI2 is deprecated as of r181

export interface DepthPanelInit {
	/** Page-flow element whose viewport rect the panel tracks. It should own
	 *  its final layout size (the faces are adopted OUT of the flow). */
	anchor: HTMLElement
	/** Front face — captured into the panel texture. Adopted into the canvas
	 *  subtree by the layer; returned to `anchor` on dispose. */
	front: HTMLElement
	/** Optional back face (flip target). */
	back?: HTMLElement
	/** Arm the real DOM under the cursor (links/buttons inside faces work). */
	interactive?: boolean
	/** Accent for the hover glow behind the panel (any CSS color). */
	glowColor?: string
	/** Tap on the panel body (not on a link/button/input inside it). */
	onTap?: () => void
	/** Hover-state notifications (drives core signals). */
	onHover?: (hover: boolean) => void
}

export interface DepthPanelHandle {
	/** Animate the panel to its flipped/unflipped side. */
	setFlipped(flipped: boolean): void
	/** Re-capture both faces (call after meaningful DOM changes). */
	refresh(): void
	/** Unregister, dispose GPU resources, return faces to the anchor. */
	dispose(): void
}

interface Face {
	el: HTMLElement
	/** Context wrapper — the captured direct canvas child (carries the anchor's
	 *  classes so the component's scoped CSS applies in captures). */
	wrapper: HTMLElement
	mesh: THREE.Mesh
	texture: HtmlTexture
	material: THREE.MeshBasicNodeMaterial
	/** Slide accumulators — PER capture element (the delta method's "prior
	 *  value is baked into the measured rect" invariant). */
	slideTx: number
	slideTy: number
}

interface Panel {
	init: DepthPanelInit
	group: THREE.Group
	faces: Face[]
	ring: RingUniforms
	ringMaterial: THREE.MeshBasicNodeMaterial
	ringGeometry: THREE.PlaneGeometry
	w: number
	h: number
	tiltX: number
	tiltY: number
	targetTiltX: number
	targetTiltY: number
	flip: number
	targetFlip: number
	ringLevel: number
	hover: boolean
	/** Lifted media plane (structured fronts): base local offset, corrected
	 *  per frame so the plane's projection covers the base media exactly at
	 *  rest (a z-lifted plane otherwise enlarges by P/(P−z) about the CAMERA
	 *  axis, drifting off the base for off-center cards). */
	lift?: { mesh: THREE.Mesh; x: number; y: number }
}

export interface DepthLayer {
	addPanel(init: DepthPanelInit): DepthPanelHandle
	/** True once the renderer initialised (WebGPU or WebGL2 backend). */
	ready(): boolean
	dispose(): void
}

export interface DepthLayerOptions {
	/** Mount the kolo stats panel (FPS → CPU ms → heap → measured GPU ms; click
	 *  to cycle) and enable backend timestamp queries. Same wiring as the
	 *  playground's insights-spatial engine. */
	stats?: boolean
}

/** Uniforms driving one panel's ring (shared by its front/back ring planes). */
function createRingUniforms(color: THREE.Color) {
	return {
		/** Hover fade 0..1 (the ::after opacity transition). */
		level: uniform(0),
		/** Gradient start in turns — the CSS `--dc-angle` / 360. */
		turn: uniform(0),
		/** The accent (`--c-glow`/`--c-accent` in the CSS face). */
		color: uniform(color),
	}
}
type RingUniforms = ReturnType<typeof createRingUniforms>

/**
 * The CSS face's pointer-angled conic edge ring as a node material. Exact
 * port of `.dc-face::after`: a rounded-rect SDF band (the outermost
 * RING_THICKNESS px inside the RING_RADIUS outline) times the conic profile —
 * linear ramps between the gradient's transparent-12% / accent-50% /
 * transparent-88% stops — times the hover level.
 */
function makeRingMaterial(w: number, h: number, u: RingUniforms): THREE.MeshBasicNodeMaterial {
	const material = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false })
	// CSS-pixel coords: origin at center, y down (mesh units ARE CSS px).
	const p = vec2(uv().x.sub(0.5).mul(w), float(0.5).sub(uv().y).mul(h))
	// Rounded-rect SDF of the face outline (negative inside).
	const q = p.abs().sub(vec2(w / 2 - RING_RADIUS, h / 2 - RING_RADIUS))
	const d = length(max(q, 0)).add(min(max(q.x, q.y), 0)).sub(RING_RADIUS)
	// Band occupancy with fwidth antialiasing on both edges.
	const aa = fwidth(d)
	const band = smoothstep(0, aa, d.negate()).mul(smoothstep(0, aa, d.add(RING_THICKNESS)))
	// conic-gradient position in turns, clockwise from 12 o'clock (atan's
	// two-arg form is atan2; up is −y in CSS coords).
	const t = fract(atan(p.x, p.y.negate()).div(TURN).sub(u.turn))
	const profile = clamp(float(1).sub(t.sub(0.5).abs().div(RING_FADE)), 0, 1)
	material.colorNode = u.color
	material.opacityNode = band.mul(profile).mul(u.level)
	return material
}

/** The page-resolved accent for a panel's ring — computed through a probe
 *  element because `--c-accent` may hold an unresolved `light-dark()` (custom
 *  properties keep it symbolic; a real `color` property resolves it). */
function resolveRingColor(init: DepthPanelInit): THREE.Color {
	const color = new THREE.Color()
	if (init.glowColor) return color.setStyle(init.glowColor)
	const probe = document.createElement('span')
	probe.style.color = 'var(--c-accent, #ffffff)'
	init.anchor.appendChild(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return color.setStyle(resolved || '#ffffff')
}

/** Whether `el` (or an ancestor within the face) is a real control that should
 *  receive the click instead of flipping the card. */
function isInteractiveTarget(el: EventTarget | null): boolean {
	return (
		el instanceof Element &&
		el.closest('a,button,input,select,textarea,summary,[data-depth-no-tap]') !== null
	)
}

/**
 * Create the app's depth layer: a fixed, viewport-filling, pointer-events:none
 * canvas appended to `document.body`. Panels are added/removed at any time;
 * the render loop only runs while panels exist.
 */
export async function createDepthLayer(options: DepthLayerOptions = {}): Promise<DepthLayer> {
	const canvas = document.createElement('canvas')
	canvas.dataset.depthLayer = ''
	// html-in-canvas contract: captured elements must be children of a
	// `<canvas layoutsubtree>` (the polyfill relocates them to its host itself).
	canvas.setAttribute('layoutsubtree', '')
	canvas.style.cssText =
		'position:fixed;inset:0;width:100vw;height:100vh;z-index:40;pointer-events:none;'
	document.body.appendChild(canvas)

	const renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: true })
	await renderer.init() // picks WebGPU, falls back to WebGL2 on its own
	renderer.setClearColor(0x000000, 0)

	// ── Stats (opt-in) — insights-spatial's wiring, verbatim ───────────────────
	// The layer canvas is pointer-events:none, so the panel gets its own tiny
	// fixed host (clicks cycle FPS → CPU ms → heap → GPU ms). Timestamp
	// resolution is a GPU readback, not a passive counter read: drain the query
	// pools four times per second, never overlapping readbacks, and only enable
	// backend instrumentation at all when the panel is up (it adds commands and
	// bookkeeping even when nobody resolves the results).
	let statsHost: HTMLElement | null = null
	let stats: ReturnType<typeof mountStatsPanel> | null = null
	let gpuTimestamps = false
	const GPU_SAMPLE_INTERVAL_MS = 250
	let lastGpuSampleAt = -Infinity
	let gpuSamplePending = false
	if (options.stats) {
		statsHost = document.createElement('div')
		statsHost.style.cssText = 'position:fixed;top:0;left:0;z-index:60;pointer-events:auto;'
		document.body.appendChild(statsHost)
		stats = mountStatsPanel(statsHost, { panels: [{ name: 'GPU' }] })
		gpuTimestamps = renderer.hasFeature('timestamp-query')
		if (gpuTimestamps) setBackendTrackTimestamp(renderer.backend, true)
	}

	const scene = new THREE.Scene()
	const camera = new THREE.PerspectiveCamera(50, 1, PERSPECTIVE / 10, PERSPECTIVE * 10)
	const raycaster = new THREE.Raycaster()
	const panels = new Set<Panel>()

	let vw = 0
	let vh = 0
	const resize = (): void => {
		vw = window.innerWidth
		vh = window.innerHeight
		renderer.setSize(vw, vh, false)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		camera.aspect = vw / vh
		camera.fov = (2 * Math.atan(vh / 2 / PERSPECTIVE) * 180) / Math.PI
		camera.position.set(0, 0, PERSPECTIVE)
		camera.updateProjectionMatrix()
	}
	resize()
	window.addEventListener('resize', resize)

	// ── Theme mirroring — `.theme-dark` on the canvas ──────────────────────────
	// The polyfill snapshot wraps captures in a synthetic document that carries
	// only CLASSES through the canvas→host→wrapper-div chain (the host copies
	// the canvas's className at creation, polyfill.mjs:829; the wrapper div
	// copies the captured element's parent's class per rasterise, he()) —
	// attributes like [data-theme] never make it in, so attribute-keyed dark
	// tokens resolve light in every snapshot. Mirroring the EFFECTIVE theme as
	// the ui-solid contract's `.theme-dark` class rides that chain: live faces
	// inherit it directly (native path) and snapshots match `.theme-dark` token
	// rules from the copied stylesheets.
	let polyfillHost: HTMLElement | null = null
	const themeQuery = window.matchMedia('(prefers-color-scheme: dark)')
	let themeDark = false
	const syncTheme = (): void => {
		const pinned = document.documentElement.dataset.theme
		themeDark = pinned === 'dark' || (pinned !== 'light' && themeQuery.matches)
		let changed = false
		if (canvas.classList.contains('theme-dark') !== themeDark) {
			canvas.classList.toggle('theme-dark', themeDark)
			changed = true
		}
		// The host copies the canvas class only at ITS creation — keep live
		// flips in step so the next rasterise reads the right wrapper class.
		if (!polyfillHost) polyfillHost = document.querySelector(POLYFILL_HOST_SELECTOR)
		if (polyfillHost && polyfillHost.classList.contains('theme-dark') !== themeDark) {
			polyfillHost.classList.toggle('theme-dark', themeDark)
			changed = true
		}
		if (changed) {
			// Rings hold the accent as a GPU uniform — re-resolve it per theme
			// (the CSS face gets this for free from var(--c-accent)).
			for (const p of panels) p.ring.color.value.copy(resolveRingColor(p.init))
			canvas.requestPaint?.()
		}
	}
	syncTheme()
	themeQuery.addEventListener('change', syncTheme)

	// ── Capture cadence — the playground scenes' model, verbatim: the provider
	// fires 'paint' on DOM change or an explicit requestPaint (native and
	// polyfill alike); ALL captures happen in the paint handler, primed once
	// per registration. Out-of-band invalidation the provider can't see —
	// the theme attribute flipping on <html> (changes captured elements'
	// computed styles without mutating them) and font readiness — requests a
	// paint, the same way the scenes do for their own out-of-band changes.
	// PaintEvent.changedElements (WICG spec: `readonly attribute
	// FrozenArray<Element> changedElements`) names exactly which elements were
	// re-rasterised — on BOTH the native API and the polyfill (which mirrors the
	// spec). Update only those textures. The all-faces fallback exists solely
	// for API vintages predating PaintEvent (the same era spread that forced the
	// copyElementImageToTexture signature adapter). Explicit requestPaint marks
	// every adopted child changed, so theme-flip refreshes still reach all faces.
	const paintChangedElements = (event: Event): ReadonlySet<Element> | null => {
		if (!('changedElements' in event)) return null
		const raw: unknown = event.changedElements
		if (!Array.isArray(raw)) return null
		const set = new Set<Element>()
		for (const el of raw) if (el instanceof Element) set.add(el)
		return set
	}
	const onPaint = (event: Event): void => {
		const changed = paintChangedElements(event)
		for (const p of panels) {
			for (const f of p.faces) {
				// The provider reports the CAPTURED element — the wrapper; a change
				// inside the face dirties its wrapper.
				if (changed && !changed.has(f.wrapper)) continue
				f.texture.update()
			}
		}
	}
	canvas.addEventListener('paint', onPaint)
	const docObserver = new MutationObserver(() => {
		syncTheme()
		canvas.requestPaint?.()
	})
	docObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-theme', 'class'],
	})
	document.fonts.ready.then(() => canvas.requestPaint?.()).catch(() => {})

	// ── Pointer tracking (document-level: the canvas itself is click-through) ──
	// `moved` is the INTENT flag, consumed once per frame: the slide follows the
	// pointer only when the pointer itself moved. Content scrolling under a
	// stationary cursor drifts the hit UV every frame, and sliding on that drift
	// means a style write per frame — which, under the polyfill's host
	// MutationObserver, forces a full SVG re-rasterisation per frame (the scroll
	// lag). Pointer intent gates all of that churn off.
	const pointer = { x: -1, y: -1, inside: false, moved: false }
	const onPointerMove = (e: PointerEvent): void => {
		pointer.x = e.clientX
		pointer.y = e.clientY
		pointer.inside = true
		pointer.moved = true
	}
	const onPointerDown = (e: PointerEvent): void => {
		pointer.x = e.clientX
		pointer.y = e.clientY
		pointer.inside = true
		pointer.moved = true
		// Re-align synchronously so the face's DOM sits under the pointer for the
		// rest of the gesture (mouseup/click hit-tests), even if the page scrolled
		// since the last pointer movement.
		const hit = resolveHit(e.clientX, e.clientY)
		if (hit && hit.panel.init.interactive !== false) {
			arm(hit, true)
			enforcePointerEvents()
		}
	}
	const onPointerLeave = (): void => {
		pointer.inside = false
	}
	document.addEventListener('pointermove', onPointerMove, { passive: true })
	document.addEventListener('pointerdown', onPointerDown, { passive: true })
	document.documentElement.addEventListener('pointerleave', onPointerLeave)

	// Tap fallback for the DISARMED case (non-interactive panels): the canvas is
	// click-through, so resolve the click against the scene ourselves.
	const onDocumentClick = (e: MouseEvent): void => {
		if (isInteractiveTarget(e.target)) return
		const hit = resolveHit(e.clientX, e.clientY)
		if (hit) hit.panel.init.onTap?.()
	}
	document.addEventListener('click', onDocumentClick)

	const _ndc = new THREE.Vector2()
	interface Hit {
		panel: Panel
		face: Face
		uv: THREE.Vector2
	}
	/** The front-most face under client (x,y), with its surface UV — the v1
	 *  resolver seam (CPU raycast; swap for the GPU pick to go geometry-blind). */
	const resolveHit = (x: number, y: number): Hit | null => {
		if (panels.size === 0) return null
		_ndc.set((x / vw) * 2 - 1, -(y / vh) * 2 + 1)
		raycaster.setFromCamera(_ndc, camera)
		const meshes: THREE.Mesh[] = []
		for (const p of panels) for (const f of p.faces) meshes.push(f.mesh)
		const hits = raycaster.intersectObjects(meshes, false)
		for (const h of hits) {
			if (!h.uv) continue
			for (const p of panels) {
				const face = p.faces.find((f) => f.mesh === h.object)
				// Only the side currently facing the camera is a valid target.
				if (face && faceIsFrontmost(p, face)) return { panel: p, face, uv: h.uv }
			}
		}
		return null
	}
	const faceIsFrontmost = (p: Panel, f: Face): boolean => {
		const showingBack = ((Math.round(p.flip / Math.PI) % 2) + 2) % 2 === 1
		const isBack = p.faces.indexOf(f) === 1
		return showingBack === isBack
	}

	// ── Arming (at most one face) ──────────────────────────────────────────────
	// pointer-events is OWNED here, asserted write-on-diff in the frame loop —
	// for the faces AND the polyfill's capture host (which forces inline
	// `pointer-events:auto` on itself and on adopted elements). Ownership
	// replaces the old blanket `!important` stylesheet: whatever the polyfill
	// forces, the next frame writes the value we want, no specificity games.
	let armed: Face | null = null
	const enforcePointerEvents = (): void => {
		if (!polyfillHost) polyfillHost = document.querySelector(POLYFILL_HOST_SELECTOR)
		if (polyfillHost && polyfillHost.style.pointerEvents !== 'none') {
			polyfillHost.style.pointerEvents = 'none'
		}
		for (const p of panels) {
			for (const f of p.faces) {
				// The polyfill forces inline pointer-events:auto on ADOPTED elements —
				// which is now the wrapper. Own it like everything else, or the
				// invisible wrapper intercepts hit-testing (dead cursor, blocked page).
				if (f.wrapper.style.pointerEvents !== 'none') f.wrapper.style.pointerEvents = 'none'
				const want = f === armed ? 'auto' : 'none'
				if (f.el.style.pointerEvents !== want) f.el.style.pointerEvents = want
			}
		}
	}
	const disarm = (): void => {
		armed = null
	}
	const arm = (hit: Hit, slide: boolean): void => {
		armed = hit.face
		// Slide the WRAPPER so the hit UV's DOM point sits under the cursor.
		// CRITICAL: the wrapper is the CAPTURED element — the spec ignores the
		// captured element's own transform, so sliding it never shows in the
		// texture; sliding the face (a capture CHILD) would translate the card's
		// content out of the capture box. Delta method + write-on-change per
		// curved-slide's discipline; accumulators per face.
		if (!slide) return
		const p = hit.panel
		const f = hit.face
		const localX = hit.uv.x * p.w
		const localY = (1 - hit.uv.y) * p.h
		const rect = f.wrapper.getBoundingClientRect()
		f.slideTx += pointer.x - (rect.left + localX)
		f.slideTy += pointer.y - (rect.top + localY)
		const next = `translate(${f.slideTx}px, ${f.slideTy}px)`
		if (f.wrapper.style.transform !== next) f.wrapper.style.transform = next
	}

	// ── Frame loop ─────────────────────────────────────────────────────────────
	let raf = 0
	let disposed = false
	const _rect = { x: 0, y: 0 }
	const frame = (): void => {
		raf = 0
		if (disposed) return
		if (panels.size === 0) return // parked; addPanel restarts

		const hit = pointer.inside ? resolveHit(pointer.x, pointer.y) : null
		for (const p of panels) {
			const anchorRect = p.init.anchor.getBoundingClientRect()
			_rect.x = anchorRect.left + anchorRect.width / 2 - vw / 2
			_rect.y = vh / 2 - (anchorRect.top + anchorRect.height / 2)
			const onScreen = anchorRect.bottom > -100 && anchorRect.top < vh + 100
			p.group.visible = onScreen
			p.group.position.set(_rect.x, _rect.y, 0)
			if (p.lift) {
				// Keep the lifted plane's projection exactly over the base media at
				// rest — the correction depends on the group's screen offset.
				p.lift.mesh.position.x = p.lift.x * LIFT_K - _rect.x * (1 - LIFT_K)
				p.lift.mesh.position.y = p.lift.y * LIFT_K - _rect.y * (1 - LIFT_K)
			}

			const isHit = hit?.panel === p
			if (isHit !== p.hover) {
				p.hover = isHit
				p.init.onHover?.(isHit)
			}
			if (isHit && hit) {
				p.targetTiltY = (hit.uv.x - 0.5) * 2 * MAX_TILT
				p.targetTiltX = (hit.uv.y - 0.5) * 2 * MAX_TILT
			} else {
				p.targetTiltX = 0
				p.targetTiltY = 0
			}
			p.tiltX += (p.targetTiltX - p.tiltX) * TILT_LERP
			p.tiltY += (p.targetTiltY - p.tiltY) * TILT_LERP
			p.flip += (p.targetFlip - p.flip) * FLIP_LERP
			p.group.rotation.set(p.tiltX, p.tiltY + p.flip, 0)

			// Ring: hover fade + pointer angle, exactly the CSS face's variables
			// (--dc-angle = atan2(ny, nx) + 90°, in turns for the shader).
			p.ringLevel += ((isHit ? 1 : 0) - p.ringLevel) * RING_LERP
			p.ring.level.value = p.ringLevel
			if (isHit) {
				const dx = pointer.x - (anchorRect.left + anchorRect.width / 2)
				const dy = pointer.y - (anchorRect.top + anchorRect.height / 2)
				p.ring.turn.value = (Math.atan2(dy, dx) + Math.PI / 2) / TURN
			}
		}

		const pointerMoved = pointer.moved
		pointer.moved = false
		if (hit && hit.panel.init.interactive !== false) arm(hit, pointerMoved)
		else disarm()
		enforcePointerEvents()

		void renderer.render(scene, camera)
		if (stats) {
			stats.update()
			const now = performance.now()
			if (gpuTimestamps && !gpuSamplePending && now - lastGpuSampleAt >= GPU_SAMPLE_INTERVAL_MS) {
				lastGpuSampleAt = now
				gpuSamplePending = true
				void (async () => {
					// Match Three's inspector ordering and serialize the two mapAsync
					// operations rather than making two simultaneous readbacks.
					await renderer.resolveTimestampsAsync(THREE.TimestampQuery.COMPUTE)
					const ms = await renderer.resolveTimestampsAsync(THREE.TimestampQuery.RENDER)
					if (ms !== undefined) stats?.setPanelValue('GPU', ms, 33)
				})().finally(() => {
					gpuSamplePending = false
				})
			}
		}
		schedule()
	}
	const schedule = (): void => {
		if (raf === 0 && !disposed && panels.size > 0) raf = requestAnimationFrame(frame)
	}

	const addPanel = (init: DepthPanelInit): DepthPanelHandle => {
		const w = init.anchor.offsetWidth
		const h = init.anchor.offsetHeight
		const group = new THREE.Group()
		const disposers: (() => void)[] = []

		const faces: Face[] = []
		let panelLift: Panel['lift']
		const faceEls = init.back ? [init.front, init.back] : [init.front]
		faceEls.forEach((el, i) => {
			// ── CONTEXT WRAPPER (the systemic fix for ancestor-scoped CSS) ──
			// The face is adopted into the canvas subtree (html-in-canvas requires
			// a direct canvas child) INSIDE a wrapper that reconstructs the
			// component's scope: the wrapper carries the anchor's classes (minus
			// bridge state classes), so `.depth-card .dc-face { border-radius;
			// overflow; background; … }` — and any consumer's scoped rules —
			// match in the capture exactly as authored. No branching CSS anywhere.
			// The wrapper is the CAPTURE TARGET (the spec's direct-child rule
			// constrains what is captured, not what surrounds the face).
			const wrapper = document.createElement('div')
			wrapper.className = Array.from(init.anchor.classList)
				.filter((c) => c !== 'depth-card-enhanced' && c !== 'depth-card-flipped')
				.join(' ')
			wrapper.style.width = `${w}px`
			wrapper.style.height = `${h}px`
			wrapper.style.pointerEvents = 'none'
			el.dataset.depthFace = ''
			// Neutralize context-restored BEHAVIOR rules on the face itself: the
			// back face's authored rotateY(180) (+ backface-visibility:hidden)
			// would blank its capture. Inline transform outranks any selector,
			// and the bridge already owns this property for the arming slide.
			el.style.transform = 'none'
			el.style.pointerEvents = 'none'
			// `.depth-card { cursor: pointer }` on the wrapper INHERITS onto all
			// face content (cursor is inherited), killing contextual resolution
			// (text I-beam, control cursors). Reset to auto at the face root so
			// content under the pointer resolves its own cursor again.
			el.style.cursor = 'auto'
			wrapper.appendChild(el)
			canvas.appendChild(wrapper)
			const texture = new HtmlTexture(
				wrapper,
				renderer,
				Math.round(w * window.devicePixelRatio * CAPTURE_SCALE),
				Math.round(h * window.devicePixelRatio * CAPTURE_SCALE),
			)
			// EXPLICIT sRGB→working decode at the sampling node: the capture's
			// bytes are sRGB, and on this path the texture's colorSpace flag was
			// not being applied — sampling-as-linear + output re-encode lifted
			// every dark value (#1a160f → ~#5a5148: the "washed out" cards).
			// updateMatrix carries the texture's V-flip repeat/offset transform.
			const sample = textureNode(texture)
			sample.updateMatrix = true
			const material = new THREE.MeshBasicNodeMaterial({ transparent: true })
			// @ts-expect-error @types/three gap: colorSpaceToWorking() is typed as
			// bare ColorSpaceNode, missing the branded vec4 node surface colorNode
			// requires (__TypeScript_NODE_TYPE__ stays `unknown`, and the brand
			// defeats interface-merge augmentation). The runtime accepts it — this
			// exact assignment is how three's own examples drive decoded texture
			// color. Verified working in-browser; do NOT wrap to appease the types.
			material.colorNode = colorSpaceToWorking(sample, THREE.SRGBColorSpace)
			material.opacityNode = sample.a
			const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material)
			if (i === 1) mesh.rotation.y = Math.PI
			mesh.position.z = i === 1 ? -0.5 : 0.5
			group.add(mesh)
			const face: Face = { el, wrapper, mesh, texture, material, slideTx: 0, slideTy: 0 }
			faces.push(face)

			// ── Lifted media plane (structured fronts) — real parallax ─────────
			// Captures flatten CSS translateZ, so the front's [data-depth-lift]
			// block gets a REAL plane: the same face texture sampled over the
			// block's subrect, floating MEDIA_LIFT_Z above the face (approved
			// same-texture approach — no second capture; the lifted copy overlays
			// the base pixels, leaving at most a px-scale sliver under full tilt,
			// which reads as the shadow edge).
			if (i === 0) {
				const liftEl = el.querySelector<HTMLElement>('[data-depth-lift]')
				if (liftEl) {
					const faceRect = el.getBoundingClientRect()
					const liftRect = liftEl.getBoundingClientRect()
					const lw = liftRect.width
					const lh = liftRect.height
					if (lw > 0 && lh > 0) {
						const x = liftRect.left - faceRect.left
						const y = liftRect.top - faceRect.top
						const geo = new THREE.PlaneGeometry(lw, lh)
						// PlaneGeometry vertex order TL,TR,BL,BR; face-UV convention
						// v=1 at DOM top (the texture matrix's V-flip applies to both
						// planes identically).
						const u0 = x / w
						const u1 = (x + lw) / w
						const vTop = 1 - y / h
						const vBot = 1 - (y + lh) / h
						geo.setAttribute(
							'uv',
							new THREE.Float32BufferAttribute([u0, vTop, u1, vTop, u0, vBot, u1, vBot], 2),
						)
						const liftMesh = new THREE.Mesh(geo, material)
						const lx = x + lw / 2 - w / 2
						const ly = h / 2 - (y + lh / 2)
						liftMesh.scale.set(LIFT_K, LIFT_K, 1)
						liftMesh.position.set(lx * LIFT_K, ly * LIFT_K, MEDIA_LIFT_Z)
						mesh.add(liftMesh)
						panelLift = { mesh: liftMesh, x: lx, y: ly }
						disposers.push(() => geo.dispose())
					}
				}
			}

			// Tap-to-flip on the ARMED element (clicks on real controls pass through).
			const onClick = (e: MouseEvent): void => {
				if (isInteractiveTarget(e.target)) return
				e.stopPropagation() // the document fallback must not double-fire
				init.onTap?.()
			}
			el.addEventListener('click', onClick)
			disposers.push(() => el.removeEventListener('click', onClick))
		})

		// The ::after ring, one plane per face side (front-side culling makes
		// exactly the ring of the visible face render — each face's own ring,
		// as in CSS). Shared material/uniforms; slightly proud of the faces.
		const ring = createRingUniforms(resolveRingColor(init))
		const ringMaterial = makeRingMaterial(w, h, ring)
		const ringGeometry = new THREE.PlaneGeometry(w, h)
		const ringFront = new THREE.Mesh(ringGeometry, ringMaterial)
		ringFront.position.z = 1
		group.add(ringFront)
		if (init.back) {
			const ringBack = new THREE.Mesh(ringGeometry, ringMaterial)
			ringBack.rotation.y = Math.PI
			ringBack.position.z = -1
			group.add(ringBack)
		}

		const panel: Panel = {
			init,
			group,
			faces,
			ring,
			ringMaterial,
			ringGeometry,
			w,
			h,
			tiltX: 0,
			tiltY: 0,
			targetTiltX: 0,
			targetTiltY: 0,
			flip: 0,
			targetFlip: 0,
			ringLevel: 0,
			hover: false,
			lift: panelLift,
		}
		scene.add(group)
		panels.add(panel)
		// Native path: capture after the engine's first paint of the subtree.
		canvas.requestPaint?.()
		schedule()

		return {
			setFlipped(flipped: boolean): void {
				panel.targetFlip = flipped ? Math.PI : 0
			},
			refresh(): void {
				canvas.requestPaint?.()
			},
			dispose(): void {
				if (armed && faces.includes(armed)) disarm()
				panels.delete(panel)
				scene.remove(group)
				for (const d of disposers) d()
				for (const f of faces) {
					f.texture.dispose()
					f.material.dispose()
					f.mesh.geometry.dispose()
					f.el.style.pointerEvents = ''
					f.el.style.transform = ''
					init.anchor.appendChild(f.el) // give the face back to the page
					f.wrapper.remove()
				}
				ringMaterial.dispose()
				ringGeometry.dispose()
			},
		}
	}

	return {
		addPanel,
		ready: () => true,
		dispose(): void {
			disposed = true
			if (raf) cancelAnimationFrame(raf)
			window.removeEventListener('resize', resize)
			document.removeEventListener('pointermove', onPointerMove)
			document.removeEventListener('pointerdown', onPointerDown)
			document.documentElement.removeEventListener('pointerleave', onPointerLeave)
			document.removeEventListener('click', onDocumentClick)
			canvas.removeEventListener('paint', onPaint)
			themeQuery.removeEventListener('change', syncTheme)
			docObserver.disconnect()
			stats?.dispose()
			statsHost?.remove()
			renderer.dispose()
			canvas.remove()
		},
	}
}
