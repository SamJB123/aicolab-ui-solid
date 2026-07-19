// Shared substrate for the three html-panel scenes (probe-scene,
// html-texture-scene, curved-slide-scene): the panel's geometry constants,
// the DOM-probing helpers (sub-element / caret resolution), the CPU UV↔world
// mappers, and the shape gallery. Extracted from probe-scene — the two later
// scenes were derived from it and previously carried dangling references to
// these definitions.
//
// Client-only module (creates a measuring <canvas> at module scope) — import
// it the way the scenes themselves are loaded: dynamically, after mount.

import * as THREE from 'three/webgpu'

export const PANEL_PX_W = 560
export const PANEL_PX_H = 720

// Curved panel — a cylinder slice, concave toward the camera. DELIBERATELY
// curved, not flat: a flat panel would let us lean on a single draw matrix /
// `getElementTransform`, which CANNOT describe a curved surface — so the curve
// forces the general, pick-driven path for EVERY interaction, with no flat-only
// shortcut to quietly fall back on.
export const PANEL_R = 2.0
export const PANEL_SLICE = Math.PI / 2.2
export const PANEL_THETA_START = Math.PI - PANEL_SLICE / 2
export const PANEL_ARC = PANEL_R * PANEL_SLICE
export const PANEL_WORLD_H = PANEL_ARC * (PANEL_PX_H / PANEL_PX_W)

// ── Sub-element resolution at a DOM-local point ───────────────────────────────

export interface SubHit {
	el: HTMLElement | null
	via: string
}

/** Cast-free narrowing for the experimental `showPicker()` (absent from the DOM
 *  lib types on `<input>`/`<select>` in this toolchain). */
export function hasShowPicker(v: unknown): v is { showPicker: () => void } {
	if (typeof v !== 'object' || v === null) return false
	if (!('showPicker' in v)) return false
	return typeof v.showPicker === 'function'
}

/** Resolve the sub-element at client (`x`,`y`). Tries native `elementFromPoint`
 *  (logs whether the layoutsubtree child is reachable that way), then a manual
 *  rect walk that ignores `pointer-events` — the reliable path here. */
export function subElementAt(host: HTMLElement, x: number, y: number): SubHit {
	const fromPoint = document.elementFromPoint(x, y)
	if (fromPoint instanceof HTMLElement && host.contains(fromPoint)) {
		return { el: fromPoint, via: 'elementFromPoint' }
	}
	let best: HTMLElement | null = null
	let bestArea = Number.POSITIVE_INFINITY
	const visit = (node: Element): void => {
		if (node instanceof HTMLElement) {
			const r = node.getBoundingClientRect()
			if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
				const area = r.width * r.height
				if (area <= bestArea) {
					best = node
					bestArea = area
				}
			}
		}
		for (const child of node.children) visit(child)
	}
	visit(host)
	return { el: best, via: best ? 'rect-walk' : 'none' }
}

/** Resolve the caret (text node + offset) at client (`x`,`y`) using per-character
 *  Range geometry. `caretPositionFromPoint` does a VISUAL hit-test — "what's
 *  painted here" — which fails for a panel painted INTO the canvas; `getClientRects`
 *  is layout-based and matches our `rect-walk` sub-element resolver. */
export function caretFromPoint(
	root: HTMLElement,
	x: number,
	y: number,
): { node: Text; offset: number } | null {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
	const range = document.createRange()
	for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
		if (!(node instanceof Text)) continue
		for (let i = 0; i < node.length; i++) {
			range.setStart(node, i)
			range.setEnd(node, i + 1)
			const rects = range.getClientRects()
			for (let k = 0; k < rects.length; k++) {
				const r = rects[k]
				if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
					return { node, offset: x < r.left + r.width / 2 ? i : i + 1 }
				}
			}
		}
	}
	return null
}

// ── Point → UV, from the picked object's OWN geometry ─────────────────────────

