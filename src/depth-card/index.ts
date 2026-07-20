// @aicolab/ui-solid/depth-card — headless core + DOM face. Three-free by
// design: the three face lives at `@aicolab/ui-solid/depth-card/three` (its
// own export) so importing this index never pulls three into a bundle.

export {
	type BackgroundStyle,
	type ColorScheme,
	presetColorSchemes,
} from './backgrounds'
export {
	DepthCardCore,
	type DepthCardEnhancement,
	type DepthCardEnhanceRequest,
	type DepthCardEnhancer,
	depthCardEnhancer,
} from './core'
export { DepthCard, type DepthCardContent } from './dom'
export { CardIcon, type CardIconName } from './icons'
