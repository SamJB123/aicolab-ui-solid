/** @jsxImportSource @solidjs/web */
// DepthCard — DOM face. Ships everywhere (SSR-safe): CSS perspective tilt,
// click-to-flip, pointer-tracked conic edge glow. When an app publishes an
// enhancer (see depth-card/three), the face upgrades IN PLACE: its two face
// elements are adopted into the depth layer's canvas and rendered as real
// 3D panels; the anchor keeps the layout slot. State lives in the core, so
// the upgrade (and any downgrade) never loses it.
//
// Structural CSS lives in styles.css under "── DepthCard ──".

import type { JSX } from '@solidjs/web'
import { createEffect, createSignal, onCleanup, Show } from 'solid-js'
import type { ClassProp } from '../primitives'
import {
	type BackgroundStyle,
	type CardBackgroundHandle,
	type ColorScheme,
	mountCardBackground,
} from './backgrounds'
import { DepthCardCore, type DepthCardEnhancement, depthCardEnhancer } from './core'
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
	/** Fixed card height in px (legacy cards were 400). Fixed — not content-
	 *  driven — so the layout slot survives the faces' adoption into the layer. */
	height?: number
	/** Glow accent; defaults to the theme accent. */
	glowColor?: string
	/** Arm the real DOM inside the 3D texture (links/buttons stay clickable). */
	interactive?: boolean
	core?: DepthCardCore
	class?: ClassProp
}) {
	const core = props.core ?? new DepthCardCore()
	const height = () => props.height ?? 400
	const [enhanced, setEnhanced] = createSignal(false)
	const hasBack = () => Boolean(props.back ?? props.content?.back)

	let anchor: HTMLDivElement | undefined
	let front: HTMLDivElement | undefined
	let back: HTMLDivElement | undefined

	// CSS-face pointer handlers (tilt + glow angle). Inert while enhanced —
	// the layer owns motion then, and the faces aren't under the anchor anyway.
	const onPointerMove = (e: PointerEvent): void => {
		if (enhanced() || !anchor) return
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
		if (enhanced() || !hasBack()) return
		const t = e.target
		if (t instanceof Element && t.closest('a,button,input,select,textarea,[data-depth-no-tap]'))
			return
		core.flip()
	}

	// Upgrade in place when an enhancer is (or becomes) available.
	createEffect(
		() => depthCardEnhancer(),
		(enhance) => {
			if (!enhance || !anchor || !front) return
			const enhancement: DepthCardEnhancement = enhance({
				core,
				anchor,
				front,
				back,
				glowColor: props.glowColor,
				interactive: props.interactive,
			})
			setEnhanced(true)
			return () => {
				enhancement.dispose()
				setEnhanced(false)
			}
		},
	)

	return (
		<div
			ref={anchor}
			class={[
				'depth-card',
				{ 'depth-card-enhanced': enhanced(), 'depth-card-flipped': core.flipped() },
				props.class,
			]}
			style={{ height: `${height()}px` }}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
			onClick={onClick}
		>
			<div class="dc-inner">
				<div ref={front} class="dc-face dc-front">
					<Show when={props.content} fallback={props.front?.()}>
						{(c) => <StructuredFront content={c()} enhanced={enhanced} />}
					</Show>
				</div>
				<Show when={hasBack()}>
					<div ref={back} class="dc-face dc-back">
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

function StructuredFront(props: { content: DepthCardContent; enhanced: () => boolean }) {
	const c = props.content
	const [baked, setBaked] = createSignal<string | null>(null)
	let bgCanvas: HTMLCanvasElement | undefined
	let bgPromise: Promise<CardBackgroundHandle | null> | null = null

	// Generated-background lifecycle (imageless fronts): live animated canvas
	// on the CSS face; on enhancement bake a frame into <img> — the polyfill's
	// SVG snapshots serialise canvases BLANK, a data-URL img captures fine.
	// The handle is a promise (the TSL renderer chunk loads lazily); the bake
	// consumes whatever mount is in flight — including the fresh-load-with-
	// layer case, where it mounts just long enough to render one frame.
	if (!c.image) {
		const ensureBg = (): Promise<CardBackgroundHandle | null> => {
			if (!bgPromise && bgCanvas) {
				bgPromise = mountCardBackground(
					bgCanvas,
					c.backgroundStyle ?? 'gradient',
					c.colorScheme ?? 'emerald',
				)
			}
			return bgPromise ?? Promise.resolve(null)
		}
		createEffect(
			() => props.enhanced(),
			(on) => {
				if (on) {
					const pending = ensureBg()
					// A later CSS-path stint gets a fresh mount on its re-created canvas.
					bgPromise = null
					void pending.then(async (bg) => {
						if (!bg) return
						setBaked(await bg.bake())
						bg.dispose()
					})
				} else {
					void ensureBg()
				}
			},
		)
		onCleanup(() => {
			const pending = bgPromise
			bgPromise = null
			void pending?.then((bg) => bg?.dispose())
		})
	}

	return (
		<div class="dc-sf">
			{/* One lift REGION for the text block (the layer samples the face
			    texture per region and needs ~8px of quiet padding around each;
			    separate title/desc regions would overlap). z 55 splits the
			    legacy 50/60 pair; the CSS face keeps the exact per-element map
			    via its own translateZ. */}
			<div class="dc-sf-text" data-depth-lift="55">
				<h4 class="dc-sf-title">{c.title}</h4>
				<p class="dc-sf-desc">{c.description}</p>
			</div>
			<div class="dc-sf-media" data-depth-lift="50">
				<Show
					when={c.image}
					fallback={
						<>
							<Show
								when={props.enhanced() && baked()}
								fallback={
									<canvas
										class="dc-sf-bgc"
										ref={(el) => {
											bgCanvas = el
										}}
									/>
								}
							>
								{(url) => <img class="dc-sf-img" src={url()} alt="" />}
							</Show>
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
