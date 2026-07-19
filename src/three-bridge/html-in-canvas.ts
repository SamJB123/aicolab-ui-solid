/// <reference types="@webgpu/types" />
// WICG html-in-canvas provider — shared by every three face that renders a live
// DOM element into a texture (the insight-note panel, the html-panel probe, …).
//
// Installs ONE of two providers, decided once at first use:
//   - native present  → a signature adapter on `GPUQueue.prototype` (below),
//   - native absent   → the `three-html-render` polyfill.
//
// ── Why the adapter ──────────────────────────────────────────────────────────
// The WICG `GPUQueue.copyElementImageToTexture` has shipped THREE incompatible
// shapes across Chrome versions, and three (even the patched HEAD that adds the
// arity branch) can only distinguish two of them — because two share an arity:
//   A. Chrome 138-149:   (element, width, height, { texture })            [.length 4]
//   B. intermediate:     (element, { destination, width, height })        [.length 2]
//   C. Chrome 150+/spec:  ({ source: element }, { destination, w, h })    [.length 2]
// three assumes C for every 2-arg method, so B throws — "The provided value is
// not of type '(Element or ElementImage)'" — and the canvas goes black. Arity
// cannot separate B from C; the only reliable discriminator is which shape the
// browser's WebIDL binding ACCEPTS. A wrong shape is rejected synchronously with
// a TypeError BEFORE any GPU work is queued, so we probe the live method once
// (newest-first), cache the winner, and dispatch every later call to it.
//
// Installed on `GPUQueue.prototype` (mirroring how the polyfill patches the same
// method) and ONLY on the native path — the polyfill brings its own. Our wrapper
// takes a rest param, so `.length === 0`: three's own arity branch always lands
// on its positional `(element, width, height, { texture })` call into us, which
// we then normalise and re-dispatch — making three's heuristic moot here.

import { installHtmlInCanvasPolyfill } from 'three-html-render/polyfill'

/** Sub-rect of the source ELEMENT to capture, in CSS px (WICG
 *  `GPUCopyElementImageSource`). ONLY the spec shape (Chrome 150+, our shape C)
 *  carries it; the intermediate/legacy native shapes and the polyfill capture
 *  the whole element and ignore this — see `htmlInCanvasSourceRectSupport`. */
export interface HtmlSourceRect {
	sx: number
	sy: number
	swidth: number
	sheight: number
}

function isHtmlSourceRect(v: unknown): v is HtmlSourceRect {
	if (typeof v !== 'object' || v === null) return false
	return (
		'sx' in v &&
		'sy' in v &&
		'swidth' in v &&
		'sheight' in v &&
		typeof v.sx === 'number' &&
		typeof v.sy === 'number' &&
		typeof v.swidth === 'number' &&
		typeof v.sheight === 'number'
	)
}

/** three's normalised call into the adapter → one concrete native call shape.
 *  `sourceRect` is honoured ONLY by shape C (spec); A/B ignore it (full element). */
type CopyElementShape = (
	queue: unknown,
	image: Element,
	width: number,
	height: number,
	textureInfo: object,
	sourceRect: HtmlSourceRect | undefined,
) => void

type NativeCopyElement = (this: unknown, ...args: unknown[]) => void

interface CopyElementCarrier {
	copyElementImageToTexture: NativeCopyElement
}

function hasCopyElement(v: unknown): v is CopyElementCarrier {
	if (typeof v !== 'object' || v === null) return false
	if (!('copyElementImageToTexture' in v)) return false
	return typeof v.copyElementImageToTexture === 'function'
}

/** `GPUQueue.prototype` as an unknown, or null where the type isn't present. */
function gpuQueuePrototype(): unknown {
	if (!('GPUQueue' in globalThis)) return null
	const ctor: unknown = globalThis.GPUQueue
	if (typeof ctor !== 'function' || !('prototype' in ctor)) return null
	return ctor.prototype
}

let copyElementAdapterInstalled = false

