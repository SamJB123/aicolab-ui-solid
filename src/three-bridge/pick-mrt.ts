// Pick MRT — the GPU object/instance picker's data plane.
//
// The scene `pass(scene, camera)` writes three extra colour attachments
// alongside its colour output, every frame, for free:
//   slot 1 `pickPos` RGBA32Float — flat world position (.xyz) + hit (.w)
//   slot 2 `pickId`  RGBA32Float — objectId + instanceIndex, full uint32
//                     each, carried losslessly as two 16-bit halves.
//   slot 3 `pickUv`  RGBA16Float — surface UV (.xy) + fwidth(uv) (.zw): the
//                     geometry texture coordinate at the hit AND its screen-space
//                     derivative (per-fragment UV density), for any consumer.
// A 1×1 readback at the cursor (no extra render) tells us exactly what is
// drawn there — so the pick is scene-size-independent and stays correct
// when the scene moves under a stationary cursor.
//
// `setupPickMrt` authors the encode; `readPickAt` is the matching decode.
// Keeping both in this file means the bit layout can't drift between them.
//
// Float (not integer) attachments by necessity: three caches a material's
// fragment output-struct types blind to the MRT per-slot signature, so a
// material that also renders to shadow / depth / heightmap passes bakes a
// float slot and reuses it under a uint framebuffer → pipeline mismatch
// (integer MRT from shadow-casting scene materials is outside three's
// supported path). Float slots dodge it; the two-16-bit-halves split keeps
// the full 32-bit range using only exact, normal floats (0..65535) — no
// denormal/NaN flush hazard a raw `bitcast` u32→f32 would carry.

import {
	bitAnd,
	fwidth,
	instanceIndex,
	mrt,
	output,
	positionWorld,
	shiftRight,
	uint,
	uniform,
	uv,
	vec4,
} from 'three/tsl'
import type { PassNode } from 'three/webgpu'
import * as THREE from 'three/webgpu'

/** Attachment indices in `scenePass.renderTarget.textures`. Slot 0 is the
 *  pass's own colour output; 1/2/3 are the pick attachments (push order). */
export const PICK_SLOT = { pos: 1, id: 2, uv: 3 } as const

/** Attachment names — MRT outputs bind to target textures BY NAME
 *  (MRTNode.setup → getTextureIndex), so any render target meant to
 *  receive this MRT must name its textures accordingly. */
export const PICK_ATTACHMENTS = ['output', 'pickPos', 'pickId', 'pickUv'] as const

let sharedPickMrt: ReturnType<typeof mrt> | null = null

/**
 * The ONE pick MRT node, shared by every render that emits pick data (the
 * main scene pass AND the portal destination renders). Sharing the node
 * instance — not just its shape — means every consumer generates byte-
 * identical shader code, so programs and pipelines are compiled once and
 * reused across all of them. That sharing is what lets a portal render
 * pre-compile the exact shaders the main pass needs (no first-crossing
 * compile hitch) and what makes pick data exist behind portal surfaces.
 */
export function getPickMrt() {
	if (sharedPickMrt === null) {
		// `uniform(uint(0))` makes a uint-typed uniform initialised to 0 (a
		// bare `0` would infer 'float' and lose the 32-bit range above 2^24).
		const pickObjectId = uniform(uint(0)).onObjectUpdate(({ object }) => object?.id ?? 0)
		sharedPickMrt = mrt({
			output,
			pickPos: vec4(positionWorld, 1),
			pickId: vec4(
				bitAnd(pickObjectId, 0xffff),
				shiftRight(pickObjectId, 16),
				bitAnd(instanceIndex, 0xffff),
				shiftRight(instanceIndex, 16),
			),
			// Generic surface UV — the geometry texture coordinate at the hit,
			// for any consumer (DOM hit-testing, decals, HTML supersampling).
			//   .xy = uv
			//   .zw = fwidth(uv) — the screen-space UV derivative (|∂u|+|∂v| per
			//         device pixel), computed by the rasteriser at full fragment
			//         precision. Free here (these two channels were spare), and the
			//         honest way to get per-fragment UV density: anything sizing a
			//         texture / picking a mip / measuring magnification reads it
			//         directly instead of differencing neighbour texels (which loses
			//         all precision in a half-float attachment when zoomed in).
			pickUv: vec4(uv(), fwidth(uv())),
		})
	}
	return sharedPickMrt
}

