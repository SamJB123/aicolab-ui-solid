/** @jsxImportSource @solidjs/web */
// Marketing-grade primitives — page scaffolding for content/marketing sites
// (first consumer: workers/landing, the aicolab.org port). Same token contract
// as primitives.tsx; same rule: apps own palette values, this package only
// reads them.
//
// Motion philosophy: CSS-first. Everything animated here rides platform
// features (scroll-driven animations, ::details-content, scroll-snap
// carousels, @starting-style) behind graceful fallbacks; the only JS is the
// DocsShell table-of-contents observer, which CSS cannot express yet.
//
// Structural CSS lives in styles.css (semantic classes + @scope — the
// package carries no utility classes since 2026-08-07).

import type { JSX } from '@solidjs/web'
import { createSignal, For, onSettled, type ParentProps, Show } from 'solid-js'
import type { ClassProp } from './primitives'
import { Eyebrow } from './primitives'

// ── PageHero ─────────────────────────────────────────────────────────────────

/** Opening viewport of a marketing page: eyebrow / display title / lede /
 *  actions. `title` accepts JSX so words can be wrapped in <Mark>. */
export function PageHero(props: {
	eyebrow?: string
	title: JSX.Element
	lede?: JSX.Element
	/** Render function (lazy slot) — hydration-safe, see Panel.action. */
	actions?: () => JSX.Element
	align?: 'center' | 'start'
	class?: ClassProp
}) {
	return (
		<div class={['ui-hero', props.class]} data-align={props.align ?? 'center'}>
			<Show when={props.eyebrow}>
				<Eyebrow class="ui-accent-ink">{props.eyebrow}</Eyebrow>
			</Show>
			<h1>{props.title}</h1>
			<Show when={props.lede}>
				<p class="ui-hero-lede">{props.lede}</p>
			</Show>
			<Show when={props.actions}>
				<div class="ui-hero-actions">{props.actions?.()}</div>
			</Show>
		</div>
	)
}

// ── Section ──────────────────────────────────────────────────────────────────

/** A titled page section with consistent width/rhythm. `wide` spans to 72rem
 *  for grids; default column is 48rem. */
export function Section(props: {
	id?: string
	eyebrow?: string
	title?: JSX.Element
	lede?: JSX.Element
	wide?: boolean
	center?: boolean
	class?: ClassProp
	children?: JSX.Element
}) {
	return (
		<section
			id={props.id}
			class={['ui-section', props.class]}
			data-wide={props.wide ? '' : undefined}
		>
			<Show when={props.eyebrow || props.title || props.lede}>
				<header class="ui-section-head" data-center={props.center ? '' : undefined}>
					<Show when={props.eyebrow}>
						<Eyebrow class="ui-accent-ink">{props.eyebrow}</Eyebrow>
					</Show>
					<Show when={props.title}>
						<h2>{props.title}</h2>
					</Show>
					<Show when={props.lede}>
						<p class="ui-section-lede">{props.lede}</p>
					</Show>
				</header>
			</Show>
			{props.children}
		</section>
	)
}

// ── Mark — inline emphasis (the CSS-first heir to rough-notation) ────────────

export function Mark(props: ParentProps<{ tone?: 'underline' | 'highlight' }>) {
	const tone = () => props.tone ?? 'underline'
	return (
		<mark
			class={{
				'ui-mark': true,
				'ui-mark-underline': tone() === 'underline',
				'ui-mark-highlight': tone() === 'highlight',
			}}
		>
			{props.children}
		</mark>
	)
}

// ── FeatureGrid ──────────────────────────────────────────────────────────────

export type Feature = {
	title: string
	body: JSX.Element
	icon?: JSX.Element
	accent?: string
}

/** Responsive card grid for feature/value/pillar sets. */
export function FeatureGrid(props: { items: Feature[]; columns?: 2 | 3; class?: ClassProp }) {
	return (
		<div
			class={['ui-feature-grid', props.class]}
			data-columns={String(props.columns ?? 3)}
		>
			<For each={props.items}>
				{(item) => (
					<article class="ui-feature-card ui-reveal">
						<Show when={item.icon}>
							<span
								class="ui-feature-icon"
								style={{
									background: `color-mix(in oklab, ${item.accent ?? 'var(--c-accent)'} 12%, transparent)`,
									color: item.accent ?? 'var(--c-accent)',
								}}
							>
								{item.icon}
							</span>
						</Show>
						<h3>{item.title}</h3>
						<div class="ui-feature-body">{item.body}</div>
					</article>
				)}
			</For>
		</div>
	)
}

