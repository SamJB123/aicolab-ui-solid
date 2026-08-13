/** @jsxImportSource @solidjs/web */
// DepthCard — the CSS representation (SSR-safe): perspective tilt,
// click-to-flip, pointer-tracked conic edge glow, real translateZ parallax.
// State lives in DepthCardCore (see core.ts) so alternative representations
// can share an instance via the `core` prop.
//
// Structural CSS lives in styles.css under "── DepthCard ──".
//
// CSS → TSL BRIDGE: the generated backgrounds render on the GPU from plain
// colour values, while the treatment family lives in CSS. The stylesheet
// resolves a three-colour scheme into REGISTERED adapters (registration
// makes them compute to real colours, color-mix included); when no explicit
// colorScheme is given, the mount reads those adapters off the canvas with
// getComputedStyle, normalises through a canvas fillStyle parse (oklch →
// rgb, which THREE.Color can digest), and feeds the untouched renderer.
// Untreated bridge defaults ARE the legacy emerald triad, so the classic
// look is byte-identical; a treated card derives its scheme from the family.

import type { JSX } from '@solidjs/web'
import { createEffect, onCleanup, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'
import {
	type BackgroundStyle,
	type CardBackgroundHandle,
	type ColorScheme,
	mountCardBackground,
} from './backgrounds'
import { DepthCardCore } from './core'
import { CardIcon, type CardIconName } from './icons'

/** Per-instance styling contract (see shared/knobs.ts). The face is a
 * painted pair (treated → family surface/ink); glow and the back band ride
 * the family; the scheme knobs feed the CSS→TSL bridge above. */
const knobs = defineKnobs('ui-depth', {
	radius: '<length-percentage>',
	pad: '<length>',
	surface: '<color>',
	glow: '<color>',
	bandSurface: '<color>',
	mediaHeight: '<length>',
	mediaRadius: '<length-percentage>',
	schemePrimary: '<color>',
	schemeSecondary: '<color>',
	schemeAccent: '<color>',
})

/* Normalise ANY computed CSS colour (oklch/oklab/color-mix output) to an
   "rgb(r, g, b)" string THREE.Color can parse. fillStyle keeps its previous
   value on invalid input, so a failed parse yields the fallback black. */
let parseCanvas: CanvasRenderingContext2D | null = null
const cssColorToRgb = (css: string): string | null => {
	if (!parseCanvas) {
		const canvas = document.createElement('canvas')
		canvas.width = 1
		canvas.height = 1
		parseCanvas = canvas.getContext('2d', { willReadFrequently: true })
	}
	const ctx = parseCanvas
	if (!ctx || !css) return null
	ctx.fillStyle = '#000'
	ctx.fillStyle = css
	ctx.fillRect(0, 0, 1, 1)
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
	return `rgb(${r}, ${g}, ${b})`
}

/** Read the stylesheet-resolved scheme adapters off the (laid-out) canvas. */
const resolveSchemeFromCss = async (element: HTMLElement): Promise<ColorScheme | null> => {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
	const computed = getComputedStyle(element)
	const primary = cssColorToRgb(computed.getPropertyValue('--_dc-scheme-1'))
	const secondary = cssColorToRgb(computed.getPropertyValue('--_dc-scheme-2'))
	const accent = cssColorToRgb(computed.getPropertyValue('--_dc-scheme-3'))
	if (!primary || !secondary) return null
	return { primary, secondary, accent: accent ?? undefined }
}

/** Structured content — the legacy Glowing3DCardFlip design: front is
 *  title → description → inset media (image or generated background) with the
 *  icon bottom-center; back is a tinted header band + "← Back" + scrollable
 *  body over a watermark of the icon. */
export type DepthCardContent = {
	title: string
	description: string
	/** Front media image. Omit to get a generated background (see below). */
	image?: string
	imageAlt?: string
	/** Bottom-center front icon; also the back watermark and the generated-
	 *  background overlay glyph. */
	icon?: CardIconName
	/** Generated background for imageless fronts (legacy charter look). */
	backgroundStyle?: BackgroundStyle
	/** Explicit scheme (legacy presets or literal). Omit to derive from the
	 *  card's treatment family / scheme knobs (emerald when untreated). */
	colorScheme?: string | ColorScheme
	/** Back body — lazy slot (hydration-safe). Presence enables flipping. */
	back?: () => JSX.Element
}

export function DepthCard(props: {
	/** Structured legacy card design. Use EITHER this or the free-form slots. */
	content?: DepthCardContent
	/** Face content — render functions (lazy slots; hydration-safe). */
	front?: () => JSX.Element
	back?: () => JSX.Element
	/** Fixed card height in px (legacy cards were 400). */
	height?: number
	/** @deprecated Use the `glow` knob. */
	glowColor?: string
	core?: DepthCardCore
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>) {
	const core = props.core ?? new DepthCardCore()
	const height = () => props.height ?? 400
	const hasBack = () => Boolean(props.back ?? props.content?.back)

	let anchor: HTMLDivElement | undefined

	// Pointer handlers: tilt + glow angle as CSS custom properties.
	const onPointerMove = (e: PointerEvent): void => {
		if (!anchor) return
		const r = anchor.getBoundingClientRect()
		const nx = (e.clientX - r.left) / r.width - 0.5
		const ny = (e.clientY - r.top) / r.height - 0.5
		anchor.style.setProperty('--dc-ty', `${(nx * 10).toFixed(2)}deg`)
		anchor.style.setProperty('--dc-tx', `${(-ny * 10).toFixed(2)}deg`)
		anchor.style.setProperty(
			'--dc-angle',
			`${((Math.atan2(ny, nx) * 180) / Math.PI + 90).toFixed(1)}deg`,
		)
	}
	const onPointerLeave = (): void => {
		anchor?.style.setProperty('--dc-tx', '0deg')
		anchor?.style.setProperty('--dc-ty', '0deg')
	}
	const onClick = (e: MouseEvent): void => {
		if (!hasBack()) return
		const t = e.target
		if (t instanceof Element && t.closest('a,button,input,select,textarea,[data-depth-no-tap]'))
			return
		core.flip()
	}

	return (
		<div
			ref={anchor}
			class={['depth-card', { 'depth-card-flipped': core.flipped() }, props.class]}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), {
				height: `${height()}px`,
				/* Legacy escape hatch — the glow adapter chains through it. */
				...(props.glowColor ? { '--dc-glow': props.glowColor } : {}),
			})}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
			onClick={onClick}
		>
			<div class="dc-inner">
				<div class="dc-face dc-front">
					<Show when={props.content} fallback={props.front?.()}>
						{(c) => (
							<StructuredFront
								content={c()}
								/* Everything that can move the CSS-derived scheme: when it
								   changes, the mounted background re-reads the bridge. */
								schemeSignature={() =>
									[
										props.colorBase,
										props.colorLevel,
										props.variant,
										props.schemePrimary,
										props.schemeSecondary,
										props.schemeAccent,
									].join('|')
								}
							/>
						)}
					</Show>
				</div>
				<Show when={hasBack()}>
					<div class="dc-face dc-back">
						<Show when={props.content} fallback={props.back?.()}>
							{(c) => <StructuredBack content={c()} core={core} />}
						</Show>
					</div>
				</Show>
			</div>
		</div>
	)
}

