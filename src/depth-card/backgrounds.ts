// Generated card backgrounds — the three-free FACADE. Types, preset schemes
// and the mount entry point live here so the depth-card index keeps its
// no-three contract; the actual renderer (WebGPURenderer + TSL, the house
// stack — see three-bridge/card-backgrounds.ts) arrives via dynamic import,
// so it rides the same lazily-loaded three chunk as the depth layer itself.
//
// Captures: the polyfill's SVG rasteriser serialises <canvas> as BLANK, so
// enhanced (three-path) faces must swap the live canvas for a baked <img> —
// `bake()` returns a data-URL frame for exactly that (see dom.tsx).
//
// Client-only: touches DOM/GPU. Never call during SSR.

export type BackgroundStyle = 'gradient' | 'particles' | 'waves' | 'noise' | 'geometric'

export type ColorScheme = { primary: string; secondary: string; accent?: string }

/** Legacy preset schemes, verbatim. */
export const presetColorSchemes: Record<string, ColorScheme> = {
	emerald: { primary: '#047857', secondary: '#10B981', accent: '#34D399' },
	ocean: { primary: '#1E40AF', secondary: '#3B82F6', accent: '#60A5FA' },
	sunset: { primary: '#C2410C', secondary: '#F97316', accent: '#FB923C' },
	purple: { primary: '#7E22CE', secondary: '#A855F7', accent: '#C084FC' },
	midnight: { primary: '#1E293B', secondary: '#334155', accent: '#475569' },
}

export interface CardBackgroundHandle {
	/** One frame as a data URL (for captures — canvases rasterise blank in the
	 *  polyfill's SVG snapshots; a baked <img> rides them fine). */
	bake(): Promise<string>
	dispose(): void
}

/** Per-card animation phase so simultaneous cards don't move in lockstep. */
let epoch = 0

/**
 * Animate a generated background into `canvas` (2D). Resolves once the TSL
 * renderer module is loaded and the first frame is drawn.
 */
export async function mountCardBackground(
	canvas: HTMLCanvasElement,
	style: BackgroundStyle,
	colorScheme: string | ColorScheme,
): Promise<CardBackgroundHandle | null> {
	const colors =
		typeof colorScheme === 'string'
			? (presetColorSchemes[colorScheme] ?? presetColorSchemes.emerald)
			: colorScheme
	const phase = (epoch++ % 7) * 1.7
	const { mountTslCardBackground } = await import('../three-bridge/card-backgrounds')
	return mountTslCardBackground(canvas, style, colors, phase)
}
