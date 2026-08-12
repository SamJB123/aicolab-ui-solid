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

/** Orthogonal colour controls shared by colour-aware primitives. A family
 * selects a semantic theme anchor, a level selects a perceptual ladder step,
 * and a variant decides how the resolved colour is applied. */
export type ColorFamily =
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'neutral'
	| 'info'
	| 'success'
	| 'warning'
	| 'error'
export type ColorLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
export type ColorVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'text'
export type ColorAxesProps = {
	/** Semantic palette family. When omitted, the primitive keeps its original styling. */
	family?: ColorFamily
	/** Perceptual position on the shared family ladder. */
	level?: ColorLevel
	/** How the resolved family colour is used by this primitive. */
	usage?: ColorVariant
}

const colorAxesData = (props: ColorAxesProps) => ({
	'data-color': props.family,
	'data-level': props.family ? (props.level ?? 500) : undefined,
	'data-variant': props.family ? (props.usage ?? 'text') : undefined,
})

// ── Type ────────────────────────────────────────────────────────────────────

export function Eyebrow(props: ParentProps<{ class?: ClassProp } & ColorAxesProps>) {
	return <span {...colorAxesData(props)} class={['ui-eyebrow ui-color', props.class]}>{props.children}</span>
}

// ── Status dot ────────────────────────────────────────────────────────────────

/** Colour + liveness for a status indicator. Apps map their own status
 *  vocabulary (online/away/flow/…) onto this shape. */
export type StatusVisual = { color: string; live?: boolean }

export function StatusDot(props: { status: StatusVisual; size?: number } & ColorAxesProps) {
	const size = () => props.size ?? 8
	const color = () => props.family ? 'var(--ui-primitive-mark)' : props.status.color
	return (
		<span {...colorAxesData(props)} class="ui-dot ui-color" style={{ width: `${size()}px`, height: `${size()}px` }}>
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
	color: string
	size?: number
	status?: StatusVisual
	ring?: string
} & ColorAxesProps) {
	const size = () => props.size ?? 36
	const color = () => props.family ? 'var(--ui-primitive-ink)' : props.color
	const surface = () => props.family ? 'var(--ui-primitive-surface)' : (props.ring ?? 'var(--c-panel)')
	return (
		<span {...colorAxesData(props)} class="ui-avatar ui-color" style={{ width: `${size()}px`, height: `${size()}px` }}>
			<span
				class="ui-avatar-face"
				style={{
					'font-size': `${Math.round(size() * 0.34)}px`,
					color: color(),
					background: `color-mix(in oklab, ${color()} 20%, ${surface()})`,
					'box-shadow': `inset 0 0 0 1px color-mix(in oklab, ${color()} 55%, transparent)`,
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
} & ColorAxesProps) {
	const max = () => props.max ?? 5
	const size = () => props.size ?? 32
	const shown = createMemo(() => props.people.slice(0, max()))
	const extra = createMemo(() => props.people.length - shown().length)
	return (
		<div {...colorAxesData(props)} class="ui-avatar-stack ui-color">
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
						<Avatar
							name={p.name}
							color={props.family ? 'var(--ui-primitive-ink)' : p.color}
							size={size()}
							ring={props.family ? 'var(--ui-primitive-surface)' : (props.ring ?? 'var(--c-page)')}
						/>
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

export function Chip(
	props: ParentProps<{ tone?: 'plain' | 'accent' | 'live'; class?: ClassProp } & ColorAxesProps>,
) {
	const tone = () => props.tone ?? 'plain'
	return (
		<span {...colorAxesData(props)} class={['ui-chip ui-color', props.class]} data-tone={tone() === 'plain' ? undefined : tone()}>
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
} & ColorAxesProps) {
	const last = createMemo(() => props.items.length - 1)
	return (
		<nav {...colorAxesData(props)} class={['ui-breadcrumb ui-color', props.class]} aria-label={props.label ?? 'Breadcrumb'}>
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
		/** How the resolved colour is applied. `primary` remains as a deprecated
		 * compatibility spelling for the old primary button variant. */
		variant?: ColorVariant | 'primary'
		/** Semantic colour family, independent from strength and presentation. */
		color?: ColorFamily
		/** Perceptual position on the shared colour ladder. */
		level?: ColorLevel
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
			data-color={props.color ?? 'primary'}
			data-level={props.level ?? 500}
			data-variant={props.variant === 'primary' ? 'solid' : (props.variant ?? 'ghost')}
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
	} & ColorAxesProps>,
) {
	return (
		// `group` is kept as a marker class for consumers' group-hover styling.
		<section {...colorAxesData(props)} class={['ui-panel ui-color group', props.class]} style={props.style}>
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
} & ColorAxesProps) {
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
		<span ref={el} {...colorAxesData(props)} class={['ui-counter ui-color', props.class]} data-v={String(props.value)}>
			{fmt(props.value)}
		</span>
	)
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

export function Sparkline(props: { data: number[]; w?: number; h?: number; color?: string } & ColorAxesProps) {
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
	const color = () => props.family ? 'var(--ui-primitive-mark)' : (props.color ?? 'var(--c-accent)')
	return (
		<svg
			{...colorAxesData(props)}
			viewBox={`0 0 ${geo().w} ${geo().h}`}
			width={geo().w}
			height={geo().h}
			class="ui-sparkline ui-color"
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

export function Waveform(props: { bars: number[]; color?: string; class?: ClassProp } & ColorAxesProps) {
	const color = () => props.family ? 'var(--ui-primitive-mark)' : (props.color ?? 'var(--c-accent)')
	return (
		<div {...colorAxesData(props)} class={['ui-waveform ui-color', props.class]}>
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

export function Meter(props: { value: number; max: number; color?: string } & ColorAxesProps) {
	const pct = () => Math.min(100, Math.round((props.value / props.max) * 100))
	const [cssOwnsWidth, setCssOwnsWidth] = createSignal(false)
	onSettled(() => {
		if (supportsTypedAttr()) setCssOwnsWidth(true)
	})
	return (
		<div {...colorAxesData(props)} class="ui-meter ui-color">
			<div
				class="ui-meter-fill"
				data-pct={`${pct()}%`}
				style={{
					width: cssOwnsWidth() ? undefined : `${pct()}%`,
					background: props.family ? 'var(--ui-primitive-mark)' : (props.color ?? 'var(--c-text)'),
				}}
			/>
		</div>
	)
}

// ── Rule — a labelled editorial divider ───────────────────────────────────────

export function Rule(props: { label?: string } & ColorAxesProps) {
	return (
		<div {...colorAxesData(props)} class="ui-rule ui-color">
			<span class="ui-rule-line" />
			<Show when={props.label}>
				<Eyebrow>{props.label}</Eyebrow>
				<span class="ui-rule-line" />
			</Show>
		</div>
	)
}
