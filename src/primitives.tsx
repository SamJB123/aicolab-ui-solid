/** @jsxImportSource @solidjs/web */
// Shared Solid v2 UI primitives — extracted from solid-playground's COMMONS
// dashboard (components/dashboard/primitives.tsx), generalised for reuse.
//
// ## The token contract
//
// Every primitive styles itself exclusively from the token set the consuming
// app defines on a root element — see styles.css, where the full contract is
// REGISTERED with @property (typed, animatable, canonical gold-trim
// initials, so the package renders styled even without an app palette):
//
//   --c-page / --c-page-2      page + recessed surfaces
//   --c-panel / --c-panel-2  raised surfaces
//   --c-text                primary text
//   --c-muted / --c-faint    secondary / tertiary text
//   --c-accent               brand accent (gold trim)
//   --c-live                 "live"/positive signal
//   --c-line / --c-line-strong  hairlines (DERIVE from --c-text via color-mix)
//   --c-accent-soft             accent wash (DERIVE from --c-accent)
//
// plus three font roles: --font-display / --font-sans / --font-data.
//
// ## Styling model (de-Tailwinded 2026-08-07)
//
// Components carry ONE semantic root class (`.ui-*`) whose interior is
// styled through @scope blocks in styles.css — no utility classes, no
// consumer `@source`, no build step. Dynamic values (sizes, data colours)
// remain inline styles or data-* attributes. Variants ride data attributes
// (`data-tone`, `data-variant`). Where typed attr() is supported, Meter's
// fill is fully data-driven (see below).
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
	createEffect,
	createMemo,
	createSignal,
	For,
	onSettled,
	type ParentProps,
	Show,
	untrack,
} from 'solid-js'

/** What a component `class` prop accepts: anything that can sit INSIDE a
 *  Solid class array (the components splice it into their own arrays, and
 *  `JSX.ClassValue` arrays don't nest). A string for the simple case; one
 *  `Record<string, boolean>` covers conditional mixes. */
export type ClassProp = string | Record<string, boolean>

// ── Type ────────────────────────────────────────────────────────────────────

export function Eyebrow(props: ParentProps<{ class?: ClassProp }>) {
	return <span class={['ui-eyebrow', props.class]}>{props.children}</span>
}

// ── Status dot ────────────────────────────────────────────────────────────────

/** Colour + liveness for a status indicator. Apps map their own status
 *  vocabulary (online/away/flow/…) onto this shape. */
export type StatusVisual = { color: string; live?: boolean }