// ── Structured faces — the legacy Glowing3DCardFlip design ──────────────────

function StructuredFront(props: {
	content: DepthCardContent
	schemeSignature: () => string
}) {
	const c = props.content
	let bgHandle: Promise<CardBackgroundHandle | null> | null = null
	let bgCanvas: HTMLCanvasElement | undefined

	// Reactive bridge: a treatment/scheme-knob change re-derives the scheme
	// from the resolved CSS adapters and re-points the running animation.
	// (Explicit content.colorScheme opts out — that path is caller-owned.)
	createEffect(
		() => props.schemeSignature(),
		() => {
			if (c.colorScheme || !bgCanvas || !bgHandle) return
			const el = bgCanvas
			void (async () => {
				const [handle, scheme] = await Promise.all([bgHandle, resolveSchemeFromCss(el)])
				if (handle && scheme) handle.setColors(scheme)
			})()
		},
	)

	return (
		<div class="dc-sf">
			<h4 class="dc-sf-title">{c.title}</h4>
			<p class="dc-sf-desc">{c.description}</p>
			<div class="dc-sf-media">
				<Show
					when={c.image}
					fallback={
						<>
							<canvas
								class="dc-sf-bgc"
								ref={(el) => {
									// Animated generated background (client-only mount; the
									// TSL renderer chunk loads lazily on first card). Without
									// an explicit scheme, the CSS→TSL bridge derives one from
									// the resolved adapters (family when treated).
									bgCanvas = el
									bgHandle = (async () => {
										const scheme =
											c.colorScheme ?? (await resolveSchemeFromCss(el)) ?? 'emerald'
										return mountCardBackground(el, c.backgroundStyle ?? 'gradient', scheme)
									})()
									onCleanup(() => {
										void bgHandle?.then((bg) => bg?.dispose())
										bgHandle = null
									})
								}}
							/>
							<Show when={c.icon}>
								{(name) => (
									<span class="dc-sf-bg-icon" aria-hidden="true">
										<CardIcon name={name()} size={64} />
									</span>
								)}
							</Show>
						</>
					}
				>
					{(src) => <img class="dc-sf-img" src={src()} alt={c.imageAlt ?? c.title} />}
				</Show>
			</div>
			<Show when={c.icon}>
				{(name) => (
					<span class="dc-sf-icon">
						<CardIcon name={name()} size={32} />
					</span>
				)}
			</Show>
		</div>
	)
}

function StructuredBack(props: { content: DepthCardContent; core: DepthCardCore }) {
	const c = props.content
	return (
		<div class="dc-sb">
			<Show when={c.icon}>
				{(name) => (
					<span class="dc-sb-watermark" aria-hidden="true">
						<CardIcon name={name()} size={32} />
					</span>
				)}
			</Show>
			<div class="dc-sb-band">
				<h4 class="dc-sb-title">{c.title}</h4>
				<button type="button" class="dc-sb-return" onClick={() => props.core.flip()}>
					← Back
				</button>
			</div>
			<div class="dc-sb-body">{c.back?.()}</div>
		</div>
	)
}
