// Generated card backgrounds — TSL implementation (the legacy WebGL
// CardBackgroundGenerator's five fragment shaders, ported node-for-node to
// the monorepo's house renderer: WebGPURenderer + TSL, WebGL2 fallback for
// free). ONE shared offscreen renderer draws every background and blits into
// each card's 2D canvas (the legacy mounted a renderer + RAF per card).
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

function getShared(): Promise<SharedRenderer> {
	sharedPromise ??= createShared()
	return sharedPromise
}

async function createShared() {
	const canvas = document.createElement('canvas')
		const renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: true })
		await renderer.init() // WebGPU, or its own WebGL2 fallback
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
	return { renderer, canvas, scene, camera, mesh, materials, time, color1, color2, color3 }
}

interface Target {
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	style: BackgroundStyle
	colors: ColorScheme
	phase: number
}

const targets = new Set<Target>()
let raf = 0
let ticking = false

// ONE render at a time: the uniforms (time/colors) are shared across every
// target, so concurrent renderInto calls — 22 cards baking on enhancement in
// the same flush — would interleave at the awaits and repaint every card with
// the LAST card's scheme (all-ocean charter incident). The queue serialises
// set-uniforms → renderAsync → blit into an atomic unit.
let renderQueue: Promise<void> = Promise.resolve()

function renderInto(s: SharedRenderer, t: Target, timeSeconds: number): Promise<void> {
	const run = renderQueue.then(async () => {
		const material = s.materials.get(t.style)
		if (!material) return
		const w = t.canvas.width
		const h = t.canvas.height
		if (w === 0 || h === 0) return
		if (s.canvas.width !== w || s.canvas.height !== h) s.renderer.setSize(w, h, false)
		s.mesh.material = material
		s.time.value = timeSeconds + t.phase
		s.color1.value.set(t.colors.primary)
		s.color2.value.set(t.colors.secondary)
		s.color3.value.set(t.colors.accent ?? t.colors.secondary)
		// renderAsync: the blit must read THIS frame, not the previous present.
		await s.renderer.renderAsync(s.scene, s.camera)
		t.ctx.drawImage(s.canvas, 0, 0)
	})
	renderQueue = run.catch(() => {})
	return run
}

function tick(): void {
	raf = 0
	if (ticking || targets.size === 0) return
	ticking = true
	void (async () => {
		const s = await getShared()
		const now = performance.now() * 0.001
		for (const t of targets) await renderInto(s, t, now)
	})().finally(() => {
		ticking = false
		if (targets.size > 0 && raf === 0) raf = requestAnimationFrame(tick)
	})
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
	const target: Target = { canvas, ctx, style, colors, phase }
	const s = await getShared()
	targets.add(target)
	await renderInto(s, target, performance.now() * 0.001)
	if (raf === 0) raf = requestAnimationFrame(tick)
	return {
		dispose(): void {
			targets.delete(target)
			if (targets.size === 0 && raf) {
				cancelAnimationFrame(raf)
				raf = 0
			}
		},
	}
}
