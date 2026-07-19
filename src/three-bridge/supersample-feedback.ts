// Supersample feedback — the GPU "brain" of dynamic HTML supersampling.
//
// Each measurement is THREE compute dispatches over the scene's pick MRT
// (pickId + pickUv, written by the main render — see pick-mrt.ts), reducing the
// PANEL's visible fragments to the finished capture knobs, then ONE small
// readback. The CPU computes nothing — it reads the numbers the GPU decided and
// plumbs them into `copyElementImageToTexture` + the material's UV remap.
//
//   clear  → reset the atomic accumulators
//   reduce → one thread per drawing-buffer texel; for fragments whose pickId is
//            the panel, atomically accumulate: UV bounds (min/max uv), device-
//            pixel footprint (min/max texel coord), and the per-axis screen-space
//            UV gradient (peak `fwidth`, from interior neighbours, seam-clamped)
//   final  → turn the accumulators into the finished outputs:
//              source sub-rect  sx,sy,swidth,sheight   (element CSS px)
//              dest resolution  width,height           (K · uvSpan / min fwidth)
//              material remap   repeatX,repeatY,offsetX,offsetY (window → [0,1])
//              valid flag
//
// Everything is texSize-FREE: `width = K · (maxU−minU) / min(fwidthU)` — the
// |repeat| cancels, so resolution is computed in geometry-UV space; repeat/offset
// re-enter only to place the source sub-rect in element space. `K` (constant
// texels-per-device-pixel), elementSize, repeat/offset, maxTextureDim, panelId
// are uniforms.

// `floatFrom` re-tags a bare `Node` to the chainable `Node<'float'>` — needed
// because `uintBitsToFloat` is typed as `BitcastNode` (= `Node<unknown>`), which
// `float()` rejects and which carries none of the `.mul/.sub/.div` extensions.
// The cast is contained in kolo's tsl-helpers (the codebase's casting boundary).
import { floatFrom } from '@aicolab/kolo/webgpu/tsl-helpers'
import {
	atomicMax,
	atomicMin,
	atomicStore,
	Fn,
	float,
	floatBitsToUint,
	If,
	instanceIndex,
	int,
	ivec2,
	max,
	min,
	select,
	storage,
	texture,
	uint,
	uintBitsToFloat,
	uniform,
} from 'three/tsl'
import * as THREE from 'three/webgpu'

// Accumulator slots (uint, atomic). min slots init to 0xFFFFFFFF, max/flags to 0.
const ACC = {
	minU: 0,
	maxU: 1,
	minV: 2,
	maxV: 3,
	minX: 4,
	maxX: 5,
	minY: 6,
	maxY: 7,
	minFwU: 8,
	minFwV: 9,
	found: 10,
} as const
const ACC_COUNT = 11
const U32_MAX = 0xffffffff
// Above this UV-change-per-pixel a fragment straddles a UV seam (e.g. the
// cylinder wrap) — its derivative is garbage, so it's excluded from min-fwidth.
const SEAM_FWIDTH = 0.1
// Below this UV-change-per-pixel, fwidth(uv) underflows the half-float normal
// range (min normal ≈ 6e-5) toward 0 — a false "infinitely magnified" reading
// that would spike the peak to the clamp. Exclude it and let that axis fall back
// to the exact device-pixel footprint. Set just inside the normal range; far
// lower than the old neighbour-differencing floor (0.003) because the value is
// now the rasteriser's, stored directly — no cancellation.
const FW_FLOOR = 1e-4
// If the EMITTED resolution drops below this on either axis, the measurement is
// degenerate — the panel is projecting to a sliver (e.g. a curved surface seen
// edge-on as the camera crosses its depth), collapsing one axis toward the clamp
// floor (the width×1 artifact). We test the final w/h rather than an input
// (footprint OR peak can each cause it), mark the frame invalid, and let the CPU
// hold its last-good resolution until a non-degenerate frame returns. A panel this
// small on screen is invisible anyway, so nothing real is rejected.
const MIN_DIM_PX = 8

