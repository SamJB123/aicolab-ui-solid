// Generated card backgrounds — TSL implementation (the legacy WebGL
// CardBackgroundGenerator's five fragment shaders, ported node-for-node to
// the monorepo's house renderer: WebGPURenderer + TSL, WebGL2 fallback for
// free). ONE shared offscreen renderer draws every background and blits into
// each card's 2D canvas (the legacy mounted a renderer + RAF per card).
//
// The shared canvas is sized to the largest target it has met and never
// shrinks; each target is drawn through a viewport and scissor of its own
// size in one corner of the canvas and blitted from there. Resizing the
// renderer per target (the first port did, every frame, for every size on
// the page) reconfigures the canvas context and reallocates its colour and
// depth textures each time — hundreds of allocations a second for nothing
// the eye sees; a viewport is a pass parameter. The picture is the same to
// the pixel: the plane fills the viewport, so uv runs 0..1 across the
// target's own size exactly as it did across a canvas of that size — on
// the condition that the viewport sits at the drawing buffer's origin, so
// the vertices land on the same window coordinates (the noise hash flips
// on an ulp). WebGPU's origin is the top-left; the WebGL fallback's is the
// bottom-left, which three's frame names as y = height − h. No
// antialiasing: a quad that fills the viewport has no edge for it to
// touch, and the pixels are identical with it off (measured, both
// backends, all five styles) — it only costs a multisampled colour
// buffer and a resolve per draw.
//
// A target is drawn only while its canvas is in the viewport, and the loop
// stops when none is — an off-screen animation is work nobody sees. The
// time base is the wall clock, so a card scrolling back in shows the frame
// it would have shown had it never stopped.
//
// The uniforms (time, colours) are shared across every target, so set-
// uniforms → render → blit must be one unit per target: with the first
// port's awaits in between, 22 cards baking in one flush interleaved and
// repainted every card with the LAST card's scheme (the all-ocean charter
// incident). The renderer's render() is synchronous once initialised, so
// the unit is now a plain synchronous sequence and cannot interleave.
//
// Client-only, three-heavy: reach this ONLY through the dynamic import in
// depth-card/backgrounds.ts (the three-free facade owns types + presets).

import {
	abs,
	cos,
	dot,
	float,
	fract,
	Loop,
	mix,
	sin,
	uniform,
	uv,
	vec2,
} from 'three/tsl'
import * as THREE from 'three/webgpu'
import type { BackgroundStyle, CardBackgroundHandle, ColorScheme } from './backgrounds'

// The legacy shaders' hash — inlined as a plain expression-tree helper (no Fn:
// nothing here needs argument inference, and the tree is tiny). The parameter
// type is dot()'s own first-parameter type — inference from the source.
const random = (st: Parameters<typeof dot>[0]) =>
	fract(sin(dot(st, vec2(12.9898, 78.233))).mul(43758.5453123))

type SharedRenderer = Awaited<ReturnType<typeof createShared>>

let sharedPromise: Promise<SharedRenderer> | null = null
/** The shared renderer once it has initialised, for the synchronous loop. */
let shared: SharedRenderer | null = null

function getShared(): Promise<SharedRenderer> {
	sharedPromise ??= createShared().then((s) => {
		shared = s
		return s
	})
	return sharedPromise
}

async function createShared() {
	const canvas = document.createElement('canvas')
		const renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: false })
		await renderer.init() // WebGPU, or its own WebGL2 fallback
		// Every draw is a viewport-and-scissor of the target's size (see header).
		renderer.setScissorTest(true)
		// No clear before a draw: the quad covers the whole viewport and writes
		// every pixel opaque, so what lay beneath cannot show (measured: a frame
		// drawn over the previous one equals a fresh one, both backends, all five
		// styles).
		renderer.autoClear = false
		// Whether the drawing buffer's origin is the bottom-left (WebGL) — the
		// viewport goes there, which three's frame names from the top.
		const originAtBottom = renderer.coordinateSystem === THREE.WebGLCoordinateSystem
		const scene = new THREE.Scene()
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
		camera.position.z = 1
		const time = uniform(0)
		const color1 = uniform(new THREE.Color())
		const color2 = uniform(new THREE.Color())
		const color3 = uniform(new THREE.Color())

		// The five legacy fragment shaders as colorNode trees. `uv()` is the
		// plane's vUv; uniforms are shared and re-pointed per draw.
		const u = uv()
		const build = (style: BackgroundStyle) => {
			switch (style) {
				case 'gradient': {
					const mixture = sin(time.add(u.x.mul(2)).add(u.y.mul(2))).mul(0.5).add(0.5)
					return mix(color1, color2, mixture)
				}
				case 'particles': {
					const particles = float(0).toVar()
					Loop({ start: 0, end: 50 }, ({ i }) => {
						const fi = i.toFloat()
						const position = vec2(
							random(vec2(fi, 0)).add(sin(time.mul(random(vec2(fi, 1)))).mul(0.2)),
							random(vec2(fi, 2)).add(cos(time.mul(random(vec2(fi, 3)))).mul(0.2)),
						)
						const dist = u.sub(position).length()
						particles.addAssign(float(0.003).div(dist))
					})
					return mix(color1, color2, particles)
				}
				case 'waves': {
					const waves = sin(u.x.mul(10).add(time))
						.mul(0.5)
						.add(0.5)
						.mul(sin(u.y.mul(8).add(time.mul(1.5))).mul(0.5).add(0.5))
					return mix(color1, color2, waves)
				}
				case 'noise': {
					return mix(color1, color2, random(u.add(time.mul(0.1))))
				}
				case 'geometric': {
					const pattern = abs(sin(u.x.mul(5).add(time)).add(sin(u.y.mul(5).add(time))))
					const base = mix(color1, color2, pattern)
					return mix(base, color3, sin(time).mul(0.5).add(0.5))
				}
			}
		}
		const materials = new Map<BackgroundStyle, THREE.MeshBasicNodeMaterial>()
	for (const style of ['gradient', 'particles', 'waves', 'noise', 'geometric'] as const) {
		const material = new THREE.MeshBasicNodeMaterial()
		material.colorNode = build(style)
		materials.set(style, material)
	}
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), materials.get('gradient'))
	scene.add(mesh)
	return { renderer, canvas, originAtBottom, scene, camera, mesh, materials, time, color1, color2, color3 }
}