/** Pin a pick attachment's format: float (for lossless 16-bit-split
 *  values) + NearestFilter (no interpolation of id/position texels).
 *  EVERY target receiving the shared MRT must pin slots 1/2 identically —
 *  pipeline reuse across targets requires exactly matching formats. */
export function pinPickTexture(t: THREE.Texture): void {
	t.type = THREE.FloatType
	t.format = THREE.RGBAFormat
	t.minFilter = THREE.NearestFilter
	t.magFilter = THREE.NearestFilter
	t.generateMipmaps = false
}

/** Pin the UV attachment's format: half-float + NearestFilter (no interpolation
 *  of the per-fragment coordinate). A UV in [0,1] needs no more than half-float's
 *  ~0.0005 precision; `.zw` carries `fwidth(uv)` (a small positive value) which
 *  half-float holds with good RELATIVE precision — fine because it's the
 *  rasteriser's value stored directly, never a difference of two near-equal
 *  half-floats. Like the pick slots, pinned identically on EVERY target that
 *  receives the shared MRT, so pipelines stay reusable across targets. */
export function pinUvTexture(t: THREE.Texture): void {
	t.type = THREE.HalfFloatType
	t.format = THREE.RGBAFormat
	t.minFilter = THREE.NearestFilter
	t.magFilter = THREE.NearestFilter
	t.generateMipmaps = false
}

export interface PickHit {
	/** Flat-sim world position of the picked surface (warp-invariant —
	 *  the `positionWorld` accessor is unwarped; the warp overrides
	 *  `positionView` only). A fresh Vector3 per call. */
	point: THREE.Vector3
	/** three's `Object3D.id` of the drawn surface — resolve straight via
	 *  `scene.getObjectById(objectId)` (GPU/CPU parity, no id→object map). */
	objectId: number
	/** Instance within an InstancedMesh / BatchedMesh (0 for plain meshes),
	 *  mirroring `Raycaster`'s `{ object, instanceId }`. */
	instanceIndex: number
	/** Surface UV at the hit — the geometry texture coordinate (slot 3). A fresh
	 *  Vector2; the pick always carries it. */
	uv: THREE.Vector2
}

/**
 * Author the pick attachments on the scene pass. Call once at setup, right
 * after `pass(scene, camera)` is created (before the first render). Every
 * scene material emits all four slots via the pass-level default;
 * `objectId` is three's per-object `Object3D.id` (re-uploaded per draw via
 * `onObjectUpdate` — the same per-object uniform mechanism `Object3DNode`
 * uses, so it's correct under shared materials).
 *
 * Returns the three pick attachment textures so a compute pass can sample
 * them (`texture(tex).load(ivec2)`) — see `pick-compute.ts` — plus the
 * pass's render target, which the direct CPU reader (`readPickAt`) needs
 * to address the attachments by slot index.
 */
export function setupPickMrt(scenePass: PassNode): {
	pickPosTex: THREE.Texture
	pickIdTex: THREE.Texture
	pickUvTex: THREE.Texture
	renderTarget: THREE.RenderTarget
} {
	scenePass.setMRT(getPickMrt())
	// Materialise the named attachments and pin their formats. `getTexture`
	// clones the colour attachment, so the pinning must follow it.
	const pickPosTex = scenePass.getTexture('pickPos')
	const pickIdTex = scenePass.getTexture('pickId')
	const pickUvTex = scenePass.getTexture('pickUv')
	pinPickTexture(pickPosTex)
	pinPickTexture(pickIdTex)
	pinUvTexture(pickUvTex)
	return { pickPosTex, pickIdTex, pickUvTex, renderTarget: scenePass.renderTarget }
}

const _size = /* @__PURE__ */ new THREE.Vector2()