const _puvLocal = /* @__PURE__ */ new THREE.Vector3()
const _puvA = /* @__PURE__ */ new THREE.Vector3()
const _puvB = /* @__PURE__ */ new THREE.Vector3()
const _puvC = /* @__PURE__ */ new THREE.Vector3()
const _puvBary = /* @__PURE__ */ new THREE.Vector3()
const _puvRecon = /* @__PURE__ */ new THREE.Vector3()
const _puvUvA = /* @__PURE__ */ new THREE.Vector2()
const _puvUvB = /* @__PURE__ */ new THREE.Vector2()
const _puvUvC = /* @__PURE__ */ new THREE.Vector2()

/**
 * The UV of a world-space surface point on `mesh`, read straight off the mesh's
 * OWN geometry (its `position` + `uv` attributes — i.e. exactly how the texture
 * is projected onto it). Geometry-agnostic — cylinder, sphere, sculpted GLTF —
 * no shape-specific math, no raycast, nothing added to the picker.
 *
 * @deprecated Superseded by the picker's `pickUv` MRT attachment, which gives
 * the surface UV per fragment straight from the GPU rasteriser (the pick already
 * carries it — see `PickHit.uv`), so the per-pick triangle search here is no
 * longer needed. KEPT on purpose: this is the only way to recover UV from a
 * world point WITHOUT a live GPU pick (a fragment must exist for the attachment
 * to have it), e.g. an off-screen/occluded point, a CPU-only context, or a tool
 * that has a position but no render. Hard-won; reach for the attachment first.
 */
export function pointToUV(mesh: THREE.Mesh, worldPoint: THREE.Vector3): THREE.Vector2 | null {
	const geom = mesh.geometry
	if (!geom.hasAttribute('position') || !geom.hasAttribute('uv')) return null
	const pos = geom.getAttribute('position')
	const uvAttr = geom.getAttribute('uv')
	mesh.worldToLocal(_puvLocal.copy(worldPoint))
	const index = geom.index
	const triCount = (index ? index.count : pos.count) / 3
	for (let t = 0; t < triCount; t++) {
		const a = index ? index.getX(t * 3) : t * 3
		const b = index ? index.getX(t * 3 + 1) : t * 3 + 1
		const c = index ? index.getX(t * 3 + 2) : t * 3 + 2
		_puvA.fromBufferAttribute(pos, a)
		_puvB.fromBufferAttribute(pos, b)
		_puvC.fromBufferAttribute(pos, c)
		if (THREE.Triangle.getBarycoord(_puvLocal, _puvA, _puvB, _puvC, _puvBary) === null) continue
		if (_puvBary.x < -1e-4 || _puvBary.y < -1e-4 || _puvBary.z < -1e-4) continue
		// getBarycoord projects onto the triangle's plane, so confirm the point is
		// actually ON this triangle (off-plane triangles can give in-range weights).
		_puvRecon
			.set(0, 0, 0)
			.addScaledVector(_puvA, _puvBary.x)
			.addScaledVector(_puvB, _puvBary.y)
			.addScaledVector(_puvC, _puvBary.z)
		if (_puvRecon.distanceToSquared(_puvLocal) > 1e-4) continue
		_puvUvA.set(uvAttr.getX(a), uvAttr.getY(a))
		_puvUvB.set(uvAttr.getX(b), uvAttr.getY(b))
		_puvUvC.set(uvAttr.getX(c), uvAttr.getY(c))
		return new THREE.Vector2()
			.addScaledVector(_puvUvA, _puvBary.x)
			.addScaledVector(_puvUvB, _puvBary.y)
			.addScaledVector(_puvUvC, _puvBary.z)
	}
	return null
}

// ── UV → world (forward), for placing selection handles ──────────────────────