function installNativeCopyElementAdapter(): void {
	if (copyElementAdapterInstalled) return
	const proto = gpuQueuePrototype()
	if (!hasCopyElement(proto)) return
	copyElementAdapterInstalled = true

	const original = proto.copyElementImageToTexture
	// Newest-first; each invokes the real native method in exactly one shape.
	// Shape C (index 0) is the ONLY one that carries the source sub-rect.
	const shapes: CopyElementShape[] = [
		// C — Chrome 150+/spec: GPUCopyElementImageSource dict (+ optional sub-rect)
		// + destination dict.
		(queue, image, width, height, textureInfo, rect) =>
			original.call(
				queue,
				rect
					? { source: image, sx: rect.sx, sy: rect.sy, swidth: rect.swidth, sheight: rect.sheight }
					: { source: image },
				{ destination: textureInfo, width, height },
			),
		// B — intermediate: bare (Element|ElementImage) + destination dict. No sub-rect.
		(queue, image, width, height, textureInfo) =>
			original.call(queue, image, { destination: textureInfo, width, height }),
		// A — Chrome 138-149: positional element/width/height + GPUImageCopyTextureTagged.
		(queue, image, width, height, textureInfo) =>
			original.call(queue, image, width, height, textureInfo),
	]
	let chosen: CopyElementShape | null = null

	proto.copyElementImageToTexture = function (this: unknown, ...args: unknown[]): void {
		const [image, width, height, textureInfo, sourceRect] = args
		if (
			!(image instanceof Element) ||
			typeof width !== 'number' ||
			typeof height !== 'number' ||
			typeof textureInfo !== 'object' ||
			textureInfo === null
		) {
			throw new TypeError(
				"[html-in-canvas] copyElementImageToTexture adapter expected three's " +
					`(element, width, height, { texture }) call; got ${args.length} arg(s) of ` +
					`type [${args.map((a) => typeof a).join(', ')}]`,
			)
		}
		// Optional 5th arg (OUR extension — three never passes it): the source
		// sub-rect. Honoured only if shape C wins; otherwise the whole element is
		// captured (the caller gates on `htmlInCanvasSourceRectSupport`).
		const rect = isHtmlSourceRect(sourceRect) ? sourceRect : undefined
		if (chosen !== null) {
			chosen(this, image, width, height, textureInfo, rect)
			return
		}
		let lastError: unknown
		for (const shape of shapes) {
			try {
				shape(this, image, width, height, textureInfo, rect)
				chosen = shape
				// Shape C (index 0) is the spec form that accepts a source sub-rect;
				// its acceptance means sub-rect capture is available on this browser.
				sourceRectSupport = shape === shapes[0]
				return
			} catch (error) {
				// A wrong shape is a synchronous WebIDL TypeError before any GPU work
				// — swallow and try the next. Anything else is a real failure.
				if (error instanceof TypeError) {
					lastError = error
					continue
				}
				throw error
			}
		}
		throw new TypeError(
			'[html-in-canvas] no known native copyElementImageToTexture signature was ' +
				'accepted by this browser (tried Chrome 150+ source-dict, intermediate ' +
				`bare-element, and legacy positional forms). Last rejection: ${String(lastError)}`,
		)
	}
}

/** Captured once, before the first install, so a prior polyfill `requestPaint` can't mask it. */
let hasNativeHtmlInCanvas: boolean | null = null

// Whether the active provider can capture a source SUB-RECT of the element
// (`HtmlSourceRect`). `null` = not yet known: on native it resolves once the
// signature adapter probes the first capture (shape C ⇒ true, shape A/B ⇒
// false); the polyfill sets it `false` eagerly (it always rasterises the whole
// element). Callers that want sub-rect capture must check this and fall back to
// full-element capture when it's not `true`.
let sourceRectSupport: boolean | null = null

declare global {
	interface WebGL2RenderingContext {
		/** WICG html-in-canvas, WebGL flavour (not in lib.dom). Present on the
		 *  prototype once the browser ships it natively or the polyfill installs. */
		texElementImage2D?(...args: unknown[]): void
	}
}

