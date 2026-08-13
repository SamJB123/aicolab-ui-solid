// Generated card backgrounds — the three-free FACADE. Types, preset schemes
// and the mount entry point live here so the depth-card index keeps its
// no-three contract; the actual renderer (WebGPURenderer + TSL, the house
// stack — see backgrounds-tsl.ts) arrives via dynamic import, so three loads
// lazily and never enters the index's static graph.
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
	dispose(): void
	/** Re-point the animation's scheme (the RAF loop repaints next frame). */
	setColors(colors: ColorScheme): void
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
	const { mountTslCardBackground } = await import('./backgrounds-tsl')
	return mountTslCardBackground(canvas, style, colors, phase)
}