const _u2wUvA = /* @__PURE__ */ new THREE.Vector2()
const _u2wUvB = /* @__PURE__ */ new THREE.Vector2()
const _u2wUvC = /* @__PURE__ */ new THREE.Vector2()
const _u2wPA = /* @__PURE__ */ new THREE.Vector3()
const _u2wPB = /* @__PURE__ */ new THREE.Vector3()
const _u2wPC = /* @__PURE__ */ new THREE.Vector3()
const _u2wBary = /* @__PURE__ */ new THREE.Vector3()

/** Barycentric weights of `p` in the 2D triangle (a,b,c) → `out` (u,v,w for
 *  a,b,c). Returns false for a degenerate triangle. */
function baryUV(
	p: THREE.Vector2,
	a: THREE.Vector2,
	b: THREE.Vector2,
	c: THREE.Vector2,
	out: THREE.Vector3,
): boolean {
	const v0x = b.x - a.x
	const v0y = b.y - a.y
	const v1x = c.x - a.x
	const v1y = c.y - a.y
	const v2x = p.x - a.x
	const v2y = p.y - a.y
	const d00 = v0x * v0x + v0y * v0y
	const d01 = v0x * v1x + v0y * v1y
	const d11 = v1x * v1x + v1y * v1y
	const d20 = v2x * v0x + v2y * v0y
	const d21 = v2x * v1x + v2y * v1y
	const denom = d00 * d11 - d01 * d01
	if (Math.abs(denom) < 1e-12) return false
	const v = (d11 * d20 - d01 * d21) / denom
	const w = (d00 * d21 - d01 * d20) / denom
	out.set(1 - v - w, v, w)
	return true
}

/**
 * World position on `mesh` at texture coordinate `target` — the forward of
 * `pointToUV`: find the triangle whose UV-triangle contains `target`, then
 * interpolate the position attribute with the same weights. Geometry-blind;
 * used to place selection handles (DOM-local endpoint → uv → here → screen).
 */
export function uvToWorld(mesh: THREE.Mesh, target: THREE.Vector2): THREE.Vector3 | null {
	const geom = mesh.geometry
	if (!geom.hasAttribute('position') || !geom.hasAttribute('uv')) return null
	const pos = geom.getAttribute('position')
	const uvAttr = geom.getAttribute('uv')
	const index = geom.index
	const triCount = (index ? index.count : pos.count) / 3
	for (let t = 0; t < triCount; t++) {
		const a = index ? index.getX(t * 3) : t * 3
		const b = index ? index.getX(t * 3 + 1) : t * 3 + 1
		const c = index ? index.getX(t * 3 + 2) : t * 3 + 2
		_u2wUvA.set(uvAttr.getX(a), uvAttr.getY(a))
		_u2wUvB.set(uvAttr.getX(b), uvAttr.getY(b))
		_u2wUvC.set(uvAttr.getX(c), uvAttr.getY(c))
		if (!baryUV(target, _u2wUvA, _u2wUvB, _u2wUvC, _u2wBary)) continue
		if (_u2wBary.x < -1e-4 || _u2wBary.y < -1e-4 || _u2wBary.z < -1e-4) continue
		_u2wPA.fromBufferAttribute(pos, a)
		_u2wPB.fromBufferAttribute(pos, b)
		_u2wPC.fromBufferAttribute(pos, c)
		return mesh.localToWorld(
			new THREE.Vector3()
				.addScaledVector(_u2wPA, _u2wBary.x)
				.addScaledVector(_u2wPB, _u2wBary.y)
				.addScaledVector(_u2wPC, _u2wBary.z),
		)
	}
	return null
}

// ── In-input caret, from a pick point ────────────────────────────────────────

const _measureCanvas = document.createElement('canvas')

/** Shared 2D context for glyph-width measurement (inputCaretOffsetAtX, and the
 *  scenes' own caret placement). Null only if 2D canvas is unavailable. */
export const measureCtx = _measureCanvas.getContext('2d')

/**
 * Character offset in a single-line `<input>` nearest the client x. `caretPosition
 * FromPoint` is a visual hit-test and can't see the canvas-painted element, so we
 * map the point to a caret by measuring the value's glyph widths in the input's
 * own font — the text equivalent of `pointToUV`.
 */
