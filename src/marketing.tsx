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
// Structural CSS lives in styles.css under "── Marketing ──".

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
	const align = () => props.align ?? 'center'
	return (
		<div
			class={[
				'mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-16 pt-20 sm:pt-28',
				{ 'items-center text-center': align() === 'center', 'items-start': align() === 'start' },
				props.class,
			]}
		>
			<Show when={props.eyebrow}>
				<Eyebrow class="text-[var(--c-accent)]">{props.eyebrow}</Eyebrow>
			</Show>
			<h1 class="font-display m-0 text-4xl font-medium leading-[1.08] tracking-[-0.015em] text-[var(--c-paper)] sm:text-6xl">
				{props.title}
			</h1>
			<Show when={props.lede}>
				<p class="m-0 max-w-2xl text-lg leading-relaxed text-[var(--c-muted)]">{props.lede}</p>
			</Show>
			<Show when={props.actions}>
				<div class="mt-2 flex flex-wrap items-center justify-center gap-3">{props.actions?.()}</div>
			</Show>
		</div>
	)
}

// ── Section ──────────────────────────────────────────────────────────────────

/** A titled page section with consistent width/rhythm. `wide` spans to 72rem
 *  for grids; default column is 56rem. */
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
			class={[
				'mx-auto w-full px-6 py-14 sm:py-20',
				{ 'max-w-6xl': !!props.wide, 'max-w-3xl': !props.wide },
				props.class,
			]}
		>
			<Show when={props.eyebrow || props.title || props.lede}>
				<header
					class={['mb-10 flex flex-col gap-3', { 'items-center text-center': !!props.center }]}
				>
					<Show when={props.eyebrow}>
						<Eyebrow class="text-[var(--c-accent)]">{props.eyebrow}</Eyebrow>
					</Show>
					<Show when={props.title}>
						<h2 class="font-display m-0 text-3xl font-medium tracking-[-0.01em] text-[var(--c-paper)] sm:text-4xl">
							{props.title}
						</h2>
					</Show>
					<Show when={props.lede}>
						<p class="m-0 max-w-2xl text-base leading-relaxed text-[var(--c-muted)]">
							{props.lede}
						</p>
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
			class={[
				'grid gap-5',
				{
					'sm:grid-cols-2': (props.columns ?? 3) === 2,
					'sm:grid-cols-2 lg:grid-cols-3': (props.columns ?? 3) === 3,
				},
				props.class,
			]}
		>
			<For each={props.items}>
				{(item) => (
					<article class="ui-reveal flex flex-col gap-3 rounded-2xl bg-[var(--c-panel)] p-6 ring-1 ring-[var(--c-line)]">
						<Show when={item.icon}>
							<span
								class="inline-grid h-10 w-10 place-items-center rounded-xl text-lg"
								style={{
									background: `color-mix(in oklab, ${item.accent ?? 'var(--c-accent)'} 12%, transparent)`,
									color: item.accent ?? 'var(--c-accent)',
								}}
							>
								{item.icon}
							</span>
						</Show>
						<h3 class="font-display m-0 text-lg font-medium text-[var(--c-paper)]">{item.title}</h3>
						<div class="text-[15px] leading-relaxed text-[var(--c-muted)]">{item.body}</div>
					</article>
				)}
			</For>
		</div>
	)
}

// ── Steps — vertical staged rail (e.g. "Model for Change") ──────────────────

export type Step = {
	title: string
	body: JSX.Element
	bullets?: string[]
	icon?: JSX.Element
	accent?: string
}

export function Steps(props: { steps: Step[] }) {
	return (
		<ol class="ui-steps m-0 grid list-none gap-10 p-0">
			<For each={props.steps}>
				{(step, i) => (
					<li class="ui-reveal relative grid gap-5 pl-16 sm:pl-20">
						<span
							class="ui-step-node font-data absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-full text-sm"
							style={{
								background: `color-mix(in oklab, ${step.accent ?? 'var(--c-accent)'} 12%, transparent)`,
								color: step.accent ?? 'var(--c-accent)',
								'box-shadow': `inset 0 0 0 1px color-mix(in oklab, ${step.accent ?? 'var(--c-accent)'} 40%, transparent)`,
							}}
						>
							{step.icon ?? i() + 1}
						</span>
						<div>
							<h3
								class="font-display m-0 text-2xl font-medium"
								style={{ color: step.accent ?? 'var(--c-paper)' }}
							>
								{step.title}
							</h3>
							<div class="mt-2 leading-relaxed text-[var(--c-muted)]">{step.body}</div>
							<Show when={step.bullets?.length}>
								<ul class="mt-3 grid gap-1.5 pl-5 text-[15px] text-[var(--c-muted)]">
									<For each={step.bullets}>{(b) => <li>{b}</li>}</For>
								</ul>
							</Show>
						</div>
					</li>
				)}
			</For>
		</ol>
	)
}

// ── LogoCloud ────────────────────────────────────────────────────────────────

export type LogoItem = { name: string; src?: string }

export function LogoCloud(props: { logos: LogoItem[]; class?: ClassProp }) {
	return (
		<ul
			class={[
				'm-0 flex list-none flex-wrap items-center justify-center gap-x-12 gap-y-8 p-0',
				props.class,
			]}
		>
			<For each={props.logos}>
				{(logo) => (
					<li class="ui-logo-item">
						<Show
							when={logo.src}
							fallback={<span class="font-data text-sm text-[var(--c-faint)]">{logo.name}</span>}
						>
							<img src={logo.src} alt={logo.name} loading="lazy" class="max-h-10 w-auto max-w-36" />
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
		<div class="docs-shell mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_13rem]">
			<div class="docs-progress" aria-hidden="true" />
			<Show when={props.nav?.length}>
				<nav class="docs-nav hidden lg:block" aria-label={props.navLabel ?? 'Chapters'}>
					<div class="sticky top-24 grid gap-1">
						<Eyebrow class="mb-2">{props.navLabel ?? 'Chapters'}</Eyebrow>
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
			<article ref={article} class="ui-prose min-w-0">
				{props.children}
			</article>
			<nav class="docs-toc hidden xl:block" aria-label="On this page">
				<div class="sticky top-24 grid gap-1">
					<Show when={toc().length}>
						<Eyebrow class="mb-2">On this page</Eyebrow>
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