// ── Steps — staged progression (the legacy "Model for Change" heir) ─────────
// Two layouts: 'zigzag' (default) is the legacy design — a central gradient
// spine with stages alternating sides, medallion nodes hugging the spine;
// 'rail' is a compact left rail with a connector line. Node discs carry a
// per-step accent (house ember by default), a gradient wash, and — at md/lg —
// the legacy rotating shimmer, ported to CSS keyframes behind
// prefers-reduced-motion (see the Steps section of styles.css).

export type Step = {
	title: string
	body: JSX.Element
	bullets?: string[]
	/** Lazy slot (invoked in Steps' scope — a pre-created element from the
	 *  caller's scope would desync hydration keys under <For>). Size the glyph
	 *  yourself (~48 for lg, ~28 for md, ~16 for sm nodes). Falls back to the
	 *  step number. */
	icon?: () => JSX.Element
	/** Per-step hue for the title + node. Defaults to the house accent. */
	accent?: string
}

export type StepNodeSize = 'sm' | 'md' | 'lg'

const NODE_SIZE: Record<StepNodeSize, string> = { sm: '2.75rem', md: '5rem', lg: '10rem' }

function StepNode(props: { step: Step; index: number; size: StepNodeSize }) {
	const accent = () => props.step.accent ?? 'var(--c-accent)'
	return (
		<div
			class="ui-step-disc"
			style={{ 'max-width': NODE_SIZE[props.size], '--step-accent': accent() }}
		>
			<Show when={props.size !== 'sm'}>
				<span class="ui-step-wash" aria-hidden="true" />
				<span class="ui-step-shimmer" aria-hidden="true" />
			</Show>
			<div class="ui-step-num" data-size={props.size} style={{ color: accent() }}>
				{props.step.icon ? props.step.icon() : props.index + 1}
			</div>
		</div>
	)
}

function StepText(props: { step: Step }) {
	return (
		<div class="ui-step-text">
			<h3 style={{ color: props.step.accent ?? 'var(--c-text)' }}>{props.step.title}</h3>
			<div class="ui-step-body">{props.step.body}</div>
			<Show when={props.step.bullets?.length}>
				<ul class="ui-step-bullets">
					<For each={props.step.bullets}>{(b) => <li>{b}</li>}</For>
				</ul>
			</Show>
		</div>
	)
}

export function Steps(props: {
	steps: Step[]
	/** 'zigzag' (default): central spine, alternating sides. 'rail': left rail. */
	variant?: 'zigzag' | 'rail'
	/** Node size; defaults to 'lg' for zigzag, 'sm' for rail. */
	node?: StepNodeSize
}) {
	const variant = () => props.variant ?? 'zigzag'
	const size = () => props.node ?? (variant() === 'zigzag' ? 'lg' : 'sm')
	return (
		<Show
			when={variant() === 'zigzag'}
			fallback={
				<ol class="ui-steps" data-variant="rail">
					<span
						class="ui-steps-line"
						style={{
							left: `calc(${NODE_SIZE[size()]} / 2)`,
							top: `calc(${NODE_SIZE[size()]} / 2)`,
							bottom: `calc(${NODE_SIZE[size()]} / 2)`,
						}}
						aria-hidden="true"
					/>
					<For each={props.steps}>
						{(step, i) => (
							<li
								class="ui-step ui-reveal"
								style={{ 'padding-left': `calc(${NODE_SIZE[size()]} + 1.25rem)` }}
							>
								<div class="ui-step-node-anchor" style={{ width: NODE_SIZE[size()] }}>
									<StepNode step={step} index={i()} size={size()} />
								</div>
								<StepText step={step} />
							</li>
						)}
					</For>
				</ol>
			}
		>
			<ol class="ui-steps" data-variant="zigzag">
				<span class="ui-steps-line" style={{ top: '2rem', bottom: '2rem' }} aria-hidden="true" />
				<For each={props.steps}>
					{(step, i) => {
						const flip = () => i() % 2 === 1
						return (
							<li class="ui-step ui-reveal" data-flip={flip() ? '' : undefined}>
								<Show when={!flip()}>
									<StepText step={step} />
								</Show>
								<div class="ui-step-node-cell">
									<StepNode step={step} index={i()} size={size()} />
								</div>
								<Show when={flip()}>
									<StepText step={step} />
								</Show>
							</li>
						)
					}}
				</For>
			</ol>
		</Show>
	)
}

// ── LogoCloud ────────────────────────────────────────────────────────────────

export type LogoItem = { name: string; src?: string }

