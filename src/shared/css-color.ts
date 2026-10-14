/* The browser's own colour parser, borrowed through a 1×1 canvas: any CSS
   colour the engine can compute — oklch(), color-mix() output, a resolved
   light-dark() — fills one pixel and comes back as bytes. For code that
   paints outside CSS (a three.js uniform, a shader's hex string) this is
   the one road from a theme token to a number. The canvas keeps its
   previous fillStyle on invalid input, so a string that fails to parse
   yields the black it was reset to; an empty string yields nothing. The
   bytes are those of the painted pixel, so a translucent colour's channels
   are rounded through the premultiplied store. */

let parseCanvas: CanvasRenderingContext2D | null = null

export interface RgbaBytes {
	/** 0–255 */
	r: number
	g: number
	b: number
	/** 0–1 */
	a: number
}

export function parseCssColor(css: string): RgbaBytes | null {
	if (!parseCanvas) {
		const canvas = document.createElement('canvas')
		canvas.width = 1
		canvas.height = 1
		parseCanvas = canvas.getContext('2d', { willReadFrequently: true })
	}
	const ctx = parseCanvas
	if (!ctx || !css) return null
	ctx.clearRect(0, 0, 1, 1)
	ctx.fillStyle = '#000'
	ctx.fillStyle = css
	ctx.fillRect(0, 0, 1, 1)
	const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
	if (r === undefined || g === undefined || b === undefined || a === undefined) return null
	return { r, g, b, a: a / 255 }
}

/** The colour as an "rgb(r, g, b)" string, the form THREE.Color parses. */
export function cssColorToRgb(css: string): string | null {
	const parsed = parseCssColor(css)
	return parsed ? `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})` : null
}
