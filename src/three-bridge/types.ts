// Shared types for the archipelago scene.
//
// The app shell (`ArchipelagoApp`) and the engine (`three/archipelago`)
// read these; the side panels and the frame-loop helpers also import from
// here.

/** Plain mutable ref box — the framework-free shape of React's RefObject.
 *  The engine creates these; the frame-loop helpers read/write `.current`. */
export interface Ref<T> {
	current: T
}

export type View = 'flat' | 'globe'
export type AnchorMode = 'avatar' | 'fly'

/** Which light type the SHADOW PROBE uses — swappable live to empirically
 *  test warp behaviour (illumination + shadow) per light type. */
export type ProbeLight = 'point' | 'spot' | 'directional' | 'rectarea'

/** Which ocean implementation to drive. */
/** Which GPU-pick READ path resolves the cursor. Both share the same MRT
 *  write side (`setupPickMrt`); they differ only in how the texel is read
 *  back. `compute` = a compute kernel samples the MRT, decodes + enriches,
 *  writes a storage buffer the CPU reads once. `mrt` = the CPU reads the
 *  cursor texel(s) off the MRT directly (`readPickAt`). Hot-switchable so
 *  the two can be A/B'd for runtime cost — only the SELECTED one runs each
 *  frame, so measured FPS reflects that path alone. */
export type PickRead = 'mrt' | 'compute'

/** HUD value DOM nodes. The frame loop writes `.textContent` directly —
 *  the R3F best practice (and this repo's `mountStatsPanel` idiom): per-
 *  frame UI is imperative DOM, never React state. setState in/around the
 *  loop re-renders the tree every frame. */
export interface HudEls {
	x: HTMLSpanElement | null
	z: HTMLSpanElement | null
	frac: HTMLSpanElement | null
	region: HTMLSpanElement | null
	/** Active GPU-pick read path label (mirrors `cmd.pickRead`), so perf
	 *  captures next to the Stats panel are self-labelling. */
	pickRead: HTMLSpanElement | null
}

/** Shared mutable command channel: the React shell writes intents; the
 *  in-Canvas loop reads them each frame. Avoids re-rendering the Canvas. */
export interface SceneCmd {
	view: View
	anchorMode: AnchorMode
	teleport: { x: number; z: number } | null
	/** 0 = flat plane, 1 = full sphere. The flat/globe seg snaps this to
	 *  0/1; the slider sets it continuously. */
	warp: number
	/** Sphere radius in flat units (the prototype's world-size control). */
	radius: number
	/** Uniform scale applied to every island. */
	islandScale: number
	/** Footprint radius (m) of the imported glTF demo island. */
	demoIsleRadius: number
	/** Shadow-probe diagnostic: when false, the sun AND the ambient fill
	 *  are switched off so the lantern's point light is the ONLY light —
	 *  proves a lantern shadow isn't just being washed out by sunlight. */
	sunOn: boolean
	/** SHADOW-PROBE light type — hot-swapped so each light kind can be
	 *  tested under warp (illumination + shadow). Default `'point'`. */
	probeLight: ProbeLight
	/** GPU-pick read path to run this frame (`compute` ↔ `mrt`). The frame
	 *  loop diffs this and calls `setReadMode` on switch; only the selected
	 *  path dispatches/reads back, so the two can be A/B'd for runtime cost. */
	pickRead: PickRead
	/** Render resolution as a device-pixel-ratio override. `0` = auto
	 *  (native dpr, capped at 2 on coarse-pointer devices — dpr-3 phones
	 *  would otherwise render ~2.9M px). Explicit values (1 / 1.5 / 2)
	 *  are the thermal escape hatch on a phone. The loop diffs and applies via
	 *  `renderer.setPixelRatio` + resize. */
	pixelRatio: number
}

/** A teleport target derived from a placed island. Shown in the legend
 *  panel. */
export interface LegendEntry {
	name: string
	color: number
	summary: string
	x: number
	z: number
}

/** Analog movement from the touch joystick, merged with the keyboard
 *  vector every frame (`tickMovement`). `side`/`fwd` ∈ [-1, 1] follow the
 *  keyboard conventions (`fwd > 0` ≡ W, `side > 0` ≡ D); magnitude < 1
 *  walks slower (analog). `run` = stick pushed past ~85% deflection (the
 *  touch equivalent of Shift). Written by `touch-input`, read by the
 *  frame loop — same imperative-channel idiom as `SceneCmd`. */
export interface TouchMove {
	side: number
	fwd: number
	run: boolean
}

/** DOM nodes of the on-screen joystick (base ring + knob). `touch-input`
 *  positions them imperatively per pointer-move — the `HudEls` idiom;
 *  never reactive state at input frequency. */
export interface TouchEls {
	root: HTMLDivElement | null
	base: HTMLDivElement | null
	knob: HTMLDivElement | null
}