/**
 * Decode the two pick texels into a `PickHit` (or `null` on a miss). This is
 * the one place the bit layout authored in `setupPickMrt` is read back, so
 * BOTH readers share it and can't drift:
 *   - `pos` — the `pickPos` texel: `xyz` = flat-sim world position, `w` = hit
 *     flag (< 0.5 ⇒ sky / cleared ⇒ miss).
 *   - `id`  — the `pickId` texel: objectId and instanceIndex each carried as
 *     two 16-bit halves (`x`+`y`·65536, `z`+`w`·65536). The halves stay ≤
 *     65535 (exact in float); recombining here on the CPU (float64) restores
 *     the full uint32 range exactly.
 *
 * The `mrt` reader feeds this two 1×1 readbacks; the `compute` reader feeds
 * it the same two texels its kernel copied per cursor (see `pick-compute.ts`).
 */
export function decodePick(
	pos: ArrayLike<number>,
	id: ArrayLike<number>,
	uv: ArrayLike<number>,
): PickHit | null {
	if (pos[3] < 0.5) return null // miss
	return {
		point: new THREE.Vector3(pos[0], pos[1], pos[2]),
		objectId: Math.round(id[0]) + Math.round(id[1]) * 65536,
		instanceIndex: Math.round(id[2]) + Math.round(id[3]) * 65536,
		// `pickUv` texel (slot 3): surface UV in .xy.
		uv: new THREE.Vector2(uv[0], uv[1]),
	}
}

/** Decode one IEEE-754 binary16 value from its raw bits. */
function halfBitsToFloat(bits: number): number {
	const sign = bits & 0x8000 ? -1 : 1
	const exponent = (bits >> 10) & 0x1f
	const mantissa = bits & 0x3ff
	if (exponent === 0) return sign * mantissa * 2 ** -24 // subnormal (±0 included)
	if (exponent === 31) return mantissa ? Number.NaN : sign * Number.POSITIVE_INFINITY
	return sign * (1 + mantissa / 1024) * 2 ** (exponent - 15)
}

/**
 * Normalise an RGBA16F texel readback to real floats. three's webgl-fallback
 * `readRenderTargetPixelsAsync` returns half-float texels as their RAW bits in
 * a `Uint16Array` (`_getTypedArrayType(HALF_FLOAT)` → Uint16Array; `readPixels`
 * packs bits, nothing decodes — WebGLTextureUtils.copyTextureToBuffer), while
 * the WebGPU backend returns float-valued arrays. Consuming the raw bits as
 * numbers yields UVs in the tens of thousands → the uv→DOM mappings explode
 * (megapixel slide transforms, dead panel interaction) — the pos/id slots are
 * RGBA32F and unaffected, which is why hover/click dispatch kept working.
 * Conditioned on the ARRAY TYPE, not the backend, so whichever path hands us
 * raw bits gets decoded. Upstream three patch candidate.
 */
function decodeHalfTexel(texel: ArrayLike<number>): ArrayLike<number> {
	if (!(texel instanceof Uint16Array)) return texel
	return Float32Array.from(texel, halfBitsToFloat)
}

/**
 * Read the pick attachments at drawing-buffer pixel (`px`, `py`), top-left
 * origin (matching pointer events). Async — two 1×1 readbacks; the GPU is
 * not stalled (the result lands 1–2 frames later, which is fine: it's the
 * latest fully-rendered frame). Returns `null` on a miss. Decode is shared
 * with the compute reader via `decodePick`.
 */
export async function readPickAt(
	renderer: THREE.WebGPURenderer,
	rt: THREE.RenderTarget,
	px: number,
	py: number,
): Promise<PickHit | null> {
	renderer.getDrawingBufferSize(_size)
	const cx = Math.min(_size.x - 1, Math.max(0, Math.floor(px)))
	const cy = Math.min(_size.y - 1, Math.max(0, Math.floor(py)))
	const [pos, id, uv] = await Promise.all([
		renderer.readRenderTargetPixelsAsync(rt, cx, cy, 1, 1, PICK_SLOT.pos),
		renderer.readRenderTargetPixelsAsync(rt, cx, cy, 1, 1, PICK_SLOT.id),
		renderer.readRenderTargetPixelsAsync(rt, cx, cy, 1, 1, PICK_SLOT.uv),
	])
	// `pickUv` is the one RGBA16F attachment (pos/id are RGBA32F).
	return decodePick(pos, id, decodeHalfTexel(uv))
}
