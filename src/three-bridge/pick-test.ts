// GPU pick → R3F hook dispatch, driven by a swappable read resolver.
//
// This is the reader-agnostic event layer: it owns BOTH read paths and
// runs exactly one per frame (chosen via `setReadMode`), so the two can
// be A/B'd for runtime cost with FPS reflecting only the active path:
//   - `compute` → `pick-compute` (a kernel samples the pick MRT, decodes
//     it, writes a storage buffer read back in one call).
//   - `mrt`     → `readPickAt` in `pick-mrt.ts` (the CPU reads the cursor
//     texels off the MRT directly — two 1×1 readbacks).
// Both consume the SAME per-frame MRT write, and both return the same
// minimal hit shape, so switching changes nothing the dispatch sees.
//
// Each frame `tick()` resolves query 0 (the mouse) and:
//   - diffs the hovered (objectId, instanceIndex) pair → fires R3F
//     `onPointerOut`/`onPointerOver` ONLY on a transition, INCLUDING moving
//     between two instances of one InstancedMesh. Because this runs in the
//     render loop (not on DOM pointer-move), a boat sliding under a dead-
//     still cursor fires hover correctly — the kernel re-resolves each frame.
// A real `click` (pointerdown+pointerup, NOT a drag) fires the hit object's
// `onClick` from the latest resolved hit — SYNCHRONOUSLY, inside the click's
// user activation. The picker owns that `click` listener itself (see below), so
// every consumer gets identical, activation-preserving click dispatch across
// touch and mouse with no per-consumer wiring. `latest` is kept warm across
// release so the click is a pure synchronous read (no async readback in the
// gesture, which on WebKit would lose the activation that focus()/showPicker()/
// clipboard need).
//
// Dispatch invokes the object's REGISTERED R3F handlers directly — the same
// callbacks R3F stores at `object.__r3f.handlers` — bubbling leaf→root with
// stopPropagation. Entities keep their `<mesh onClick onPointerOver>`. R3F's
// own raycast pipeline is disabled so it can't double-fire.

import * as THREE from 'three/webgpu'
import type { PickRead } from './types'
import { installObjectRegistry } from './object-registry'
import { installPickCompute } from './pick-compute'
import { PICK_SLOT, readPickAt } from './pick-mrt'

/** The hit shape both read paths normalise to. `null` = a miss (sky /
 *  cleared / hit-flag below threshold). The dispatch layer uses `objectId` +
 *  `instanceIndex`; `point` (flat-sim world position of the picked surface)
 *  rides along for consumers that want it (placement, distance checks). Both
 *  readers supply all three — they decode the same texels via `decodePick`. */
interface PickResolved {
	objectId: number
	instanceIndex: number
	point: THREE.Vector3
	uv: THREE.Vector2
}

/** Resolve the hit under a drawing-buffer pixel. One per read path. */
type PickResolver = (px: number, py: number) => Promise<PickResolved | null>

/** Structural slice of the R3F store the picker touches (so vanilla apps
 *  never import @react-three/fiber): its only use is disabling R3F's own
 *  raycast event pipeline while this GPU picker owns dispatch. */
interface R3FStore {
	getState(): {
		events: { enabled: boolean }
		setEvents(events: { enabled: boolean }): void
	}
}

/** R3F stashes the JSX event handlers here (`events.ts`:
 *  `instance.handlers.onPointerOut?.(data)`). */
interface R3FInstance {
	handlers?: Record<string, ((e: unknown) => void) | undefined>
}

interface PickEvent {
	object: THREE.Object3D
	eventObject: THREE.Object3D
	instanceId: number | null
	stopPropagation: () => void
}

/** Invoke R3F handler `name` on `leaf`, bubbling leaf→root with
 *  stopPropagation — mirrors R3F's own bubbling. */
function dispatchHook(
	leaf: THREE.Object3D,
	name: string,
	instanceId: number | null,
): void {
	let stopped = false
	const event: PickEvent = {
		object: leaf,
		eventObject: leaf,
		instanceId,
		stopPropagation: () => {
			stopped = true
		},
	}
	let o: THREE.Object3D | null = leaf
	while (o && !stopped) {
		const inst = (o as unknown as { __r3f?: R3FInstance }).__r3f
		const handler = inst?.handlers?.[name]
		if (handler) {
			event.eventObject = o
			handler(event)
		}
		o = o.parent
	}
}

