/** @jsxImportSource @solidjs/web */
// DepthCard — three face. CLIENT-ONLY subpath (imports three via the bridge);
// load it dynamically from the app shell:
//
//   const { installDepthCardEnhancer } = await import('@aicolab/ui-solid/depth-card/three')
//   const uninstall = await installDepthCardEnhancer()
//
// Creates the app's persistent depth layer and publishes the enhancer every
// DOM-face DepthCard watches; each face then lifts itself into the layer.

import { createEffect, createRoot } from 'solid-js'
import { createDepthLayer, type DepthLayer, type DepthLayerOptions } from '../three-bridge'
import { type DepthCardEnhancer, publishDepthCardEnhancer } from './core'

export async function installDepthCardEnhancer(
	options: DepthLayerOptions = {},
): Promise<() => void> {
	const layer: DepthLayer = await createDepthLayer(options)

	const enhancer: DepthCardEnhancer = (req) => {
		const handle = layer.addPanel({
			anchor: req.anchor,
			front: req.front,
			back: req.back,
			glowColor: req.glowColor,
			interactive: req.interactive,
			onTap: req.back ? () => req.core.flip() : undefined,
			onHover: (h) => req.core.setHover(h),
		})
		// The panel follows the core (not the other way round): any face or app
		// code can flip the core and the 3D panel animates. Owned by its own
		// root so disposal is explicit and independent of the caller's scope.
		const stopFollowing = createRoot((dispose) => {
			createEffect(
				() => req.core.flipped(),
				(flipped) => handle.setFlipped(flipped),
			)
			return dispose
		})
		return {
			refresh: () => handle.refresh(),
			dispose: () => {
				stopFollowing()
				handle.dispose()
			},
		}
	}

	// Function value through a signal setter — wrap so it's stored, not invoked.
	publishDepthCardEnhancer(() => enhancer)
	return () => {
		publishDepthCardEnhancer(null)
		layer.dispose()
	}
}
