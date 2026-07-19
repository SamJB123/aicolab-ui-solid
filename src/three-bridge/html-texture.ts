/// <reference types="@webgpu/types" />
// HtmlTexture — a three.js texture backed by a live DOM element via the WICG
// html-in-canvas API. ONE class, TWO capture strategies selected by the
// renderer's ACTUAL backend at construction — expressed the way three itself
// expresses texture strategies: `isXTexture` FLAGS driving the backend's own
// dispatch, not subclass variants.
//
//   - WebGPU (`isExternalTexture` + owned `sourceTexture`): a GPUTexture WE
//     own, captured via `copyElementImageToTexture`. This is the lever stock
//     `THREE.HTMLTexture` doesn't expose: we choose the capture RESOLUTION
//     (the foundation of HTML supersampling) and the re-capture cadence.
//   - WebGL2 (`isHTMLTexture`): stock-semantics capture — three's fallback
//     backend uploads via `gl.texElementImage2D`, which reads a CACHED PAINT
//     RECORD at the element's layout size. No on-demand rasterisation and no
//     owned resolution, so supersampling is deliberately unsupported here
//     (`setResolution` no-ops) — an accepted quality trade for this tier.
//     Unlike stock, the first upload is PAINT-GATED (see `update()`): stock's
//     eager `needsUpdate = true` makes the fallback backend capture before any
//     paint record exists, and the uncaught "No cached paint record" kills the
//     render loop. Requires the native WebGL html-in-canvas API (the polyfill
//     only patches `GPUQueue`); without it the panel stays blank — the
//     SVG-rasterise→CanvasTexture strategy is the designed future fix.
//
// Inspired by reference-material/solid-three-test/src/HtmlTexture.ts, with two
// deliberate differences on the WebGPU strategy (both called out by the
// spec/our setup):
//   1. PROVIDER-AGNOSTIC. The reference issues the single old positional
//      Chromium call and ignores the polyfill. Ours routes the same positional
//      call through `html-in-canvas.ts`: on native its signature adapter
//      normalises that call to whatever the browser accepts (the API has shipped
//      three incompatible shapes); on a browser without the API it installs the
//      polyfill, whose `copyElementImageToTexture` accepts the same positional
//      form. So one `update()` call works everywhere.
//   2. CAST-FREE. `@types/three` exports the real `WebGLBackend` class (so
//      backend narrowing is a plain `instanceof`), `Texture` is generic over
//      its image (`Texture<HTMLElement>`, exactly how stock `HTMLTexture` is
//      typed), and `@webgpu/types` gives the real GPU types; the experimental
//      `copyElementImageToTexture` (not yet in those types) is added by a
//      `declare global` augmentation, optional because it only exists once a
//      provider is installed. The one thing @types/three omits — the WebGPU
//      backend's `device` — is recovered structurally (`isGpuDevice`), not by
//      casting.
//
// PICKER PARITY: both strategies are an ordinary sampled `map` on the mesh
// material. The MRT pick (pickPos/pickId/pickUv) is derived from GEOMETRY,
// never the texture, so a mesh wearing either strategy picks identically.

import type * as THREE from 'three/webgpu'
import { LinearFilter, SRGBColorSpace, Texture, WebGLBackend } from 'three/webgpu'
import { ensureHtmlInCanvasProvider, type HtmlSourceRect } from './html-in-canvas'

declare global {
	interface GPUQueue {
		/** WICG html-in-canvas (experimental — not in `@webgpu/types`). Present
		 *  only after `ensureHtmlInCanvasProvider()` installs the native signature
		 *  adapter or the polyfill; both accept this positional `(element, width,
		 *  height, { texture })` form. The optional 5th `sourceRect` is OUR adapter
		 *  extension (three never passes it) — captured only on the spec shape C
		 *  (`htmlInCanvasSourceRectSupport()`); ignored elsewhere. */
		copyElementImageToTexture?(
			element: HTMLElement,
			width: number,
			height: number,
			destination: { texture: GPUTexture },
			sourceRect?: HtmlSourceRect,
		): void
	}
	interface HTMLCanvasElement {
		/** WICG html-in-canvas: request a `paint` event next frame even if nothing
		 *  changed (like rAF). Present after `ensureHtmlInCanvasProvider()`. */
		requestPaint?(): void
	}
}