let polyfillTexElementAdapterInstalled = false

// Scratch canvas for fitting the polyfill's DPR-scaled snapshot into three's
// element-sized storage (lazy, reused across captures).
let fitCanvas: HTMLCanvasElement | null = null

/** Scale a snapshot canvas to exactly `width`×`height` when it isn't already
 *  (the polyfill rasterises at CSS × devicePixelRatio — its rasteriser's
 *  `pixelRatio` field — while three allocates at the element's CSS box, so on
 *  DPR>1 an unfitted upload overflows the storage). Downsampling a 2× snapshot
 *  is a quality WIN — supersampled capture, clean minification. Non-canvas
 *  sources pass through untouched (the polyfill only ever uploads canvases). */
function fitToSize(source: TexImageSource, width: number, height: number): TexImageSource {
	const isCanvas =
		source instanceof HTMLCanvasElement ||
		(typeof OffscreenCanvas !== 'undefined' && source instanceof OffscreenCanvas)
	if (!isCanvas) return source
	if (source.width === width && source.height === height) return source
	fitCanvas ??= document.createElement('canvas')
	fitCanvas.width = width
	fitCanvas.height = height
	const ctx = fitCanvas.getContext('2d')
	if (!ctx) return source
	ctx.clearRect(0, 0, width, height)
	// Match the polyfill's own WebGPU resize path (copyElementImageToTexture →
	// getResizeScratchCanvas), which sets high-quality smoothing for the
	// snapshot downsample.
	ctx.imageSmoothingEnabled = true
	ctx.imageSmoothingQuality = 'high'
	ctx.drawImage(source, 0, 0, width, height)
	return fitCanvas
}

/** The 6-arg TexImageSource overload the polyfill's upload uses, redirected to
 *  an IN-PLACE `texSubImage2D` fitted to the allocated size — see
 *  installPolyfillTexElementAdapter. */
function makeTexSubImageShadow(width: number, height: number) {
	return function texSubImageShadow(
		this: WebGL2RenderingContext,
		target: number,
		level: number,
		_internalformat: number,
		format: number,
		type: number,
		source: TexImageSource,
	): void {
		this.texSubImage2D(
			target,
			level,
			0,
			0,
			format,
			type,
			width > 0 ? fitToSize(source, width, height) : source,
		)
	}
}

/**
 * WebGL twin of the GPUQueue signature adapter above — the polyfill's
 * `texElementImage2D` needs TWO shims to serve three's webgl-fallback backend:
 *
 *   1. ARITY. The polyfill implements only the LEGACY positional shapes —
 *      `(target, level, internalformat, format, type, element)` and the
 *      cropped/resized extensions — but its `(e, t, o, ...rest)` signature
 *      reports `.length === 3`, which three's fallback probes as "the Chrome
 *      150+ THREE-arg shape is supported" and issues
 *      `(target, internalformat, element)` → the polyfill throws "unexpected
 *      argument count 3" and the panel never uploads. This wrapper accepts
 *      both shapes and normalises the 3-arg spec form to the legacy call.
 *      (The wrapper's own `.length` is 0, so three's probe now lands on its
 *      legacy 6-arg branch anyway — both routes end at the same place.)
 *
 *   2. IMMUTABLE STORAGE. The polyfill uploads its element snapshot via
 *      `this.texImage2D(...)` — a full respecification — but three's fallback
 *      allocates texture storage with `texStorage2D`, which is IMMUTABLE:
 *      the respec raises GL_INVALID_OPERATION and, unlike the native ANGLE
 *      path, nothing falls back to a sub-image copy → black panel. While the
 *      delegated call runs, `texImage2D` is shadowed (own-property, restored
 *      in `finally`) with an in-place `texSubImage2D` — the correct WebGL2
 *      upload into immutable storage. Sizes match by construction: the
 *      polyfill rasterises the element at its CSS box, exactly what three
 *      allocated from `getSize` → `offsetWidth`.
 */
