/** @jsxImportSource @solidjs/web */
// The host's real pages, framed twice: once forced light, once forced dark,
// each carrying the draft. A frame is a page at a real viewport width, scaled
// to fit its column, so a desktop layout reads as a desktop layout.
//
// Frames must be same-origin: the studio writes the scheme and the draft onto
// each frame's <html> on every load (links followed inside a frame included)
// and on every change. A host that also renders themeDraftBootScript() gets
// the same draft applied from storage first; both writes agree.

import { createMemo, createSignal, For, onSettled } from 'solid-js'
import { SelectControl } from '../primitives'
import { Segmented } from '../controls'
import { createEffect } from '../solid-v2'
import { type Scheme, SCHEMES } from './contract'
import { applyDraft, applyDraftFonts, type ThemeDraft } from './draft'

export type PreviewPage = { label: string; href: string }

type Viewport = 'desktop' | 'phone'

const VIEWPORTS: Record<Viewport, { label: string; width: number; height: number }> = {
	desktop: { label: 'Desktop', width: 1280, height: 860 },
	phone: { label: 'Phone', width: 390, height: 780 },
}

const VIEWPORT_OPTIONS: { id: Viewport; label: string }[] = [
	{ id: 'desktop', label: VIEWPORTS.desktop.label },
	{ id: 'phone', label: VIEWPORTS.phone.label },
]

export function PreviewFrames(props: { pages: readonly PreviewPage[]; draft: ThemeDraft; fontsHref: string | undefined }) {
	const [chosen, setChosen] = createSignal<string>()
	const page = () => chosen() ?? props.pages[0]?.href ?? '/'
	const [viewport, setViewport] = createSignal<Viewport>('desktop')
	return (
		<div class="ui-studio-frames">
			<div class="ui-studio-frames-bar">
				<SelectControl aria-label="Page to preview" value={page()} onChange={(event) => setChosen(event.currentTarget.value)}>
					<For each={props.pages}>{(p) => <option value={p.href}>{p.label}</option>}</For>
				</SelectControl>
				<Segmented label="Viewport" options={VIEWPORT_OPTIONS} value={viewport()} onChange={setViewport} />
			</div>
			<div class="ui-studio-frames-grid" data-viewport={viewport()}>
				<For each={SCHEMES}>
					{(scheme) => (
						<PreviewFrame scheme={scheme} src={page()} viewport={viewport()} draft={props.draft} fontsHref={props.fontsHref} />
					)}
				</For>
			</div>
		</div>
	)
}

function PreviewFrame(props: { scheme: Scheme; src: string; viewport: Viewport; draft: ThemeDraft; fontsHref: string | undefined }) {
	let box: HTMLDivElement | undefined
	let frame: HTMLIFrameElement | undefined
	const [boxWidth, setBoxWidth] = createSignal(0)
	const [frameDocument, setFrameDocument] = createSignal<Document>()
	const size = () => VIEWPORTS[props.viewport]
	const scale = createMemo(() => (boxWidth() > 0 ? Math.min(1, boxWidth() / size().width) : 0))

	onSettled(() => {
		if (!box) return
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) setBoxWidth(entry.contentRect.width)
		})
		observer.observe(box)
		return () => observer.disconnect()
	})

	// What the studio last wrote on each frame document, so a change removes
	// exactly the tokens it no longer sets.
	const written = new WeakMap<Document, ThemeDraft>()
	createEffect(
		() => ({ doc: frameDocument(), draft: props.draft, href: props.fontsHref, scheme: props.scheme }),
		({ doc, draft, href, scheme }) => {
			if (!doc) return
			doc.documentElement.style.colorScheme = scheme
			applyDraft(doc.documentElement, draft, written.get(doc) ?? {})
			written.set(doc, draft)
			applyDraftFonts(doc, href)
		},
	)

	return (
		<figure class="ui-studio-frame" data-scheme={props.scheme}>
			<figcaption class="ui-studio-frame-caption">{props.scheme === 'light' ? 'Light' : 'Dark'}</figcaption>
			<div
				ref={box}
				class="ui-studio-frame-box"
				style={{
					'--ui-studio-frame-width': `${size().width}px`,
					'--ui-studio-frame-height': `${size().height}px`,
					'--ui-studio-frame-scale': String(scale()),
				}}
			>
				<iframe
					ref={frame}
					class="ui-studio-frame-page"
					title={`${props.scheme === 'light' ? 'Light' : 'Dark'} preview of ${props.src}`}
					src={props.src}
					onLoad={() => setFrameDocument(frame?.contentDocument ?? undefined)}
				/>
			</div>
		</figure>
	)
}
