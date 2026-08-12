/** @jsxImportSource @solidjs/web */
// Shared Solid v2 UI primitives — extracted from solid-playground's COMMONS
// dashboard (components/dashboard/primitives.tsx), generalised for reuse.
//
// ## The token contract
//
// Every primitive styles itself from the DaisyUI-compatible --color-* palette
// in styles.css. Semantic families carry explicit *-content partners; the
// shared 50–950 ladder is generated perceptually with relative OKLCH. Legacy
// --c-* theme inputs remain bridged during repository migration.
//
// plus three font roles: --font-display / --font-sans / --font-data.
//
// ## Styling model (de-Tailwinded 2026-08-07)
//
// Components carry ONE semantic root class (`.ui-*`) whose interior is
// styled through @scope blocks in styles.css — no utility classes, no
// consumer `@source`, no build step. Semantic colour inputs use namespaced
// data-* attributes. CSS consumes them through typed attr(), resolves them
// with if(style()) and native @function rules, and exposes typed paint outputs
// to component-local @scope blocks. Phase 1 deliberately has no fallback.
//
// ## Differences from the COMMONS originals
//
//   - `StatusDot` takes `color`/`live` directly instead of a dashboard-specific
//     `Status` key (apps bind their own status metadata and wrap if they want
//     the keyed form). `Avatar`'s `status` prop follows.
//   - The ping animation is `ui-ping` (shipped in this package's styles.css).
//   - `Avatar` mixes its 20% tint over `ring` (the surface behind it) instead
//     of transparent, so overlapped avatars (AvatarStack) are opaque.
//   - `Logo` stayed in the playground — it is COMMONS-brand-specific.

import type { JSX } from '@solidjs/web'
import {
	createMemo,
	createSignal,
	For,
	onSettled,
	type ParentProps,
	Show,
} from 'solid-js'
import { createEffect } from './solid-v2'

/** What a component `class` prop accepts: anything that can sit INSIDE a
 *  Solid class array (the components splice it into their own arrays, and
 *  `JSX.ClassValue` arrays don't nest). A string for the simple case; one
 *  `Record<string, boolean>` covers conditional mixes. */
export type ClassProp = string | Record<string, boolean>

/** Orthogonal colour controls shared by colour-aware primitives. */
export type ColorBase =
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'neutral'
	| 'info'
	| 'success'
	| 'warning'
	| 'error'
export type ColorLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
export type Appearance = 'solid' | 'soft' | 'outline' | 'ghost' | 'text'
export type ColorTreatmentProps = {
	/** Semantic theme base. Its presence opts the primitive into colour resolution. */
	colorBase?: ColorBase
	/** Perceptual position on the base's colour ladder. Defaults to 500. */
	colorLevel?: ColorLevel
	/** Overall visual treatment. Defaults to solid. */
	appearance?: Appearance
}

const colorTreatmentData = (props: ColorTreatmentProps) => ({
	'data-ui-color-base': props.colorBase,
	'data-ui-color-level': props.colorBase ? (props.colorLevel ?? 500) : undefined,
	'data-ui-appearance': props.colorBase ? (props.appearance ?? 'solid') : undefined,
})

// ── Type ────────────────────────────────────────────────────────────────────

export function Eyebrow(props: ParentProps<{ class?: ClassProp } & ColorTreatmentProps>) {
	return <span {...colorTreatmentData(props)} class={['ui-eyebrow', props.class]}>{props.children}</span>
}

// ── Status dot ────────────────────────────────────────────────────────────────

/** Colour + liveness for a status indicator. Apps map their own status
 *  vocabulary (online/away/flow/…) onto this shape. */
export type StatusVisual = { color: string; live?: boolean }

export function StatusDot(props: { status: StatusVisual; size?: number } & ColorTreatmentProps) {
	const size = () => props.size ?? 8
	const color = () => props.colorBase ? 'var(--ui-mark)' : props.status.color
	return (
		<span {...colorTreatmentData(props)} class="ui-dot" style={{ width: `${size()}px`, height: `${size()}px` }}>
			<Show when={props.status.live}>
				<span class="ui-dot-ping" style={{ background: color() }} />
			</Show>
			<span
				class="ui-dot-core"
				style={{ width: `${size()}px`, height: `${size()}px`, background: color() }}
			/>
		</span>
	)
}

// ── Avatar ────────────────────────────────────────────────────────────────────

const initials = (name: string) =>
	name
		.split(' ')
		.map((w) => w[0])
		.slice(0, 2)
		.join('')
		.toUpperCase()