/** The finished knobs the GPU emits and the CPU applies verbatim. */
export interface SupersampleKnobs {
	/** Source sub-rect of the ELEMENT to capture, in CSS px (the visible window). */
	sx: number
	sy: number
	swidth: number
	sheight: number
	/** Destination resolution in TEXTURE pixels (K · footprint, peak-corrected). */
	width: number
	height: number
	/** Material map repeat/offset that samples the captured window as [0,1]. */
	repeatX: number
	repeatY: number
	offsetX: number
	offsetY: number
}

/** Per-measure observables for the perf-bisection diagnostics: which
 *  resolution path each axis took, the raw min-fwidth feeding the peak
 *  formula (-1 = none recorded → footprint path), and validity/found flags —
 *  captured on EVERY readback, including ones `measure` resolves as null. */
export interface SupersampleTelemetry {
	found: boolean
	valid: boolean
	degenerate: boolean
	minFwU: number
	minFwV: number
	haveFwU: boolean
	haveFwV: boolean
	width: number
	height: number
}

export interface SupersampleFeedbackHandle {
	/** Dispatch the reduction over the latest render + read back the knobs (async,
	 *  1–2 frames late). Resolves `null` when the panel isn't visible this frame. */
	measure: () => Promise<SupersampleKnobs | null>
	/** The most recent readback's telemetry (null before the first). */
	telemetry: () => SupersampleTelemetry | null
	/** Set the reduction's input params (the GPU reads these uniforms; the CPU only
	 *  sets them — no math). `panelId` = the panel mesh's `Object3D.id`; `repeat`/
	 *  `offset` = the element-space transform; `K` = texels per device pixel. */
	setParams: (params: {
		K?: number
		panelId?: number
		elementWidth?: number
		elementHeight?: number
		repeat?: THREE.Vector2
		offset?: THREE.Vector2
		maxTextureDim?: number
	}) => void
	/** Recreate the per-texel reduce dispatch for a new drawing-buffer size. */
	setSize: (width: number, height: number) => void
	dispose: () => void
}