export interface PickSystemHandle {
	/** Resolve query 0 (the mouse) off the freshly-rendered pick MRT and
	 *  fire hover transitions. Call once per frame, AFTER the render. */
	tick: () => void
	/** Index an additional scene root for id→object resolution. Multi-world
	 *  hosts call this for EVERY world: GPU pick ids can come from any
	 *  rendered world (post-traversal main passes, pick-through-portal
	 *  passthrough), and an unindexed id silently resolves as a miss. */
	addRoot: (root: THREE.Object3D) => void
	/** Switch the active read path. Only the selected one runs each frame,
	 *  so FPS reflects that path alone. Clears hover on switch so a stale
	 *  highlight doesn't survive the change. */
	setReadMode: (mode: PickRead) => void
	dispose: () => void
}

export function installPickTest(args: {
	scene: THREE.Scene
	renderer: THREE.WebGPURenderer
	/** Optional R3F store. When present (the React app), its built-in event
	 *  dispatch is disabled here and restored on dispose. Omit it in a vanilla
	 *  host (e.g. the Solid port) — there's no R3F raycast pipeline to disable. */
	store?: R3FStore
	pickPosTex: THREE.Texture
	pickIdTex: THREE.Texture
	/** Scene-pass render target holding the pick attachments — the `mrt`
	 *  read path reads its texels directly by slot index. */
	renderTarget: THREE.RenderTarget
	/** Initial read path. Defaults to `compute` (the historically-active
	 *  path) so behaviour is unchanged until the A/B seg is flipped. */
	initialMode?: PickRead
	/** Optional observer fired on every CLICK with the resolved hit —
	 *  including hits whose object isn't indexed (`object: null`), so a
	 *  registry gap is visible instead of silent. Rides alongside the
	 *  handler dispatch; hosts use it for diagnostics/HUDs without putting
	 *  handlers on every scene object. */
	onClickHit?: (hit: {
		object: THREE.Object3D | null
		objectId: number
		instanceIndex: number
		point: THREE.Vector3
		uv: THREE.Vector2
	}) => void
	/** Fired every frame with the freshly-resolved query-0 hit (or `null`), AFTER
	 *  hover dispatch. For CONTINUOUS tracking — e.g. extending a drag-select each
	 *  frame — WITHOUT re-firing the `onClick` dispatch that `doClick` would. */
	onResolve?: (
		hit: {
			object: THREE.Object3D | null
			objectId: number
			instanceIndex: number
			point: THREE.Vector3
			uv: THREE.Vector2
		} | null,
	) => void
}): PickSystemHandle {
	const { scene, renderer, store, pickPosTex, pickIdTex, renderTarget, onClickHit, onResolve } = args
	// The `pickUv` attachment is slot 3 of the same render target — derived here
	// so every consumer of this picker gets UV without wiring it through.
	const pickUvTex = renderTarget.textures[PICK_SLOT.uv]

	// On three's WebGL2 fallback the pick path needs two adjustments vs WebGPU:
	//   1. Render-target textures are BOTTOM-left origin (vs WebGPU top-left),
	//      so the top-left cursor pixel is Y-flipped here at the source before it
	//      indexes the pick attachments (fixes the read coordinate).
	//   2. The `compute` read path misbehaves on the fallback (a black frame on
	//      use), so the EFFECTIVE read mode is forced to `mrt` regardless of the
	//      requested/default mode — see `effectiveMode` in tick(). `compute`
	//      stays the default for WebGPU.
	// Both are no-ops on WebGPU (flag false).
	const backendObj: unknown = renderer.backend
	const webglFallback =
		typeof backendObj === 'object' &&
		backendObj !== null &&
		'isWebGLBackend' in backendObj &&
		backendObj.isWebGLBackend === true

	const pickCompute = installPickCompute({ renderer, pickPosTex, pickIdTex, pickUvTex })

	// O(1) id→object resolution, kept live as the scene graph mutates (vs
	// `scene.getObjectById`'s O(N) per-frame DFS). Reader-agnostic — serves
	// both read paths. See `object-registry.ts`.
	const registry = installObjectRegistry(scene)

	// The two read paths, normalised to the same hit shape. tick() runs
	// exactly one of these per frame (see `mode`).
	const resolveCompute: PickResolver = async (px, py) => {
		pickCompute.setCursor(0, px, py)
		const q = (await pickCompute.resolve())[0]
		return q
			? { objectId: q.objectId, instanceIndex: q.instanceIndex, point: q.point, uv: q.uv }
			: null
	}
	const resolveMrt: PickResolver = async (px, py) => {
		const hit = await readPickAt(renderer, renderTarget, px, py)
		return hit
			? {
					objectId: hit.objectId,
					instanceIndex: hit.instanceIndex,
					point: hit.point,
					uv: hit.uv,
				}
			: null
	}
	const resolvers: Record<PickRead, PickResolver> = {
		compute: resolveCompute,
		mrt: resolveMrt,
	}
	let mode: PickRead = args.initialMode ?? 'compute'

	// Take over picking: disable R3F's built-in raycast dispatch (it would
	// raycast the flat CPU geometry through the warped camera → wrong).
	const prevEnabled = store?.getState().events.enabled ?? false
	store?.getState().setEvents({ enabled: false })

	const dom = renderer.domElement
	const cursor = { x: 0, y: 0, inside: false }
	// Cache the canvas rect. `getBoundingClientRect()` forces a synchronous
	// layout reflow, and the page's layout is kept dirty every frame (Stats
	// panel + HUD text + cursor-style writes) — so calling it inside the
	// pointermove handler reflowed once per mouse-move, which is what tanked
	// FPS during motion (200→30). The rect only changes on resize/scroll, so
	// cache it and refresh on those events instead.
	let rect = dom.getBoundingClientRect()
	const refreshRect = (): void => {
		rect = dom.getBoundingClientRect()
	}
	// Distinguishes hover-capable input (mouse/pen) from touch, which has NO
	// hover phase — so a tap must resolve fresh and must not leave a hover.
	let lastPointerType = 'mouse'
	const onMove = (e: PointerEvent): void => {
		cursor.x = ((e.clientX - rect.left) * dom.width) / rect.width
		const yTop = ((e.clientY - rect.top) * dom.height) / rect.height
		// Bottom-left origin on the WebGL2 fallback — flip so the cursor indexes
		// the right row of the pick attachments (see webglFallback above).
		cursor.y = webglFallback ? dom.height - 1 - yTop : yTop
		cursor.inside = true
		lastPointerType = e.pointerType
	}
	const onLeave = (e: PointerEvent): void => {
		// Only treat this as "cursor left the canvas" if the pointer is GEOMETRICALLY
		// outside the canvas. `pointerleave` ALSO fires when the cursor moves onto an
		// element stacked ABOVE the canvas while still within its bounds — e.g. the
		// html-in-canvas polyfill's host overlay, or the slide scene's armed panel — and
		// (crucially) when such an overlay moves UNDER a stationary cursor. Those are
		// spurious leaves: the loop must keep resolving so hover still updates when content
		// moves beneath a still cursor (as it does natively, where the panel is a canvas
		// child and no leave fires). Consumers without an overlay only ever see real leaves
		// (pointer truly outside the rect), so their behaviour is unchanged.
		if (
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom
		) {
			cursor.inside = false
		}
	}
	const onUp = (e: PointerEvent): void => {
		// A touch lifts → the pointer is gone; don't keep a hover alive.
		if (e.pointerType === 'touch') cursor.inside = false
	}
	dom.addEventListener('pointermove', onMove)
	// pointerdown also feeds the cursor: a touch TAP has no preceding move, so
	// without this the tapped point is never registered for the pick.
	dom.addEventListener('pointerdown', onMove)
	dom.addEventListener('pointerup', onUp)
	dom.addEventListener('pointerleave', onLeave)
	window.addEventListener('resize', refreshRect)
	window.addEventListener('scroll', refreshRect, true)

	let hovered: THREE.Object3D | null = null
	let hoveredInstance = 0
	let latest: PickResolved | null = null
	let busy = false

	// Hover identity is the (object, instanceIndex) PAIR, not the object
	// alone — so moving between two instances of one InstancedMesh fires
	// onPointerOut(old instance) → onPointerOver(new instance). The out
	// carries the instance being left, so a handler can tell which it was.
	const setHovered = (obj: THREE.Object3D | null, instanceId: number): void => {
		if (obj === hovered && instanceId === hoveredInstance) return
		if (hovered) dispatchHook(hovered, 'onPointerOut', hoveredInstance)
		hovered = obj
		hoveredInstance = instanceId
		if (obj) dispatchHook(obj, 'onPointerOver', instanceId)
	}

	const tick = (): void => {
		if (!cursor.inside) {
			// Clear hover, but KEEP `latest` warm across release: the real `click`
			// fires just after `pointerup` and reads it synchronously. It's refreshed
			// every frame the cursor is inside and re-resolved on the next gesture, so
			// holding the last resolved hit here is correct (and 1–2 frames stale,
			// which is fine).
			setHovered(null, 0)
			return
		}
		// Single-flight: the readback is async (~1–2 frames), so skip while
		// one is in flight. The next free frame resolves the freshest cursor
		// (onMove keeps cursor.{x,y} current independently of this loop) —
		// which is why a still cursor over a MOVING object still re-resolves.
		if (busy) return
		busy = true
		// WebGL2 fallback forces `mrt` (the `compute` path black-frames there);
		// `mode` still tracks the requested path so WebGPU is unaffected.
		const effectiveMode: PickRead = webglFallback ? 'mrt' : mode
		resolvers[effectiveMode](cursor.x, cursor.y)
			.then((q) => {
				latest = q
				const obj = q ? registry.get(q.objectId) : null
				// Touch has no hover state — keep hover off; the tap fires onClick.
				setHovered(lastPointerType === 'touch' ? null : obj, q?.instanceIndex ?? 0)
				onResolve?.(
					q
						? {
								object: obj,
								objectId: q.objectId,
								instanceIndex: q.instanceIndex,
								point: q.point,
								uv: q.uv,
							}
						: null,
				)
			})
			.catch((e) => console.error('[archipelago] pick resolve failed', e))
			.finally(() => {
				busy = false
			})
	}

	const fireClick = (q: PickResolved): void => {
		latest = q
		const obj = registry.get(q.objectId)
		onClickHit?.({
			object: obj,
			objectId: q.objectId,
			instanceIndex: q.instanceIndex,
			point: q.point,
			uv: q.uv,
		})
		if (obj) dispatchHook(obj, 'onClick', q.instanceIndex)
	}

	// Picker-owned click dispatch. A real `click` fires after pointerdown+pointerup
	// and NOT after a drag, so this is the right gesture to actuate on: it carries
	// transient activation on every device, and `latest` is already warm (hover for
	// mouse, the press's frames for touch — kept across release by `tick`). Reading
	// it is a synchronous variable access, so `onClickHit`/`onClick` run inside the
	// click's activation — gated DOM actions (focus/showPicker/clipboard) work the
	// same touch or mouse, with no per-pointer-type branch and no async readback in
	// the gesture. This replaces the old externally-called `doClick()`.
	//
	// `isTrusted` gate: dispatch ONLY for genuine user clicks. A consumer's
	// actuator may call `el.click()` on DOM inside the canvas subtree (to invoke a
	// picked element's native behaviour); that synthetic click bubbles back to this
	// same listener, but it is `isTrusted: false`, so re-entering dispatch would be
	// a spurious double-fire. Real user clicks are `isTrusted: true`.
	const onClick = (e: MouseEvent): void => {
		if (e.isTrusted && latest) fireClick(latest)
	}
	dom.addEventListener('click', onClick)

	const setReadMode = (next: PickRead): void => {
		if (next === mode) return
		mode = next
		// Drop hover so a stale highlight/handler doesn't survive the switch;
		// the next tick re-resolves under the new reader.
		setHovered(null, 0)
		latest = null
	}

	return {
		tick,
		setReadMode,
		addRoot: registry.addRoot,
		dispose: () => {
			if (hovered) dispatchHook(hovered, 'onPointerOut', hoveredInstance)
			hovered = null
			dom.removeEventListener('click', onClick)
			dom.removeEventListener('pointermove', onMove)
			dom.removeEventListener('pointerdown', onMove)
			dom.removeEventListener('pointerup', onUp)
			dom.removeEventListener('pointerleave', onLeave)
			window.removeEventListener('resize', refreshRect)
			window.removeEventListener('scroll', refreshRect, true)
			store?.getState().setEvents({ enabled: prevEnabled })
			pickCompute.dispose()
			registry.dispose()
		},
	}
}