export function inputCaretOffsetAtX(input: HTMLInputElement, clientX: number): number {
	const value = input.value
	if (value.length === 0 || measureCtx === null) return 0
	const style = getComputedStyle(input)
	const rect = input.getBoundingClientRect()
	const padLeft = Number.parseFloat(style.paddingLeft) || 0
	const borderLeft = Number.parseFloat(style.borderLeftWidth) || 0
	const localX = clientX - (rect.left + borderLeft + padLeft) + input.scrollLeft
	measureCtx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
	let bestOffset = 0
	let bestDist = Number.POSITIVE_INFINITY
	for (let i = 0; i <= value.length; i++) {
		const caretX = measureCtx.measureText(value.slice(0, i)).width
		const d = Math.abs(caretX - localX)
		if (d < bestDist) {
			bestDist = d
			bestOffset = i
		}
	}
	return bestOffset
}

// ── Shapes — the SAME DOM panel on 5 different geometries ─────────────────────
// The whole point: switching shapes changes NOTHING in the pick→DOM path. The
// picker's `pickUv` attachment carries each geometry's own uv per fragment, so
// even the CPU-animated wave (whose vertices move every frame) just works.

export interface PanelShape {
	name: string
	build: () => THREE.BufferGeometry
	side: THREE.Side
	repeat: [number, number]
	offset: [number, number]
	animate?: (geom: THREE.BufferGeometry, t: number) => void
}

const PLANE_W = PANEL_ARC
const PLANE_H = PANEL_WORLD_H

function makePlane(segs: number): THREE.PlaneGeometry {
	return new THREE.PlaneGeometry(PLANE_W, PLANE_H, segs, segs)
}

/** Displace a plane's local z by `f(nx, ny)`, nx,ny ∈ [-1,1]. CPU-side; the GPU
 *  rasterises the live displaced surface, so the `pickUv` it writes is current. */
function displacePlane(geom: THREE.BufferGeometry, f: (nx: number, ny: number) => number): void {
	const pos = geom.getAttribute('position')
	for (let i = 0; i < pos.count; i++) {
		pos.setZ(i, f(pos.getX(i) / (PLANE_W / 2), pos.getY(i) / (PLANE_H / 2)))
	}
	pos.needsUpdate = true
}

export const SHAPES: PanelShape[] = [
	{
		name: 'Flat',
		build: () => makePlane(1),
		side: THREE.FrontSide,
		repeat: [1, 1],
		offset: [0, 0],
	},
	{
		name: 'Cylinder',
		build: () =>
			new THREE.CylinderGeometry(
				PANEL_R,
				PANEL_R,
				PANEL_WORLD_H,
				96,
				1,
				true,
				PANEL_THETA_START,
				PANEL_SLICE,
			),
		side: THREE.BackSide,
		repeat: [-1, 1],
		offset: [1, 0],
	},
	{
		name: 'Dome',
		build: () => {
			const g = makePlane(48)
			displacePlane(g, (nx, ny) => -0.6 * (nx * nx + ny * ny))
			return g
		},
		side: THREE.FrontSide,
		repeat: [1, 1],
		offset: [0, 0],
	},
	{
		name: 'Wave',
		build: () => makePlane(56),
		side: THREE.FrontSide,
		repeat: [1, 1],
		offset: [0, 0],
		animate: (geom, t) =>
			displacePlane(
				geom,
				(nx, ny) =>
					Math.sin(nx * Math.PI * 2 + t * 2) * 0.22 + Math.cos(ny * Math.PI * 1.6 + t * 1.3) * 0.16,
			),
	},
	{
		name: 'Knot',
		build: () => new THREE.TorusKnotGeometry(1.05, 0.4, 160, 24),
		side: THREE.FrontSide,
		repeat: [1, 1],
		offset: [0, 0],
	},
]

export const SHAPE_NAMES = SHAPES.map((s) => s.name)
