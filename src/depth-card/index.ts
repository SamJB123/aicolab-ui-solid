// @aicolab/ui-solid/depth-card — common core + the CSS representation.
// Three-free static graph: the generated backgrounds' TSL renderer arrives
// only via dynamic import (see backgrounds.ts), so importing this index
// never pulls three into a bundle. An alternative representation would be
// its own component sharing DepthCardCore via the `core` prop.

export {
	type BackgroundStyle,
	type ColorScheme,
	presetColorSchemes,
} from './backgrounds'
export { DepthCardCore } from './core'
export { DepthCard, type DepthCardContent } from './dom'
export { CardIcon, type CardIconName } from './icons'
