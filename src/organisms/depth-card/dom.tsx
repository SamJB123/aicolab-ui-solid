/** @jsxImportSource @solidjs/web */
// DepthCard — the CSS representation (SSR-safe): perspective tilt,
// click-to-flip, pointer-tracked conic edge glow, real translateZ parallax.
// State lives in DepthCardCore (see core.ts) so alternative representations
// can share an instance via the `core` prop.
//
// Structural CSS lives in styles.css under "── DepthCard ──".

import type { JSX } from '@solidjs/web'
import { onCleanup, Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
import {
	type BackgroundStyle,
	type CardBackgroundHandle,
	type ColorScheme,
	mountCardBackground,
} from './backgrounds'
import { DepthCardCore } from './core'
import { CardIcon, type CardIconName } from './icons'

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
	/** Glow accent; defaults to the theme accent. */
	glowColor?: string
	core?: DepthCardCore
	class?: ClassProp
}) {
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
			style={{
				height: `${height()}px`,
				...(props.glowColor ? { '--dc-glow': props.glowColor } : {}),
			}}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
			onClick={onClick}
		>
			<div class="dc-inner">
				<div class="dc-face dc-front">
					<Show when={props.content} fallback={props.front?.()}>
						{(c) => <StructuredFront content={c()} />}
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

function StructuredFront(props: { content: DepthCardContent }) {
	const c = props.content
	let bgHandle: Promise<CardBackgroundHandle | null> | null = null

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
									// TSL renderer chunk loads lazily on first card).
									bgHandle = mountCardBackground(
										el,
										c.backgroundStyle ?? 'gradient',
										c.colorScheme ?? 'emerald',
									)
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