export function Avatar(props: {
	name: string
	faceColor: string
	size?: number
	status?: StatusVisual
	ring?: string
} & ColorTreatmentProps) {
	const size = () => props.size ?? 36
	const color = () => props.colorBase ? 'var(--ui-ink)' : props.faceColor
	const surface = () => props.colorBase ? 'var(--ui-surface-occluding)' : (props.ring ?? 'var(--c-panel)')
	return (
		<span {...colorTreatmentData(props)} class="ui-avatar" style={{ width: `${size()}px`, height: `${size()}px` }}>
			<span
				class="ui-avatar-face"
				style={{
					'font-size': `${Math.round(size() * 0.34)}px`,
					color: color(),
					background: props.colorBase ? surface() : `color-mix(in oklab, ${color()} 20%, ${surface()})`,
					'box-shadow': props.colorBase
						? 'inset 0 0 0 1px var(--ui-border)'
						: `inset 0 0 0 1px color-mix(in oklab, ${color()} 55%, transparent)`,
				}}
			>
				{initials(props.name)}
			</span>
			<Show when={props.status}>
				{(s) => (
					<span class="ui-avatar-badge" style={{ background: props.colorBase ? 'var(--ui-surface-raised)' : (props.ring ?? 'var(--c-panel)') }}>
						<StatusDot status={s()} size={Math.max(7, Math.round(size() * 0.2))} />
					</span>
				)}
			</Show>
		</span>
	)
}

export function AvatarStack(props: {
	people: { name: string; color: string }[]
	max?: number
	size?: number
	ring?: string
} & ColorTreatmentProps) {
	const max = () => props.max ?? 5
	const size = () => props.size ?? 32
	/* Initials occupy roughly the central two-thirds of the face. Keep the
	 * overlap inside the outer eighth so the stack remains legible at every
	 * supported size, with a 2px minimum that still reads as an overlap. */
	const overlap = () => Math.max(2, Math.round(size() * 0.125))
	const shown = createMemo(() => props.people.slice(0, max()))
	const extra = createMemo(() => props.people.length - shown().length)
	return (
		<div {...colorTreatmentData(props)} class="ui-avatar-stack">
			<For each={shown()}>
				{(p, i) => (
					<span
						class="ui-avatar-stack-item"
						style={{
							'margin-left': i() === 0 ? '0' : `-${overlap()}px`,
							'box-shadow': props.colorBase
								? '0 0 0 2px var(--ui-surface-raised)'
								: `0 0 0 2px ${props.ring ?? 'var(--c-page)'}`,
							'z-index': String(shown().length - i()),
						}}
					>
						<Avatar
							name={p.name}
							faceColor={props.colorBase ? 'var(--ui-ink)' : p.color}
							size={size()}
							ring={props.colorBase ? 'var(--ui-surface-occluding)' : (props.ring ?? 'var(--c-page)')}
							colorBase={props.colorBase}
							colorLevel={props.colorLevel}
							appearance={props.appearance}
						/>
					</span>
				)}
			</For>
			<Show when={extra() > 0}>
				<span
					class="ui-avatar-stack-extra"
					style={{
						'margin-left': `-${overlap()}px`,
						width: `${size()}px`,
						height: `${size()}px`,
						'box-shadow': props.colorBase
							? '0 0 0 2px var(--ui-surface-raised), inset 0 0 0 1px var(--ui-border)'
							: `0 0 0 2px ${props.ring ?? 'var(--c-page)'}, inset 0 0 0 1px var(--c-line)`,
					}}
				>
					+{extra()}
				</span>
			</Show>
		</div>
	)
}

// ── Chip ──────────────────────────────────────────────────────────────────────

