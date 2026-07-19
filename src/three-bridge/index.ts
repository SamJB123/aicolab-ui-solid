// @aicolab/ui-solid/three-bridge — the DOM↔three bridge substrate.
//
// CLIENT-ONLY: this subpath imports `three/webgpu` and must never enter an SSR
// module graph. Import it dynamically after mount. The package's main index
// deliberately does NOT re-export it.

export {
	ensureHtmlInCanvasProvider,
	htmlInCanvasSourceRectSupport,
	nativeHtmlInCanvasActive,
} from './html-in-canvas'
export { HtmlTexture } from './html-texture'
export {
	createDepthLayer,
	type DepthLayer,
	type DepthPanelHandle,
	type DepthPanelInit,
} from './layer'
