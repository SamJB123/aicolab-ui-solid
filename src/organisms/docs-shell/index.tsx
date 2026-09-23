import { createSignal, createUniqueId, For, onSettled, type ParentProps, Show } from 'solid-js'
import { Eyebrow } from '../../atoms/eyebrow'
import { RichList, RichListItem } from '../../molecules/rich-list'
import {
	colorTreatmentData,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The treatment axes
 * retarget the shell's accents — the reading-progress bar, the composed
 * navigation RichLists, and the article's prose accents (markers, links,
 * blockquote seams) via the inheriting --ui-prose-accent variable.
 * `stickyTop` is the one figure a host must supply when it has its own
 * sticky chrome above the shell (an app mast): the rails and the compass
 * both sit below it, so the host states that height once. */
const knobs = defineKnobs('ui-docs', {
	maxWidth: '<length>',
	sideWidth: '<length>',
	gap: '<length>',
	progressInk: '<color>',
	progressHeight: '<length>',
	stickyTop: '<length>',
})

export type DocsNavItem = {
	label: string
	href: string
	current?: boolean
	/** Indent as a child of the previous top-level item. */
	sub?: boolean
}

/**
 * Long-form document chrome: chapter sidebar (left), article column, live
 * table of contents (right), and a scroll-driven reading-progress bar (pure
 * CSS, `animation-timeline: scroll()` behind @supports).
 *
 * The TOC self-assembles on the client from `h2[id]`/`h3[id]` inside the
 * article (headings without ids are skipped — give every section heading an
 * id so deep links work pre-hydration too). Highlighting rides an
 * IntersectionObserver — the one thing here CSS cannot do yet.
 *
 * Layout is decided ONCE, by the shell's own width: a container size query
 * sets `--docs-rails` (none | nav | both) and every dependent rule — the grid
 * columns, which rails render, whether the COMPASS renders — reads it through
 * container style queries. The compass (added 2026-09-12) is a sticky bar
 * naming the current chapter and section that opens the same two lists as a
 * native popover, so a narrow-screen reader always knows where they are and
 * can jump without scrolling back to the top.
 */
export function DocsShell(
	props: ParentProps<{
		nav?: DocsNavItem[]
		navLabel?: string
		/** The article reads as ui-solid prose (the default). A host whose content brings
		 *  its own typography — a published document with its own sheet — sets false, and
		 *  the shell contributes only the frame: rails, compass, progress. */
		prose?: boolean
	}> &
		ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	let article: HTMLElement | undefined
	let shell: HTMLElement | undefined
	/** Every h2/h3 with an id; each h3 remembers the h2 it sits under. */
	const [toc, setToc] = createSignal<{ id: string; label: string; depth: 2 | 3; chapter: string }[]>([])
	const [active, setActive] = createSignal('')
	const compassId = `ui-docs-compass-${createUniqueId()}`
	const currentSection = () => toc().find((item) => item.id === active())?.label
	/** The h2 the active heading sits under (itself, when the active heading is an h2). */
	const activeChapterId = () => toc().find((item) => item.id === active())?.chapter ?? ''
	/** The nav item marked current, else the nav item whose in-page href is the active chapter, else that chapter's own label. */
	const currentChapter = () => {
		const marked = props.nav?.find((item) => item.current)?.label
		if (marked) return marked
		const chapter = activeChapterId()
		return props.nav?.find((item) => item.href === `#${chapter}`)?.label ?? toc().find((item) => item.id === chapter)?.label
	}
	/** A nav item is current when the host says so, or when its in-page href is the active chapter. */
	const navCurrent = (item: DocsNavItem) => item.current ?? (item.href.startsWith('#') && item.href === `#${activeChapterId()}`)
	/** "On this page" lists every chapter and only the active chapter's sections. */
	const visibleToc = () => toc().filter((item) => item.depth === 2 || item.chapter === activeChapterId())
	const closeCompass = () => document.getElementById(compassId)?.hidePopover()

	onSettled(() => {
		if (!article) return
		const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]'))
		let chapter = ''
		setToc(
			headings.map((h) => {
				if (h.tagName === 'H2') chapter = h.id
				return { id: h.id, label: h.textContent ?? '', depth: h.tagName === 'H2' ? 2 : 3, chapter }
			}),
		)
		// The active heading is the LAST one that has passed the reading line
		// (a third of the way down, below the host's sticky chrome — the same
		// resolved `stickyTop` the CSS offsets by), so a reader who lands mid-
		// page or sits between headings is still placed. The observer only says
		// when to look again; the pick itself reads positions.
		const stickyTop = shell ? Number.parseFloat(getComputedStyle(shell).getPropertyValue('--_ui-docs-sticky-top')) || 0 : 0
		const pick = () => {
			const line = stickyTop + window.innerHeight * 0.34
			let current = headings[0]?.id ?? ''
			for (const h of headings) {
				if (h.getBoundingClientRect().top <= line) current = h.id
				else break
			}
			setActive(current)
		}
		const io = new IntersectionObserver(() => pick(), { rootMargin: `-${Math.round(stickyTop)}px 0px -66% 0px`, threshold: [0, 1] })
		for (const h of headings) io.observe(h)
		pick()
		return () => io.disconnect()
	})

	const NavList = () => (
		<Show when={props.nav?.length}>
			<Eyebrow colorBase={props.colorBase}>{props.navLabel ?? 'Chapters'}</Eyebrow>
			<RichList navigation label={props.navLabel ?? 'Chapters'} colorBase={props.colorBase} colorLevel={props.colorLevel}>
				<For each={props.nav}>
					{(item) => <RichListItem href={item.href} title={item.label} selected={navCurrent(item)} class={{ 'docs-nav-sub': !!item.sub }} onSelect={closeCompass} />}
				</For>
			</RichList>
		</Show>
	)
	const TocList = () => (
		<Show when={toc().length}>
			<Eyebrow colorBase={props.colorBase}>On this page</Eyebrow>
			<RichList navigation label="On this page" colorBase={props.colorBase} colorLevel={props.colorLevel}>
				<For each={visibleToc()}>
					{(item) => <RichListItem href={`#${item.id}`} title={item.label} selected={active() === item.id} class={{ 'docs-toc-sub': item.depth === 3 }} onSelect={closeCompass} />}
				</For>
			</RichList>
		</Show>
	)

	return (
		<div
			class="docs-shell"
			ref={(element) => {
				shell = element
			}}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<div class="docs-progress" aria-hidden="true" />
			<div class="docs-frame">
				<div class="docs-compass">
					<button type="button" class="docs-compass-btn" popovertarget={compassId} aria-label="Contents">
						<span class="docs-compass-chapter">{currentChapter() ?? props.navLabel ?? 'Contents'}</span>
						<Show when={currentSection()}>
							<span class="docs-compass-sep" aria-hidden="true">
								›
							</span>
							<span class="docs-compass-section">{currentSection()}</span>
						</Show>
						<span class="docs-compass-glyph" aria-hidden="true">
							☰
						</span>
					</button>
					<div id={compassId} class="docs-compass-pop" popover="auto">
						<NavList />
						<TocList />
					</div>
				</div>
				<div class="docs-grid">
					<nav class="docs-nav" aria-label={props.navLabel ?? 'Chapters'}>
						<div class="docs-side">
							<NavList />
						</div>
					</nav>
					<article ref={article} class={['docs-article', { 'ui-prose': props.prose !== false }]}>
						{props.children}
					</article>
					<nav class="docs-toc" aria-label="On this page">
						<div class="docs-side">
							<TocList />
						</div>
					</nav>
				</div>
			</div>
		</div>
	)
}