export function installSupersampleFeedback(args: {
	renderer: THREE.WebGPURenderer
	/** Pick attachments from `setupPickMrt` (slot 2 / slot 3). */
	pickIdTex: THREE.Texture
	pickUvTex: THREE.Texture
	/** Initial drawing-buffer size (the reduce dispatch is one thread per texel). */
	width: number
	height: number
}): SupersampleFeedbackHandle {
	const { renderer, pickIdTex, pickUvTex } = args

	// Uniforms the GPU reads; the CPU only SETS them (no math).
	const uK = uniform(1) // texels per device pixel target (scenes override via setParams)
	const uPanelId = uniform(uint(0))
	const uElementW = uniform(1)
	const uElementH = uniform(1)
	const uRepeat = uniform(new THREE.Vector2(1, -1))
	const uOffset = uniform(new THREE.Vector2(0, 1))
	const uMaxTexDim = uniform(8192)
	const uSize = uniform(new THREE.Vector2(args.width, args.height))

	// Atomic accumulators + the readback output (16 floats: 6 knobs + 4 remap +
	// valid + 5 TELEMETRY slots — raw per-axis min-fwidth, per-axis peak-vs-
	// footprint path flags, and the found flag, so the CPU can observe path
	// flapping / floor crossings without guessing).
	// `storage(...).toAtomic()` is the WGSL atomic<u32> array.
	const accAttr = new THREE.StorageBufferAttribute(new Uint32Array(ACC_COUNT), 1)
	const acc = storage(accAttr, 'uint', ACC_COUNT).toAtomic()
	const accRead = storage(accAttr, 'uint', ACC_COUNT).toReadOnly()
	const OUT_COUNT = 16
	const outAttr = new THREE.StorageBufferAttribute(new Float32Array(OUT_COUNT), 1)
	const out = storage(outAttr, 'float', OUT_COUNT)

	// ── clear: reset accumulators ──────────────────────────────────────────
	// `atomicStore` (NOT `.assign`): the buffer is `array<atomic<u32>>`, and a
	// plain assignment to an atomic is a WGSL compile error ("cannot assign 'u32'
	// to 'atomic<u32>'"). Every write to `acc` must go through an atomic op.
	const clearKernel = Fn(() => {
		atomicStore(acc.element(uint(ACC.minU)), uint(U32_MAX))
		atomicStore(acc.element(uint(ACC.maxU)), uint(0))
		atomicStore(acc.element(uint(ACC.minV)), uint(U32_MAX))
		atomicStore(acc.element(uint(ACC.maxV)), uint(0))
		atomicStore(acc.element(uint(ACC.minX)), uint(U32_MAX))
		atomicStore(acc.element(uint(ACC.maxX)), uint(0))
		atomicStore(acc.element(uint(ACC.minY)), uint(U32_MAX))
		atomicStore(acc.element(uint(ACC.maxY)), uint(0))
		atomicStore(acc.element(uint(ACC.minFwU)), uint(U32_MAX))
		atomicStore(acc.element(uint(ACC.minFwV)), uint(U32_MAX))
		atomicStore(acc.element(uint(ACC.found)), uint(0))
	})().compute(1)

	// objectId from a pickId texel: lo + hi·65536 (see pick-mrt.ts encode).
	// TYPE-ONLY deviation from the playground original: the explicit TArgs
	// generic makes the tuple Fn overload resolve on its own merits — TS cannot
	// infer TArgs from a bare destructuring pattern, so without it overload
	// resolution falls back to the (builder) form and the call arity breaks.
	// (The playground compiles the unannotated form only via an accidental
	// type-graph side effect of an unrelated test file.) Runtime-identical.
	const objectIdAt = Fn<[ReturnType<typeof ivec2>], THREE.Node<'uint'>>(([coord]) => {
		const id = texelLoad(pickIdTex, coord)
		return uint(id.x).add(uint(id.y).mul(uint(65536)))
	})

	// ── reduce: one thread per texel; accumulate panel fragments ───────────
	let reduceKernel = buildReduceKernel(args.width, args.height)

	function buildReduceKernel(w: number, h: number) {
		return Fn(() => {
			const idx = instanceIndex
			const width = uint(w)
			const x = idx.mod(width)
			const y = idx.div(width)
			const coord = ivec2(int(x), int(y))

			If(objectIdAt(coord).equal(uPanelId), () => {
				const pix = texelLoad(pickUvTex, coord)
				const uvv = pix.xy
				// `.zw` = fwidth(uv): the rasteriser's screen-space UV derivative,
				// computed at full fragment precision in the main pass (see
				// pick-mrt.ts) — NOT a difference of neighbour texels, so no
				// catastrophic cancellation. This is why we read the attachment
				// directly here instead of fetching the right/down neighbours.
				const fwU = pix.z
				const fwV = pix.w
				atomicStore(acc.element(uint(ACC.found)), uint(1))
				atomicMin(acc.element(uint(ACC.minU)), floatBitsToUint(uvv.x))
				atomicMax(acc.element(uint(ACC.maxU)), floatBitsToUint(uvv.x))
				atomicMin(acc.element(uint(ACC.minV)), floatBitsToUint(uvv.y))
				atomicMax(acc.element(uint(ACC.maxV)), floatBitsToUint(uvv.y))
				atomicMin(acc.element(uint(ACC.minX)), x)
				atomicMax(acc.element(uint(ACC.maxX)), x)
				atomicMin(acc.element(uint(ACC.minY)), y)
				atomicMax(acc.element(uint(ACC.maxY)), y)

				// Peak fwidth, per-axis independently: record the gradient ONLY in the
				// reliable band [FW_FLOOR, SEAM_FWIDTH). SEAM rejects UV-seam fragments
				// (huge derivative at e.g. the cylinder wrap); FW_FLOOR rejects values
				// the half-float attachment would flush toward 0 (a false "infinitely
				// magnified" reading that would spike the peak to the clamp). An axis
				// with no reliable sample falls back to the exact device-pixel footprint
				// in the final kernel — equal to the peak at the handoff, so it's smooth.
				If(fwU.greaterThan(float(FW_FLOOR)).and(fwU.lessThan(float(SEAM_FWIDTH))), () => {
					atomicMin(acc.element(uint(ACC.minFwU)), floatBitsToUint(fwU))
				})
				If(fwV.greaterThan(float(FW_FLOOR)).and(fwV.lessThan(float(SEAM_FWIDTH))), () => {
					atomicMin(acc.element(uint(ACC.minFwV)), floatBitsToUint(fwV))
				})
			})
		})().compute(w * h)
	}

	// ── final: accumulators → finished outputs (texSize-free) ──────────────
	const finalKernel = Fn(() => {
		If(accRead.element(uint(ACC.found)).equal(uint(0)), () => {
			out.element(uint(10)).assign(float(0)) // valid = 0
			out.element(uint(15)).assign(float(0)) // found = 0 (telemetry)
		}).Else(() => {
			// `floatFrom(...)` re-tags each bitcast result to the chainable
			// `Node<'float'>` (uintBitsToFloat → BitcastNode = Node<unknown>, which
			// otherwise carries no `.mul/.sub/.div`). `fpX/fpY` come from an int
			// subtraction that `float()` already accepts, so they stay on `float()`.
			const minU = floatFrom(uintBitsToFloat(accRead.element(uint(ACC.minU))))
			const maxU = floatFrom(uintBitsToFloat(accRead.element(uint(ACC.maxU))))
			const minV = floatFrom(uintBitsToFloat(accRead.element(uint(ACC.minV))))
			const maxV = floatFrom(uintBitsToFloat(accRead.element(uint(ACC.maxV))))
			const fpX = float(accRead.element(uint(ACC.maxX)).sub(accRead.element(uint(ACC.minX))))
			const fpY = float(accRead.element(uint(ACC.maxY)).sub(accRead.element(uint(ACC.minY))))
			const minFwU = floatFrom(uintBitsToFloat(accRead.element(uint(ACC.minFwU))))
			const minFwV = floatFrom(uintBitsToFloat(accRead.element(uint(ACC.minFwV))))

			// Element-space window bounds (geometry UV through repeat/offset; min/max
			// handle a negative repeat by construction).
			const a0x = minU.mul(uRepeat.x).add(uOffset.x)
			const a1x = maxU.mul(uRepeat.x).add(uOffset.x)
			const sLoX = min(a0x, a1x)
			const sHiX = max(a0x, a1x)
			const a0y = minV.mul(uRepeat.y).add(uOffset.y)
			const a1y = maxV.mul(uRepeat.y).add(uOffset.y)
			const sLoY = min(a0y, a1y)
			const sHiY = max(a0y, a1y)

			// Source sub-rect (element CSS px).
			out.element(uint(0)).assign(sLoX.mul(uElementW)) // sx
			out.element(uint(1)).assign(sLoY.mul(uElementH)) // sy
			out.element(uint(2)).assign(sHiX.sub(sLoX).mul(uElementW)) // swidth
			out.element(uint(3)).assign(sHiY.sub(sLoY).mul(uElementH)) // sheight

			// Destination resolution. Peak: width = K · uvSpan / min(fwidth) (the
			// |repeat| cancels). Falls back to K · footprint when no interior fwidth
			// was captured (all-edge / 1px-wide). Clamp to the device max.
			const uSpanU = maxU.sub(minU)
			const uSpanV = maxV.sub(minV)
			const peakW = uSpanU.mul(uK).div(max(minFwU, float(1e-9)))
			const peakH = uSpanV.mul(uK).div(max(minFwV, float(1e-9)))
			// Per-axis fallback: use the peak only where a reliable fwidth was recorded
			// for THAT axis (slot still < U32_MAX); otherwise the exact device-pixel
			// footprint. Independent U/V so one axis dropping below FW_FLOOR doesn't
			// drag the other (this is what fixes the 811×8192 — V falls back, U keeps
			// its peak).
			const haveFwU = accRead.element(uint(ACC.minFwU)).lessThan(uint(U32_MAX))
			const haveFwV = accRead.element(uint(ACC.minFwV)).lessThan(uint(U32_MAX))
			// clamp to [1, maxTextureDim]; `float(...)` makes the select result and the
			// uniform chainable/typed for the min/max factories (types-package gap).
			const w = max(min(float(select(haveFwU, peakW, fpX.mul(uK))), float(uMaxTexDim)), float(1))
			const h = max(min(float(select(haveFwV, peakH, fpY.mul(uK))), float(uMaxTexDim)), float(1))
			out.element(uint(4)).assign(w)
			out.element(uint(5)).assign(h)

			// Material remap: geometry UV → captured window as [0,1].
			//   t = (uv·repeat + offset − sLo) / (sHi − sLo)
			const winX = max(sHiX.sub(sLoX), float(1e-6))
			const winY = max(sHiY.sub(sLoY), float(1e-6))
			out.element(uint(6)).assign(uRepeat.x.div(winX)) // repeatX
			out.element(uint(7)).assign(uRepeat.y.div(winY)) // repeatY
			out.element(uint(8)).assign(uOffset.x.sub(sLoX).div(winX)) // offsetX
			out.element(uint(9)).assign(uOffset.y.sub(sLoY).div(winY)) // offsetY
			// valid = 0 on a degenerate sliver projection — tested on the EMITTED
			// resolution (either axis < MIN_DIM_PX), so it catches the collapse whether
			// it came from the footprint or the peak path. The CPU then skips this frame
			// and holds its last-good resolution; otherwise 1.
			const degenerate = w.lessThan(float(MIN_DIM_PX)).or(h.lessThan(float(MIN_DIM_PX)))
			out.element(uint(10)).assign(select(degenerate, float(0), float(1))) // valid
			// Telemetry: raw min-fwidth per axis (-1 when that axis recorded no
			// reliable fwidth), the per-axis peak-vs-footprint path flags, and found —
			// the direct observables for floor-crossing / path-flap diagnosis.
			out.element(uint(11)).assign(select(haveFwU, minFwU, float(-1)))
			out.element(uint(12)).assign(select(haveFwV, minFwV, float(-1)))
			out.element(uint(13)).assign(select(haveFwU, float(1), float(0)))
			out.element(uint(14)).assign(select(haveFwV, float(1), float(0)))
			out.element(uint(15)).assign(float(1)) // found = 1
		})
	})().compute(1)

	let busy = false
	let lastTelemetry: SupersampleTelemetry | null = null
	const measure = async (): Promise<SupersampleKnobs | null> => {
		if (busy) return null
		busy = true
		try {
			renderer.compute(clearKernel)
			renderer.compute(reduceKernel)
			renderer.compute(finalKernel)
			const ab = await renderer.getArrayBufferAsync(outAttr)
			const d = new Float32Array(ab)
			lastTelemetry = {
				found: d[15] > 0.5,
				valid: d[10] > 0.5,
				degenerate: d[15] > 0.5 && d[10] < 0.5,
				minFwU: d[11],
				minFwV: d[12],
				haveFwU: d[13] > 0.5,
				haveFwV: d[14] > 0.5,
				width: d[4],
				height: d[5],
			}
			if (d[10] < 0.5) return null
			return {
				sx: d[0],
				sy: d[1],
				swidth: d[2],
				sheight: d[3],
				width: d[4],
				height: d[5],
				repeatX: d[6],
				repeatY: d[7],
				offsetX: d[8],
				offsetY: d[9],
			}
		} finally {
			busy = false
		}
	}

	const setParams = (p: {
		K?: number
		panelId?: number
		elementWidth?: number
		elementHeight?: number
		repeat?: THREE.Vector2
		offset?: THREE.Vector2
		maxTextureDim?: number
	}): void => {
		if (p.K !== undefined) uK.value = p.K
		if (p.panelId !== undefined) uPanelId.value = p.panelId
		if (p.elementWidth !== undefined) uElementW.value = p.elementWidth
		if (p.elementHeight !== undefined) uElementH.value = p.elementHeight
		if (p.repeat !== undefined) uRepeat.value.copy(p.repeat)
		if (p.offset !== undefined) uOffset.value.copy(p.offset)
		if (p.maxTextureDim !== undefined) uMaxTexDim.value = p.maxTextureDim
	}

	return {
		measure,
		telemetry: () => lastTelemetry,
		setParams,
		setSize: (w, h) => {
			uSize.value.set(w, h)
			reduceKernel = buildReduceKernel(w, h)
		},
		dispose: () => {
			/* storage nodes GC with this closure */
		},
	}
}

// ── helpers ────────────────────────────────────────────────────────────────

/** texelFetch a pick attachment at an integer coord (no sampler). */
function texelLoad(tex: THREE.Texture, coord: ReturnType<typeof ivec2>) {
	return texture(tex).load(coord)
}
