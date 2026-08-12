import { createSignal, For, onSettled, type ParentProps, Show } from 'solid-js'
import { Eyebrow } from '../../atoms/eyebrow'
import { RichList, RichListItem } from '../../molecules/rich-list'

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
						<RichList navigation label={props.navLabel ?? 'Chapters'}>
							<For each={props.nav}>
								{(item) => (
									<RichListItem
										href={item.href}
										title={item.label}
										selected={item.current}
										class={{ 'docs-nav-sub': !!item.sub }}
									/>
								)}
							</For>
						</RichList>
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
						<RichList navigation label="On this page">
							<For each={toc()}>
								{(item) => (
									<RichListItem
										href={`#${item.id}`}
										title={item.label}
										selected={active() === item.id}
										class={{ 'docs-toc-sub': item.depth === 3 }}
									/>
								)}
							</For>
						</RichList>
					</Show>
				</div>
			</nav>
		</div>
	)
}