export function StatusDot(props: { status: StatusVisual; size?: number }) {
	const size = () => props.size ?? 8
	return (
		<span class="ui-dot" style={{ width: `${size()}px`, height: `${size()}px` }}>
			<Show when={props.status.live}>
				<span class="ui-dot-ping" style={{ background: props.status.color }} />
			</Show>
			<span
				class="ui-dot-core"
				style={{ width: `${size()}px`, height: `${size()}px`, background: props.status.color }}
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
	color: string
	size?: number
	status?: StatusVisual
	ring?: string
}) {
	const size = () => props.size ?? 36
	return (
		<span class="ui-avatar" style={{ width: `${size()}px`, height: `${size()}px` }}>
			<span
				class="ui-avatar-face"
				style={{
					'font-size': `${Math.round(size() * 0.34)}px`,
					color: props.color,
					background: `color-mix(in oklab, ${props.color} 20%, ${props.ring ?? 'var(--c-panel)'})`,
					'box-shadow': `inset 0 0 0 1px color-mix(in oklab, ${props.color} 55%, transparent)`,
				}}
			>
				{initials(props.name)}
			</span>
			<Show when={props.status}>
				{(s) => (
					<span class="ui-avatar-badge" style={{ background: props.ring ?? 'var(--c-panel)' }}>
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
}) {
	const max = () => props.max ?? 5
	const size = () => props.size ?? 32
	const shown = createMemo(() => props.people.slice(0, max()))
	const extra = createMemo(() => props.people.length - shown().length)
	return (
		<div class="ui-avatar-stack">
			<For each={shown()}>
				{(p, i) => (
					<span
						class="ui-avatar-stack-item"
						style={{
							'margin-left': i() === 0 ? '0' : `-${Math.round(size() * 0.32)}px`,
							'box-shadow': `0 0 0 2px ${props.ring ?? 'var(--c-page)'}`,
							'z-index': String(shown().length - i()),
						}}
					>
						<Avatar name={p.name} color={p.color} size={size()} ring={props.ring ?? 'var(--c-page)'} />
					</span>
				)}
			</For>
			<Show when={extra() > 0}>
				<span
					class="ui-avatar-stack-extra"
					style={{
						'margin-left': `-${Math.round(size() * 0.32)}px`,
						width: `${size()}px`,
						height: `${size()}px`,
						'box-shadow': `0 0 0 2px ${props.ring ?? 'var(--c-page)'}, inset 0 0 0 1px var(--c-line)`,
					}}
				>
					+{extra()}
				</span>
			</Show>
		</div>
	)
}

// ── Chip ──────────────────────────────────────────────────────────────────────

export function Chip(props: ParentProps<{ tone?: 'plain' | 'accent' | 'live'; class?: ClassProp }>) {
	const tone = () => props.tone ?? 'plain'
	return (
		<span
			class={['ui-chip', props.class]}
			data-tone={tone() === 'plain' ? undefined : tone()}
		>
			{props.children}
		</span>
	)
}

// ── Button ────────────────────────────────────────────────────────────────────

export function Button(
	props: ParentProps<{
		variant?: 'primary' | 'ghost'
		onClick?: () => void
		/** Real native disabled — event suppression, focus exclusion and aria
		 *  semantics come from the <button> attribute, not a class hack. */
		disabled?: boolean
		class?: ClassProp
	}>,
) {
	return (
		<button
			type="button"
			disabled={props.disabled}
			onClick={() => {
				if (!props.disabled) props.onClick?.()
			}}
			class={['ui-btn', props.class]}
			data-variant={props.variant ?? 'ghost'}
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
	}>,
) {
	return (
		// `group` is kept as a marker class for consumers' group-hover styling.
		<section class={['ui-panel group', props.class]} style={props.style}>
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

export function Counter(props: { value: number; format?: (n: number) => string; class?: ClassProp }) {
	let el: HTMLSpanElement | undefined
	const fmt = (n: number) => (props.format ? props.format(n) : Math.round(n).toLocaleString())
	// Compute phase tracks props.value; apply phase (untracked) tweens the text
	// node directly so we never re-create the signal graph per frame.
	createEffect(
		() => props.value,
		(target, prev) => {
			if (!el) return
			if (prev === undefined) {
				el.textContent = fmt(target)
				return
			}
			let raf = 0
			const from = Number(untrack(() => el?.dataset.v) ?? prev)
			const t0 = performance.now()
			const dur = 700
			const step = (t: number) => {
				const k = Math.min(1, (t - t0) / dur)
				const e = 1 - (1 - k) ** 3
				const v = from + (target - from) * e
				if (el) {
					el.textContent = fmt(v)
					el.dataset.v = String(v)
				}
				if (k < 1) raf = requestAnimationFrame(step)
			}
			raf = requestAnimationFrame(step)
			return () => cancelAnimationFrame(raf)
		},
	)
	return (
		<span ref={el} class={['ui-counter', props.class]} data-v={String(props.value)}>
			{fmt(props.value)}
		</span>
	)
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

export function Sparkline(props: { data: number[]; w?: number; h?: number; color?: string }) {
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
	const color = () => props.color ?? 'var(--c-accent)'
	return (
		<svg
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

export function Waveform(props: { bars: number[]; color?: string; class?: ClassProp }) {
	const color = () => props.color ?? 'var(--c-accent)'
	return (
		<div class={['ui-waveform', props.class]}>
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

export function Meter(props: { value: number; max: number; color?: string }) {
	const pct = () => Math.min(100, Math.round((props.value / props.max) * 100))
	const [cssOwnsWidth, setCssOwnsWidth] = createSignal(false)
	onSettled(() => {
		if (supportsTypedAttr()) setCssOwnsWidth(true)
	})
	return (
		<div class="ui-meter">
			<div
				class="ui-meter-fill"
				data-pct={`${pct()}%`}
				style={{
					width: cssOwnsWidth() ? undefined : `${pct()}%`,
					background: props.color ?? 'var(--c-text)',
				}}
			/>
		</div>
	)
}

// ── Rule — a labelled editorial divider ───────────────────────────────────────

export function Rule(props: { label?: string }) {
	return (
		<div class="ui-rule">
			<span class="ui-rule-line" />
			<Show when={props.label}>
				<Eyebrow>{props.label}</Eyebrow>
				<span class="ui-rule-line" />
			</Show>
		</div>
	)
}