export function Chip(
	props: ParentProps<{ tone?: 'plain' | 'accent' | 'live'; class?: ClassProp } & ColorTreatmentProps>,
) {
	const tone = () => props.tone ?? 'plain'
	return (
		<span {...colorTreatmentData(props)} class={['ui-chip', props.class]} data-tone={tone() === 'plain' ? undefined : tone()}>
			{props.children}
		</span>
	)
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

/** One step in a Breadcrumb trail. `href` renders a link, `onSelect` a
 *  button; with neither the crumb is inert text. The FINAL item is always
 *  rendered as the current location (`aria-current="page"`, non-interactive)
 *  regardless of handlers — a breadcrumb never links to where you already
 *  are. */
export interface BreadcrumbItem {
	label: string
	href?: string
	onSelect?: () => void
}

/**
 * Wayfinding trail for nested locations (`<nav>` + `<ol>` semantics, chevron
 * separators from CSS). Ancestors are quiet until hovered/focused; the
 * current location carries the text ink. Apps that need a dismiss affordance
 * put it BESIDE the nav — the trail itself is pure location.
 */
export function Breadcrumb(props: {
	items: readonly BreadcrumbItem[]
	/** Accessible name for the nav landmark. Default "Breadcrumb". */
	label?: string
	class?: ClassProp
} & ColorTreatmentProps) {
	const last = createMemo(() => props.items.length - 1)
	return (
		<nav {...colorTreatmentData(props)} class={['ui-breadcrumb', props.class]} aria-label={props.label ?? 'Breadcrumb'}>
			<ol class="ui-breadcrumb-trail">
				<For each={props.items}>
					{(item, index) => (
						<li class="ui-breadcrumb-step">
							<Show
								when={index() < last() && (item.href || item.onSelect)}
								fallback={
									<span
										class="ui-breadcrumb-here"
										aria-current={index() === last() ? 'page' : undefined}
									>
										{item.label}
									</span>
								}
							>
								<Show
									when={item.href}
									fallback={
										<button
											type="button"
											class="ui-breadcrumb-link"
											onClick={() => item.onSelect?.()}
										>
											{item.label}
										</button>
									}
								>
									<a class="ui-breadcrumb-link" href={item.href}>
										{item.label}
									</a>
								</Show>
							</Show>
						</li>
					)}
				</For>
			</ol>
		</nav>
	)
}

// ── Button ────────────────────────────────────────────────────────────────────

export function Button(
	props: ParentProps<{
		onClick?: () => void
		/** Real native disabled — event suppression, focus exclusion and aria
		 *  semantics come from the <button> attribute, not a class hack. */
		disabled?: boolean
		class?: ClassProp
	} & ColorTreatmentProps>,
) {
	return (
		<button
			type="button"
			disabled={props.disabled}
			onClick={() => {
				if (!props.disabled) props.onClick?.()
			}}
			class={['ui-btn', props.class]}
			data-ui-color-base={props.colorBase ?? 'primary'}
			data-ui-color-level={props.colorLevel ?? 500}
			data-ui-appearance={props.appearance ?? 'solid'}
		>
			{props.children}
		</button>
	)
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export function Panel(
	props: ParentProps<{
		index?: string
		title: string
		kicker?: string
		// A render function (lazy slot), not a pre-created element: created in
		// Panel's own scope so its hydration keys align (a pre-created element
		// from the caller's scope leaves an unclaimed node on hydration).
		action?: () => JSX.Element
		class?: ClassProp
		style?: JSX.CSSProperties
		glow?: boolean
	} & ColorTreatmentProps>,
) {
	return (
		// `group` is kept as a marker class for consumers' group-hover styling.
		<section {...colorTreatmentData(props)} class={['ui-panel group', props.class]} style={props.style}>
			<Show when={props.glow}>
				<span class="ui-panel-glow" />
			</Show>
			<header>
				<div class="ui-panel-head-left">
					<Show when={props.index}>
						<span class="ui-panel-index">{props.index}</span>
					</Show>
					<div>
						<h2>{props.title}</h2>
						<Show when={props.kicker}>
							<p class="ui-panel-kicker">{props.kicker}</p>
						</Show>
					</div>
				</div>
				{props.action?.()}
			</header>
			{props.children}
		</section>
	)
}

// ── Counter — rAF-tweened number, the one stateful primitive ──────────────────

export function Counter(props: {
	value: number
	format?: (n: number) => string
	class?: ClassProp
} & ColorTreatmentProps) {
	let el: HTMLSpanElement | undefined
	const fmt = (n: number) => (props.format ? props.format(n) : Math.round(n).toLocaleString())
	let displayed: number | undefined
	let raf = 0
	/* Track the target reactively, but update the text node directly per frame.
	 * A new target begins from the currently displayed intermediate value, so
	 * rapid updates retarget smoothly instead of jumping or running two tweens. */
	createEffect(
		() => props.value,
		(target) => {
			if (!el) return
			if (displayed === undefined) {
				displayed = target
				el.textContent = fmt(target)
				el.dataset.v = String(target)
				return
			}

			const from = displayed
			if (from === target) return
			const startedAt = performance.now()
			const duration = 700
			const step = (time: number) => {
				const progress = Math.min(1, (time - startedAt) / duration)
				const eased = 1 - (1 - progress) ** 3
				displayed = from + (target - from) * eased
				if (el) {
					el.textContent = fmt(displayed)
					el.dataset.v = String(displayed)
				}
				if (progress < 1) raf = requestAnimationFrame(step)
			}
			raf = requestAnimationFrame(step)
			return () => cancelAnimationFrame(raf)
		},
	)
	return (
		<span ref={el} {...colorTreatmentData(props)} class={['ui-counter', props.class]} data-v={String(props.value)}>
			{fmt(props.value)}
		</span>
	)
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

export function Sparkline(props: { data: number[]; w?: number; h?: number; strokeColor?: string } & ColorTreatmentProps) {
	const geo = createMemo(() => {
		const w = props.w ?? 132
		const h = props.h ?? 36
		const d = props.data
		const max = Math.max(...d)
		const min = Math.min(...d)
		const span = max - min || 1
		const step = w / Math.max(1, d.length - 1)
		const pts = d.map((v, i) => [i * step, h - 3 - ((v - min) / span) * (h - 6)] as const)
		const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
		const area = `0,${h} ${line} ${w},${h}`
		return { w, h, line, area, last: pts[pts.length - 1] }
	})
	const color = () => props.colorBase ? 'var(--ui-mark)' : (props.strokeColor ?? 'var(--c-accent)')
	return (
		<svg
			{...colorTreatmentData(props)}
			viewBox={`0 0 ${geo().w} ${geo().h}`}
			width={geo().w}
			height={geo().h}
			class="ui-sparkline"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<polygon points={geo().area} fill={color()} opacity="0.1" />
			<polyline
				points={geo().line}
				fill="none"
				stroke={color()}
				stroke-width="1.5"
				stroke-linejoin="round"
				stroke-linecap="round"
			/>
			<circle cx={geo().last[0]} cy={geo().last[1]} r="2.4" fill={color()} />
		</svg>
	)
}

// ── Waveform — live audio bars ────────────────────────────────────────────────

export function Waveform(props: { bars: number[]; barColor?: string; class?: ClassProp } & ColorTreatmentProps) {
	const color = () => props.colorBase ? 'var(--ui-mark)' : (props.barColor ?? 'var(--c-accent)')
	return (
		<div {...colorTreatmentData(props)} class={['ui-waveform', props.class]}>
			<For each={props.bars}>
				{(v) => (
					<div
						class="ui-waveform-bar"
						style={{
							height: `${Math.max(8, v * 100)}%`,
							background: color(),
							opacity: String(0.32 + v * 0.6),
						}}
					/>
				)}
			</For>
		</div>
	)
}

// ── Meter — occupancy / capacity bar (typed-attr() exemplar) ─────────────────
// The fill publishes its percentage as `data-pct`. Where typed attr() is
// supported, the CSS rule `width: attr(data-pct type(<percentage>), 0%)`
// owns the width and the inline fallback is dropped AFTER settle (SSR and
// hydration always carry the inline width, so markup stays stable); the
// 0.5s width transition makes the ownership handoff invisible.

const supportsTypedAttr = (): boolean =>
	typeof CSS !== 'undefined' && CSS.supports('width', 'attr(data-pct type(<percentage>), 0%)')

export function Meter(props: { value: number; max: number; fillColor?: string } & ColorTreatmentProps) {
	const pct = () => Math.min(100, Math.round((props.value / props.max) * 100))
	const [cssOwnsWidth, setCssOwnsWidth] = createSignal(false)
	onSettled(() => {
		if (supportsTypedAttr()) setCssOwnsWidth(true)
	})
	return (
		<div {...colorTreatmentData(props)} class="ui-meter">
			<div
				class="ui-meter-fill"
				data-pct={`${pct()}%`}
				style={{
					width: cssOwnsWidth() ? undefined : `${pct()}%`,
					background: props.colorBase ? 'var(--ui-mark)' : (props.fillColor ?? 'var(--c-text)'),
				}}
			/>
		</div>
	)
}

// ── Rule — a labelled editorial divider ───────────────────────────────────────

export function Rule(props: { label?: string } & ColorTreatmentProps) {
	return (
		<div {...colorTreatmentData(props)} class="ui-rule">
			<span class="ui-rule-line" />
			<Show when={props.label}>
				<Eyebrow>{props.label}</Eyebrow>
				<span class="ui-rule-line" />
			</Show>
		</div>
	)
}