export function LogoCloud(props: { logos: LogoItem[]; class?: ClassProp }) {
	return (
		<ul class={['ui-logo-cloud', props.class]}>
			<For each={props.logos}>
				{(logo) => (
					<li class="ui-logo-item">
						<Show when={logo.src} fallback={<span class="ui-logo-name">{logo.name}</span>}>
							<img src={logo.src} alt={logo.name} loading="lazy" />
						</Show>
					</li>
				)}
			</For>
		</ul>
	)
}

// ── Accordion — native <details>, animated by ::details-content ─────────────

/** One disclosure row. Pass the same `group` to siblings for exclusive-open
 *  behaviour (native `name` attribute).
 *
 *  Element summaries must be lazy slots (see Panel.action): a pre-created
 *  element from the caller's scope hydrates with mismatched keys and is left
 *  as dead, unclaimed server DOM — handlers and refs inside it never attach.
 *  Plain strings are hydration-safe and stay ergonomic. */
export function AccordionItem(
	props: ParentProps<{
		summary: string | (() => JSX.Element)
		group?: string
		open?: boolean
	}>,
) {
	return (
		<details class="ui-acc" name={props.group} open={props.open}>
			<summary>
				<span class="ui-acc-title">
					{typeof props.summary === 'function' ? props.summary() : props.summary}
				</span>
				<span class="ui-acc-icon" aria-hidden="true" />
			</summary>
			<div class="ui-acc-body">{props.children}</div>
		</details>
	)
}

// ── Carousel — scroll-snap + native ::scroll-button/::scroll-marker ─────────

/** Children become snap slides. Browsers with CSS carousel support get
 *  prev/next buttons and dot markers for free; everywhere else it is a
 *  perfectly good swipe/scroll strip. */
export function Carousel(props: ParentProps<{ class?: ClassProp; label?: string }>) {
	return (
		<section class={['ui-carousel', props.class]} aria-label={props.label ?? 'carousel'}>
			{props.children}
		</section>
	)
}

// ── DocsShell — sidebar nav + auto TOC + reading progress ────────────────────

export type DocsNavItem = {
	label: string
	href: string
	current?: boolean
	/** Indent as a child of the previous top-level item. */
	sub?: boolean
}

/**
 * Long-form document chrome: chapter sidebar (left, lg+), article column,
 * live table of contents (right, xl+), and a scroll-driven reading-progress
 * bar (pure CSS, `animation-timeline: scroll()` behind @supports).
 *
 * The TOC self-assembles on the client from `h2[id]`/`h3[id]` inside the
 * article (headings without ids are skipped — give every section heading an
 * id so deep links work pre-hydration too). Highlighting rides an
 * IntersectionObserver — the one thing here CSS cannot do yet.
 */
export function DocsShell(props: ParentProps<{ nav?: DocsNavItem[]; navLabel?: string }>) {
	let article: HTMLElement | undefined
	const [toc, setToc] = createSignal<{ id: string; label: string; depth: 2 | 3 }[]>([])
	const [active, setActive] = createSignal('')

	onSettled(() => {
		if (!article) return
		const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]'))
		setToc(
			headings.map((h) => ({
				id: h.id,
				label: h.textContent ?? '',
				depth: h.tagName === 'H2' ? 2 : 3,
			})),
		)
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActive(entry.target.id)
				}
			},
			// Fire when a heading enters the top third of the viewport.
			{ rootMargin: '-72px 0px -66% 0px', threshold: 0 },
		)
		for (const h of headings) io.observe(h)
		return () => io.disconnect()
	})

	return (
		<div class="docs-shell">
			<div class="docs-progress" aria-hidden="true" />
			<Show when={props.nav?.length}>
				<nav class="docs-nav" aria-label={props.navLabel ?? 'Chapters'}>
					<div class="docs-side">
						<Eyebrow>{props.navLabel ?? 'Chapters'}</Eyebrow>
						<For each={props.nav}>
							{(item) => (
								<a
									href={item.href}
									aria-current={item.current ? 'page' : undefined}
									class={{
										'docs-nav-link': true,
										'docs-nav-sub': !!item.sub,
										'docs-nav-current': !!item.current,
									}}
								>
									{item.label}
								</a>
							)}
						</For>
					</div>
				</nav>
			</Show>
			<article ref={article} class="ui-prose docs-article">
				{props.children}
			</article>
			<nav class="docs-toc" aria-label="On this page">
				<div class="docs-side">
					<Show when={toc().length}>
						<Eyebrow>On this page</Eyebrow>
						<For each={toc()}>
							{(item) => (
								<a
									href={`#${item.id}`}
									class={{
										'docs-toc-link': true,
										'docs-toc-sub': item.depth === 3,
										'docs-toc-current': active() === item.id,
									}}
								>
									{item.label}
								</a>
							)}
						</For>
					</Show>
				</div>
			</nav>
		</div>
	)
}
