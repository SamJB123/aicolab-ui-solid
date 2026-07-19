// Compute-based GPU pick resolver.
//
// Runs once per frame, AFTER the render writes the pick MRT (pickPos +
// pickId on the scene pass). A single compute dispatch resolves up to
// MAX_QUERIES cursors at once (mouse = query 0; touch/multi-probe = 1..N)
// and writes the per-query results into one storage buffer the CPU reads
// back in a single `getArrayBufferAsync`.
//
// The kernel does NOT decode — it copies the two pick texels at each cursor
// (`texture(tex).load(ivec2)`, texelFetch — exact, no sampler) verbatim into
// the result buffer. The CPU then decodes each query through the SAME
// `decodePick` the direct `mrt` reader uses (see `pick-mrt.ts`), so the id /
// position bit layout is interpreted in exactly one place for both readers.

import {
	Fn,
	instanceIndex,
	instancedArray,
	ivec2,
	texture,
	uint,
} from 'three/tsl'
import * as THREE from 'three/webgpu'
import { decodePick, type PickHit } from './pick-mrt'

/** Max simultaneous cursor queries (mouse = 0; spare slots for touch /
 *  multi-probe). Kept small — one dispatch, one tiny readback. */
export const MAX_QUERIES = 8

export interface PickComputeHandle {
	/** Set query `slot`'s cursor in drawing-buffer pixels (top-left). Slot
	 *  0 is the mouse. */
	setCursor: (slot: number, px: number, py: number) => void
	/** Dispatch the resolve kernel + read results back (async). Resolves with
	 *  one hit (or `null` miss) per query slot, in slot order. Call once per
	 *  frame after the render. */
	resolve: () => Promise<(PickHit | null)[]>
	dispose: () => void
}

export function installPickCompute(args: {
	renderer: THREE.WebGPURenderer
	pickPosTex: THREE.Texture
	pickIdTex: THREE.Texture
	/** The `pickUv` attachment (slot 3) — each query carries the surface UV
	 *  alongside pickPos/pickId. The pick exposes UV unconditionally. */
	pickUvTex: THREE.Texture
}): PickComputeHandle {
	const { renderer, pickPosTex, pickIdTex, pickUvTex } = args
	// vec4s per query: pickPos + pickId + pickUv.
	const vec4PerQuery = 3

	// --- Storage buffers ------------------------------------------------
	// Cursor coords (uvec2 per query), CPU-written each frame.
	const cursorArr = new Uint32Array(MAX_QUERIES * 2)
	const cursors = instancedArray(cursorArr, 'uvec2')
	// Per-query results: the pick texels per query, GPU-written, read back as
	// one Float32Array and decoded on the CPU.
	const resultArr = new Float32Array(MAX_QUERIES * vec4PerQuery * 4)
	const results = instancedArray(resultArr, 'vec4')

	// --- Resolve kernel: one invocation per query -----------------------
	// Pure copy — no decode. Mirrors the 1×1 readbacks the `mrt` reader does,
	// so both feed the identical CPU decoder.
	const kernel = Fn(() => {
		const q = instanceIndex
		const coord = ivec2(cursors.element(q)) // uvec2 pixel coord (top-left)
		const base = q.mul(uint(vec4PerQuery))
		results.element(base).assign(texture(pickPosTex).load(coord))
		results.element(base.add(uint(1))).assign(texture(pickIdTex).load(coord))
		results.element(base.add(uint(2))).assign(texture(pickUvTex).load(coord))
	})().compute(MAX_QUERIES)

	const setCursor = (slot: number, px: number, py: number): void => {
		if (slot < 0 || slot >= MAX_QUERIES) return
		cursorArr[slot * 2] = Math.max(0, Math.floor(px))
		cursorArr[slot * 2 + 1] = Math.max(0, Math.floor(py))
		cursors.value.needsUpdate = true
	}

	const resolve = async (): Promise<(PickHit | null)[]> => {
		renderer.compute(kernel)
		const ab = await renderer.getArrayBufferAsync(results.value)
		const data = new Float32Array(ab)
		const floatsPerQuery = vec4PerQuery * 4
		const out: (PickHit | null)[] = []
		for (let q = 0; q < MAX_QUERIES; q++) {
			const b = q * floatsPerQuery
			// [b..b+4) pickPos, [b+4..b+8) pickId, [b+8..b+12) pickUv.
			out.push(
				decodePick(
					data.subarray(b, b + 4),
					data.subarray(b + 4, b + 8),
					data.subarray(b + 8, b + 12),
				),
			)
		}
		return out
	}

	return {
		setCursor,
		resolve,
		dispose: () => {
			// Storage nodes are GC'd with this closure; nothing renderer-
			// owned to free explicitly here.
		},
	}
}
