/** @jsxImportSource @solidjs/web */
// Shared Solid v2 UI primitives — extracted from solid-playground's COMMONS
// dashboard (components/dashboard/primitives.tsx), generalised for reuse.
//
// ## The token contract
//
// Every primitive styles itself exclusively from the nine-colour token set the
// consuming app defines on a root element (see styles.css for the full list):
//
//   --c-ink / --c-ink-2      page + recessed surfaces
//   --c-panel / --c-panel-2  raised surfaces
//   --c-paper                primary text
//   --c-muted / --c-faint    secondary / tertiary text
//   --c-accent               brand accent
//   --c-live                 "live"/positive signal
//   --c-line / --c-line-strong  hairlines (DERIVE from --c-paper via color-mix)
//   --c-accent-soft             accent wash (DERIVE from --c-accent)
//
// plus three font roles: --font-display / --font-sans / --font-data (the
// `.font-display` / `.font-data` helper classes in styles.css read them).
//
// Apps own their palette VALUES; this package owns only the contract and the
// components. Tailwind utility classes used here compile in the consuming app
// — add `@source "<relative path to>/packages/ui-solid/src";` to its CSS.
//
// ## Differences from the COMMONS originals
//
//   - `StatusDot` takes `color`/`live` directly instead of a dashboard-specific
//     `Status` key (apps bind their own status metadata and wrap if they want
//     the keyed form). `Avatar`'s `status` prop follows.
//   - The ping animation is `ui-ping` (shipped in this package's styles.css).
//   - `Logo` stayed in the playground — it is COMMONS-brand-specific.

import type { JSX } from '@solidjs/web'
import { createEffect, createMemo, For, type ParentProps, Show, untrack } from 'solid-js'

/** What a component `class` prop accepts: anything that can sit INSIDE a
 *  Solid class array (the components splice it into their own arrays, and
 *  `JSX.ClassValue` arrays don't nest). A string for the simple case; one
 *  `Record<string, boolean>` covers conditional mixes —
 *  `class={{ 'justify-center': true, 'opacity-50': busy() }}`. */
export type ClassProp = string | Record<string, boolean>

// ── Type ────────────────────────────────────────────────────────────────────

export function Eyebrow(props: ParentProps<{ class?: ClassProp }>) {
	return (
		<span
			class={[
				'font-data text-[10px] uppercase tracking-[0.32em] text-[var(--c-faint)]',
				props.class,
			]}
		>
			{props.children}
		</span>
	)
}

// ── Status dot ────────────────────────────────────────────────────────────────

/** Colour + liveness for a status indicator. Apps map their own status
 *  vocabulary (online/away/flow/…) onto this shape. */
export type StatusVisual = { color: string; live?: boolean }

