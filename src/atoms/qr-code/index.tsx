/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import qrcode from 'qrcode-generator'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Quiet zone, in modules per side (the QR spec's minimum is 4). */
const QUIET = 4

export type QrSvgOptions = {
	/** Module ink / background — literal colors (exports carry no CSS). */
	ink?: string
	surface?: string
	/** Centre knockout as a fraction of the code's side (0 = none). A white
	 *  rounded patch for a brand mark; error correction jumps to level H so
	 *  the covered modules stay recoverable. Keep ≤ 0.3 (≈9% of area). */
	knockout?: number
	/** Image href drawn centred inside the knockout (data URI for portable
	 *  exports). Sized to 80% of the knockout patch. */
	markHref?: string
	/** width/height attributes on the <svg> — rasterizers (canvas PNG
	 *  export) need explicit pixels; omit for CSS-sized display. */
	pixelSize?: number
}

/**
 * Build a self-contained QR SVG string for `value`. Shared by the QrCode
 * component (display) and consumers exporting downloadable SVG/PNG assets.
 * Classes on the parts (`ui-qr-bg` / `ui-qr-modules` / `ui-qr-knockout`)
 * let display CSS re-ink them; the literal fills stand alone in exports.
 */
export function qrSvgString(value: string, options: QrSvgOptions = {}): string {
	const { ink = '#000000', surface = '#ffffff', knockout = 0, markHref, pixelSize } = options
	// Level H (30% damage budget) whenever a knockout eats modules.
	const qr = qrcode(0, knockout > 0 ? 'H' : 'M')
	qr.addData(value)
	qr.make()
	const count = qr.getModuleCount()
	const side = count + QUIET * 2

	let d = ''
	for (let r = 0; r < count; r++) {
		for (let c = 0; c < count; c++) {
			if (qr.isDark(r, c)) d += `M${c + QUIET} ${r + QUIET}h1v1h-1z`
		}
	}

	const size = pixelSize ? ` width="${pixelSize}" height="${pixelSize}"` : ''
	const koSide = knockout > 0 ? side * knockout : 0
	const koPos = (side - koSide) / 2
	const markSide = koSide * 0.8
	const markPos = (side - markSide) / 2
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}"${size} shape-rendering="crispEdges" role="img">` +
		`<rect class="ui-qr-bg" width="${side}" height="${side}" fill="${surface}"/>` +
		`<path class="ui-qr-modules" d="${d}" fill="${ink}"/>` +
		(knockout > 0
			? `<rect class="ui-qr-knockout" x="${koPos}" y="${koPos}" width="${koSide}" height="${koSide}" rx="${koSide * 0.18}" fill="${surface}"/>`
			: '') +
		(knockout > 0 && markHref
			? `<image href="${markHref}" x="${markPos}" y="${markPos}" width="${markSide}" height="${markSide}" preserveAspectRatio="xMidYMid meet"/>`
			: '') +
		`</svg>`
	)
}

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-qr', {
	size: '<length>',
	ink: '<color>',
	surface: '<color>',
})

type QrCodeProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	/** The encoded payload (a URL, a member code, …). */
	value: string
	/** Accessible name; the SVG itself is presentation. */
	label?: string
	/** Centre knockout fraction (see qrSvgString) — pair with `mark`. */
	knockout?: number
	/** Brand mark slot rendered centred over the knockout (display only —
	 *  exports embed a mark via qrSvgString's markHref instead). Lazy. */
	mark?: () => JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * A QR code — client-rendered SVG, no wire round-trip (the payload never
 * leaves the page). Ink/surface re-ink via knobs; the optional centre
 * knockout hosts a brand mark at error-correction level H.
 */
export function QrCode(props: QrCodeProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'value',
		'label',
		'knockout',
		'mark',
		'colorBase',
		'colorLevel',
		'variant',
		'size',
		'ink',
		'surface',
	)
	const values = () => ({ size: props.size, ink: props.ink, surface: props.surface })
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(values())}
			class={['ui-qr', props.class]}
			role={props.label ? 'img' : undefined}
			aria-label={props.label}
			style={mergeKnobStyle(knobs.style(values()), {
				'--ui-qr-mark-frac': String((props.knockout ?? 0) * 0.8),
				...(typeof props.style === 'object' ? props.style : undefined),
			})}
		>
			{/* Self-contained markup from the shared builder; display colors are
			    re-inked by the stylesheet via the part classes. */}
			<span
				class="ui-qr-svg"
				aria-hidden="true"
				innerHTML={qrSvgString(props.value, { knockout: props.knockout ?? 0 })}
			/>
			<Show when={props.mark}>
				{(mark) => <span class="ui-qr-mark">{mark()()}</span>}
			</Show>
		</span>
	)
}