function isGpuDevice(v: unknown): v is GPUDevice {
	return typeof v === 'object' && v !== null && 'createTexture' in v && 'queue' in v
}

/** Did `WebGPURenderer` initialise on (or get forced onto) its WebGL2 backend?
 *  Plain `instanceof` on the class three exports by name from `three/webgpu`. */
export function rendererUsesWebGL(renderer: THREE.WebGPURenderer): boolean {
	return renderer.backend instanceof WebGLBackend
}

/**
 * The WebGPU backend's live `GPUDevice` — named so the WebGPU-only contract is
 * on the tin. Backend dispatch happens in the `HtmlTexture` constructor;
 * reaching this throw means a WebGPU-only path was invoked directly on a
 * WebGL2/uninitialised renderer. `@types/three` omits `backend.device` (and
 * stubs `GPUDevice` empty), so the member is recovered with a structural
 * guard against the REAL `@webgpu/types` shape — no cast.
 */
export function requireWebGpuDevice(renderer: THREE.WebGPURenderer): GPUDevice {
	const backend = renderer.backend
	if (backend instanceof WebGLBackend) {
		throw new Error(
			'[html-texture] requireWebGpuDevice reached on the WebGL2 backend — this is a ' +
				'WebGPU-only path; backend dispatch belongs upstream of it (see HtmlTexture).',
		)
	}
	if ('device' in backend) {
		const { device } = backend
		if (isGpuDevice(device)) return device
	}
	throw new Error(
		'[html-texture] renderer.backend.device is not a GPUDevice — the renderer is not initialised.',
	)
}

/**
 * The renderer's maximum 2D texture dimension, backend-agnostic:
 * `device.limits.maxTextureDimension2D` on WebGPU, `MAX_TEXTURE_SIZE` on
 * WebGL2. The pattern for capability reads — callers never need to know which
 * backend they're on.
 */
export function rendererMaxTextureDim(renderer: THREE.WebGPURenderer): number {
	const backend = renderer.backend
	if (backend instanceof WebGLBackend) {
		// @types/three omits `WebGLBackend.gl`; recover it structurally.
		if ('gl' in backend) {
			const { gl } = backend
			if (gl instanceof WebGL2RenderingContext) {
				const size: unknown = gl.getParameter(gl.MAX_TEXTURE_SIZE)
				if (typeof size === 'number') return size
			}
		}
		throw new Error(
			'[html-texture] WebGLBackend.gl is not a WebGL2RenderingContext — the renderer is not initialised.',
		)
	}
	return requireWebGpuDevice(renderer).limits.maxTextureDimension2D
}

/** Structural narrowing for the backend's `destroyTexture` (clears three's
 *  binding/metadata for a texture, WITHOUT destroying an EXTERNAL GPU texture —
 *  WebGPUTextureUtils.js:459). This is what lets us re-point the owned GPU
 *  texture without the "Texture already initialized" throw. */
function hasDestroyTexture(v: unknown): v is { destroyTexture: (t: Texture) => void } {
	if (typeof v !== 'object' || v === null) return false
	if (!('destroyTexture' in v)) return false
	return typeof v.destroyTexture === 'function'
}

const TEXTURE_USAGE =
	GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT

// Both capture paths write Y=0 at the top (DOM convention) but geometry UVs are
// authored V=0-at-bottom (OpenGL) — and `flipY` is ignored for an external
// texture, so BOTH strategies flip V via the texture matrix instead
// (`flipY = false` on the WebGL strategy keeps the conventions identical).
// A consumer may overwrite with its own shape transform.
const FLIP_V_REPEAT = -1
const FLIP_V_OFFSET = 1

