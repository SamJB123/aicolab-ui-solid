// DepthCard core — the headless state shared by every face (insight-note
// pattern: signals only; no DOM, no three). A face renders and mutates the
// SAME core, so switching representations never loses state.
//
// The enhancement bus is how faces find each other without the package index
// ever importing three: the app's shell (client-only) loads
// `@aicolab/ui-solid/depth-card/three`, creates the layer, and publishes an
// enhancer here; every DOM face watches the signal and upgrades in place.

import { createSignal } from 'solid-js'

export class DepthCardCore {
	readonly flipped: () => boolean
	#setFlipped: (v: boolean | ((p: boolean) => boolean)) => void
	readonly hover: () => boolean
	readonly setHover: (v: boolean) => void

	constructor() {
		const [flipped, setFlipped] = createSignal(false)
		this.flipped = flipped
		this.#setFlipped = setFlipped
		const [hover, setHover] = createSignal(false)
		this.hover = hover
		this.setHover = setHover
	}

	flip(): void {
		this.#setFlipped((p) => !p)
	}

	setFlipped(v: boolean): void {
		this.#setFlipped(v)
	}
}

/** What the three face needs from a DOM face to lift it into the layer.
 *  Mirrors `DepthPanelInit` structurally (no type import — keeping this file
 *  three-free is the point). */
export interface DepthCardEnhanceRequest {
	core: DepthCardCore
	anchor: HTMLElement
	front: HTMLElement
	back?: HTMLElement
	glowColor?: string
	interactive?: boolean
}

export interface DepthCardEnhancement {
	/** Re-capture after meaningful DOM changes inside a face. */
	refresh(): void
	/** Tear down; the faces are returned to the anchor. */
	dispose(): void
}

export type DepthCardEnhancer = (req: DepthCardEnhanceRequest) => DepthCardEnhancement

const [enhancer, setEnhancer] = createSignal<DepthCardEnhancer | null>(null)

/** The active enhancer (null until an app publishes one). DOM faces track this. */
export const depthCardEnhancer = enhancer

/** Publish (or retract, with null) the app's enhancer. Called by the three
 *  face's `installDepthCardEnhancer` — apps normally never call this directly. */
export const publishDepthCardEnhancer = setEnhancer