function installPolyfillTexElementAdapter(): void {
	if (polyfillTexElementAdapterInstalled) return
	if (typeof WebGL2RenderingContext === 'undefined') return
	const proto = WebGL2RenderingContext.prototype
	const original = proto.texElementImage2D
	if (typeof original !== 'function') return
	polyfillTexElementAdapterInstalled = true

	proto.texElementImage2D = function (this: WebGL2RenderingContext, ...args: unknown[]): void {
		// The element is the LAST argument in every accepted shape (3-arg spec
		// form and all the polyfill's legacy/extended positional forms). Its CSS
		// box is what three allocated the storage from (getSize → offsetWidth),
		// so that's the size the shadow must fit the snapshot to.
		const element = args[args.length - 1]
		const destW = element instanceof HTMLElement ? Math.max(1, element.offsetWidth) : 0
		const destH = element instanceof HTMLElement ? Math.max(1, element.offsetHeight) : 0
		Reflect.defineProperty(this, 'texImage2D', {
			value: makeTexSubImageShadow(destW, destH),
			configurable: true,
			writable: true,
		})
		try {
			if (args.length === 3) {
				// Chrome 150+/spec shape → the polyfill's legacy positional form.
				const [target, internalformat, element] = args
				original.call(this, target, 0, internalformat, this.RGBA, this.UNSIGNED_BYTE, element)
			} else {
				original.apply(this, args)
			}
		} finally {
			// Drop the own property so lookups fall through to the prototype again.
			Reflect.deleteProperty(this, 'texImage2D')
		}
	}
}

/**
 * The polyfill mounts a host element (`data-html-in-canvas-host`) overlaying the
 * canvas for an event-FORWARDING model we don't use, and forces inline
 * `pointer-events:auto` on the host and each element it adopts — so it would
 * intercept the page's pointer events. The playground provider fought that with
 * a blanket `pointer-events:none!important` stylesheet (plus a `data-slide-panel`
 * exemption marker); we deliberately DON'T: `!important` beat the polyfill's
 * inline styles at the cost of an arms race the interactive panels then had to
 * opt out of. Instead the depth layer OWNS pointer-events — it re-asserts the
 * host's and every face's desired value write-on-diff in its frame loop, which
 * self-heals whatever the polyfill forces, with no specificity games. This
 * selector is the layer's handle on the host.
 */
export const POLYFILL_HOST_SELECTOR = '[data-html-in-canvas-host]'

/** Ensure an html-in-canvas provider: the native API (+ signature adapter) or the polyfill. */
export function ensureHtmlInCanvasProvider(): void {
	if (hasNativeHtmlInCanvas === null) {
		hasNativeHtmlInCanvas = 'requestPaint' in HTMLCanvasElement.prototype
	}
	if (hasNativeHtmlInCanvas) {
		installNativeCopyElementAdapter()
	} else {
		installHtmlInCanvasPolyfill()
		// WebGL flavour: bridge the polyfill's legacy-only texElementImage2D to
		// three's fallback backend (arity + immutable-storage shims).
		installPolyfillTexElementAdapter()
		// The polyfill's copyElementImageToTexture takes only (element, dest) /
		// (element, w, h, dest) and rasterises the WHOLE element snapshot — no
		// sub-rect. Resolve the capability immediately for this path.
		sourceRectSupport = false
	}
}

/** Whether the browser exposes the native WICG html-in-canvas API (captured at
 *  first `ensureHtmlInCanvasProvider`). `null` before the first call. */
export function nativeHtmlInCanvasActive(): boolean | null {
	return hasNativeHtmlInCanvas
}

/**
 * Whether the active provider can capture a source SUB-RECT of the element
 * (`HtmlSourceRect`), needed for the supersampler's "capture only the visible
 * window" path. `true`/`false` once known, `null` until the native adapter has
 * dispatched its first capture (the polyfill resolves to `false` at install).
 * A `false`/`null` provider captures the full element — the caller must then use
 * the element-space material transform, not the GPU's window remap.
 */
export function htmlInCanvasSourceRectSupport(): boolean | null {
	return sourceRectSupport
}