export class HtmlTexture extends Texture<HTMLElement> {
	readonly element: HTMLElement
	/** WebGPU strategy flag — routes three's binding to {@link sourceTexture}. */
	readonly isExternalTexture: boolean
	/** The owned GPU capture target (WebGPU strategy; null on WebGL2). Three's
	 *  external-texture path binds this directly (WebGPUTextureUtils.js:318). */
	sourceTexture: GPUTexture | null
	/** WebGL2 strategy flag — routes three's fallback upload into
	 *  `gl.texElementImage2D` (and common/Textures.js's canvas orchestration). */
	readonly isHTMLTexture: boolean

	readonly #renderer: THREE.WebGPURenderer
	readonly #device: GPUDevice | null
	#gpuTexture: GPUTexture | null
	#width: number
	#height: number

	/**
	 * @param element   DOM element to capture — must be a child of a
	 *   `<canvas layoutsubtree>` (the route wires that; the polyfill relocates it
	 *   to its host transparently).
	 * @param renderer  The renderer — its ACTUAL backend picks the strategy.
	 * @param width     Initial capture width in TEXTURE pixels (NOT CSS px).
	 *   WebGPU strategy only — the WebGL2 strategy captures at paint-record
	 *   (layout) resolution.
	 * @param height    Initial capture height in texture pixels (WebGPU only).
	 *
	 * On WebGPU the capture resolution is fully dynamic and uncapped:
	 * `setResolution` RE-POINTS the GPU texture to a fresh one sized exactly to
	 * need, which costs a GPU realloc + a bind-group rebuild only — NO
	 * shader/pipeline recompile (verified against three r184).
	 * `ensureHtmlInCanvasProvider()` runs here defensively so `update()` has a
	 * `copyElementImageToTexture`.
	 */
	constructor(element: HTMLElement, renderer: THREE.WebGPURenderer, width: number, height: number) {
		ensureHtmlInCanvasProvider()
		super(element)
		this.element = element
		this.#renderer = renderer
		// sRGB element bytes stored raw in a linear format → let the shader decode,
		// matching stock HTMLTexture's `colorSpace = SRGBColorSpace`.
		this.colorSpace = SRGBColorSpace
		this.generateMipmaps = false
		this.minFilter = LinearFilter
		this.flipY = false
		this.repeat.y = FLIP_V_REPEAT
		this.offset.y = FLIP_V_OFFSET
		if (rendererUsesWebGL(renderer)) {
			this.isHTMLTexture = true
			this.isExternalTexture = false
			this.sourceTexture = null
			this.#device = null
			this.#gpuTexture = null
			this.#width = 0
			this.#height = 0
		} else {
			const device = requireWebGpuDevice(renderer)
			const gpuTexture = device.createTexture({
				label: `HtmlTexture(${element.id || 'anonymous'})`,
				size: [width, height],
				format: 'bgra8unorm',
				usage: TEXTURE_USAGE,
			})
			this.isHTMLTexture = false
			this.isExternalTexture = true
			this.sourceTexture = gpuTexture
			this.#device = device
			this.#gpuTexture = gpuTexture
			this.#width = width
			this.#height = height
		}
	}

	/** Current capture width in texture pixels (paint-record/layout width on
	 *  the WebGL2 strategy). */
	get resolutionWidth(): number {
		return this.#gpuTexture ? this.#width : this.element.offsetWidth
	}
	/** Current capture height in texture pixels. */
	get resolutionHeight(): number {
		return this.#gpuTexture ? this.#height : this.element.offsetHeight
	}

