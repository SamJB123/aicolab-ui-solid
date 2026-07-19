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
import { createEffect, createSignal, Show } from 'solid-js'
import type { ClassProp } from '../primitives'
import { DepthCardCore, type DepthCardEnhancement, depthCardEnhancer } from './core'

export function DepthCard(props: {
	/** Face content — render functions (lazy slots; hydration-safe). */
	front: () => JSX.Element
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
		if (enhanced() || !props.back) return
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
					{props.front()}
				</div>
				<Show when={props.back}>
					<div ref={back} class="dc-face dc-back">
						{props.back?.()}
					</div>
				</Show>
			</div>
		</div>
	)
}