interface Target {
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	style: BackgroundStyle
	colors: ColorScheme
	phase: number
	/** Whether the canvas is in the viewport (the observer keeps it). */
	visible: boolean
}

const targets = new Set<Target>()
const targetOf = new WeakMap<Element, Target>()
let raf = 0

/* One observer for every target: a canvas entering the viewport wakes the
   loop; the loop itself skips the ones outside it. */
let observer: IntersectionObserver | null = null
function observe(target: Target): void {
	observer ??= new IntersectionObserver((entries) => {
		let woke = false
		for (const entry of entries) {
			const t = targetOf.get(entry.target)
			if (!t) continue
			t.visible = entry.isIntersecting
			woke ||= entry.isIntersecting
		}
		if (woke && raf === 0) raf = requestAnimationFrame(tick)
	})
	targetOf.set(target.canvas, target)
	observer.observe(target.canvas)
}

/* Set the uniforms, draw the target through a viewport of its size at the
   drawing buffer's origin, and blit that region into the target — one
   synchronous unit (see header). The shared canvas grows to the largest
   target it meets and is never resized otherwise. */
function draw(s: SharedRenderer, t: Target, timeSeconds: number): void {
	const material = s.materials.get(t.style)
	if (!material) return
	const w = t.canvas.width
	const h = t.canvas.height
	if (w === 0 || h === 0) return
	if (w > s.canvas.width || h > s.canvas.height) {
		s.renderer.setSize(Math.max(w, s.canvas.width), Math.max(h, s.canvas.height), false)
	}
	const y = s.originAtBottom ? s.canvas.height - h : 0
	s.renderer.setViewport(0, y, w, h)
	s.renderer.setScissor(0, y, w, h)
	s.mesh.material = material
	s.time.value = timeSeconds + t.phase
	s.color1.value.set(t.colors.primary)
	s.color2.value.set(t.colors.secondary)
	s.color3.value.set(t.colors.accent ?? t.colors.secondary)
	s.renderer.render(s.scene, s.camera)
	t.ctx.drawImage(s.canvas, 0, y, w, h, 0, 0, w, h)
}

function tick(): void {
	raf = 0
	const s = shared
	if (!s || targets.size === 0) return
	const now = performance.now() * 0.001
	let drawn = false
	for (const t of targets) {
		if (!t.visible) continue
		draw(s, t, now)
		drawn = true
	}
	// Nothing on screen: stop; the observer restarts the loop.
	if (drawn) raf = requestAnimationFrame(tick)
}

/** Mount an animated TSL background into `canvas` (2D). The facade resolves
 *  presets and supplies the per-card phase. */
export async function mountTslCardBackground(
	canvas: HTMLCanvasElement,
	style: BackgroundStyle,
	colors: ColorScheme,
	phase: number,
): Promise<CardBackgroundHandle | null> {
	const ctx = canvas.getContext('2d')
	if (!ctx) return null
	const rect = canvas.getBoundingClientRect()
	canvas.width = Math.max(1, Math.round(rect.width * Math.min(window.devicePixelRatio, 2)))
	canvas.height = Math.max(1, Math.round(rect.height * Math.min(window.devicePixelRatio, 2)))
	const target: Target = { canvas, ctx, style, colors, phase, visible: false }
	const s = await getShared()
	targets.add(target)
	// The first frame regardless of visibility, so the card is never blank
	// when it scrolls in; the observer takes it from here.
	draw(s, target, performance.now() * 0.001)
	observe(target)
	return {
		dispose(): void {
			targets.delete(target)
			observer?.unobserve(canvas)
			targetOf.delete(canvas)
			if (targets.size === 0 && raf) {
				cancelAnimationFrame(raf)
				raf = 0
			}
		},
		setColors(colors: ColorScheme): void {
			target.colors = colors
			if (shared) draw(shared, target, performance.now() * 0.001)
		},
	}
}