	/**
	 * WebGPU strategy: set the capture resolution by RE-POINTING the GPU texture
	 * to a fresh one of exactly `w×h` — sized to need, no cap. Costs a GPU
	 * realloc + a bind-group rebuild; NO shader/pipeline recompile. No-op if
	 * unchanged. The next `update()` rasterises the element into it.
	 *
	 * `destroyTexture` is the key step: it clears three's stale binding/metadata
	 * so `needsUpdate` re-inits cleanly instead of throwing "Texture already
	 * initialized"; the external-texture guard keeps the old GPU texture alive,
	 * so WE free it.
	 *
	 * WebGL2 strategy: no-op — capture is fixed at paint-record (layout)
	 * resolution; supersampling is WebGPU-only by design.
	 */
	setResolution(w: number, h: number): void {
		if (this.#device === null || this.#gpuTexture === null) return
		const width = Math.max(1, Math.round(w))
		const height = Math.max(1, Math.round(h))
		if (width === this.#width && height === this.#height) return
		const backend: unknown = this.#renderer.backend
		if (!hasDestroyTexture(backend)) {
			throw new Error(
				'[html-texture] renderer.backend.destroyTexture is unavailable — cannot ' +
					're-point the capture texture (renderer may not be initialised).',
			)
		}
		const old = this.#gpuTexture
		backend.destroyTexture(this)
		old.destroy()
		const next = this.#device.createTexture({
			label: `HtmlTexture(${this.element.id || 'anonymous'})`,
			size: [width, height],
			format: 'bgra8unorm',
			usage: TEXTURE_USAGE,
		})
		this.#gpuTexture = next
		this.sourceTexture = next
		this.#width = width
		this.#height = height
		this.needsUpdate = true // bind-group rebuild only
	}

	/**
	 * Capture the element's current rendered snapshot. Call on the canvas
	 * `paint` event (or after a `requestPaint()` cycle) — on BOTH strategies:
	 * the WebGPU copy wants a settled layout, and the WebGL2 upload NEEDS a
	 * cached paint record (calling earlier is the stock first-frame crash this
	 * class exists to avoid).
	 *
	 * WebGPU: copies into the owned GPU texture at the current resolution.
	 * `sourceRect` (optional) captures only that CSS-px window of the element —
	 * the supersampler's "rasterise just the visible region at high density"
	 * path. Honoured ONLY where `htmlInCanvasSourceRectSupport()` is `true`
	 * (spec shape C); on every other provider the FULL element is captured, so
	 * the caller must pair an unsupported provider with the full-element
	 * material transform, never the window remap.
	 *
	 * WebGL2: arms `needsUpdate` so three's fallback backend re-uploads via
	 * `texElementImage2D` on the next render. `sourceRect` is ignored —
	 * sub-rect capture does not exist on the WebGL API shape.
	 */
	update(sourceRect?: HtmlSourceRect): void {
		if (this.#device === null || this.#gpuTexture === null) {
			this.needsUpdate = true
			return
		}
		const copy = this.#device.queue.copyElementImageToTexture
		if (!copy) {
			throw new Error(
				'[html-texture] device.queue.copyElementImageToTexture is unavailable — ' +
					'ensureHtmlInCanvasProvider() must run (and the page needs the native ' +
					'html-in-canvas API or the polyfill) before HtmlTexture.update().',
			)
		}
		// Pass the 5th `sourceRect` arg ONLY when present: the polyfill checks
		// arguments.length strictly (accepts 2 or 4) and rejects 5, even if the 5th
		// is `undefined`. A sub-rect only exists on native shape C anyway
		// (htmlInCanvasSourceRectSupport()); everywhere else we capture the full
		// element with the 4-arg form the polyfill and native both accept.
		if (sourceRect) {
			copy.call(
				this.#device.queue,
				this.element,
				this.#width,
				this.#height,
				{ texture: this.#gpuTexture },
				sourceRect,
			)
		} else {
			copy.call(this.#device.queue, this.element, this.#width, this.#height, {
				texture: this.#gpuTexture,
			})
		}
	}

	dispose(): void {
		this.#gpuTexture?.destroy()
		super.dispose()
	}
}