export function StatusDot(props: { status: StatusVisual; size?: number }) {
	const size = () => props.size ?? 8
	return (
		<span
			class="relative inline-grid place-items-center"
			style={{ width: `${size()}px`, height: `${size()}px` }}
		>
			<Show when={props.status.live}>
				<span
					class="absolute inset-0 rounded-full"
					style={{ background: props.status.color, animation: 'ui-ping 1.8s ease-out infinite' }}
				/>
			</Show>
			<span
				class="relative rounded-full"
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
		<span
			class="relative inline-block shrink-0"
			style={{ width: `${size()}px`, height: `${size()}px` }}
		>
			<span
				class="grid h-full w-full place-items-center rounded-full font-data font-medium uppercase"
				style={{
					'font-size': `${Math.round(size() * 0.34)}px`,
					color: props.color,
					background: `color-mix(in oklab, ${props.color} 20%, transparent)`,
					'box-shadow': `inset 0 0 0 1px color-mix(in oklab, ${props.color} 55%, transparent)`,
					'letter-spacing': '0.02em',
				}}
			>
				{initials(props.name)}
			</span>
			<Show when={props.status}>
				{(s) => (
					<span
						class="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full"
						style={{ padding: '2px', background: props.ring ?? 'var(--c-panel)' }}
					>
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
		<div class="flex items-center">
			<For each={shown()}>
				{(p, i) => (
					<span
						class="rounded-full"
						style={{
							'margin-left': i() === 0 ? '0' : `-${Math.round(size() * 0.32)}px`,
							'box-shadow': `0 0 0 2px ${props.ring ?? 'var(--c-ink)'}`,
							'z-index': String(shown().length - i()),
							position: 'relative',
							'border-radius': '999px',
						}}
					>
						<Avatar name={p.name} color={p.color} size={size()} />
					</span>
				)}
			</For>
			<Show when={extra() > 0}>
				<span
					class="grid place-items-center rounded-full font-data text-[11px] text-[var(--c-muted)]"
					style={{
						'margin-left': `-${Math.round(size() * 0.32)}px`,
						width: `${size()}px`,
						height: `${size()}px`,
						background: 'var(--c-panel-2)',
						'box-shadow': `0 0 0 2px ${props.ring ?? 'var(--c-ink)'}, inset 0 0 0 1px var(--c-line)`,
						'z-index': '0',
						position: 'relative',
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
			class={[
				'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-data text-[10px] uppercase tracking-[0.16em]',
				{
					'bg-[var(--c-panel-2)] text-[var(--c-muted)] ring-1 ring-[var(--c-line)]':
						tone() === 'plain',
					'bg-[var(--c-accent-soft)] text-[var(--c-accent)] ring-1 ring-[color-mix(in_oklab,var(--c-accent)_35%,transparent)]':
						tone() === 'accent',
					'bg-[color-mix(in_oklab,var(--c-live)_15%,transparent)] text-[var(--c-live)] ring-1 ring-[color-mix(in_oklab,var(--c-live)_30%,transparent)]':
						tone() === 'live',
				},
				props.class,
			]}
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
		class?: ClassProp
	}>,
) {
	const variant = () => props.variant ?? 'ghost'
	return (
		<button
			type="button"
			onClick={() => props.onClick?.()}
			class={[
				'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 active:scale-[0.97]',
				{
					'bg-[var(--c-accent)] text-[var(--c-ink)] hover:brightness-110 hover:shadow-[0_4px_24px_-6px_var(--c-accent)]':
						variant() === 'primary',
					'text-[var(--c-paper)] ring-1 ring-[var(--c-line-strong)] hover:bg-[var(--c-panel-2)] hover:ring-[var(--c-muted)]':
						variant() === 'ghost',
				},
				props.class,
			]}
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
		<section
			class={[
				'group relative flex flex-col overflow-hidden rounded-2xl bg-[var(--c-panel)] p-5 ring-1 ring-[var(--c-line)]',
				'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[var(--c-line-strong)] before:to-transparent',
				props.class,
			]}
			style={props.style}
		>
			<Show when={props.glow}>
				<span class="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[var(--c-accent)] opacity-[0.07] blur-3xl" />
			</Show>
			<header class="mb-4 flex items-start justify-between gap-3">
				<div class="flex items-baseline gap-2.5">
					<Show when={props.index}>
						<span class="font-data text-[11px] tracking-[0.1em] text-[var(--c-faint)]">
							{props.index}
						</span>
					</Show>
					<div>
						<h2 class="font-display text-[19px] font-medium leading-none text-[var(--c-paper)]">
							{props.title}
						</h2>
						<Show when={props.kicker}>
							<p class="mt-1.5 font-data text-[10px] uppercase tracking-[0.2em] text-[var(--c-faint)]">
								{props.kicker}
							</p>
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
		<span ref={el} class={['tabular-nums', props.class]} data-v={String(props.value)}>
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
			class="overflow-visible"
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
		<div class={['flex h-full items-center gap-[3px]', props.class]}>
			<For each={props.bars}>
				{(v) => (
					<div
						class="flex-1 rounded-full"
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

// ── Meter — occupancy / capacity bar ──────────────────────────────────────────

export function Meter(props: { value: number; max: number; color?: string }) {
	const pct = () => Math.min(100, Math.round((props.value / props.max) * 100))
	return (
		<div class="h-1 w-full overflow-hidden rounded-full bg-[var(--c-line)]">
			<div
				class="h-full rounded-full transition-[width] duration-500"
				style={{ width: `${pct()}%`, background: props.color ?? 'var(--c-paper)' }}
			/>
		</div>
	)
}

// ── Rule — a labelled editorial divider ───────────────────────────────────────

export function Rule(props: { label?: string }) {
	return (
		<div class="flex items-center gap-3">
			<span class="h-px flex-1 bg-[var(--c-line)]" />
			<Show when={props.label}>
				<Eyebrow>{props.label}</Eyebrow>
				<span class="h-px flex-1 bg-[var(--c-line)]" />
			</Show>
		</div>
	)
}
