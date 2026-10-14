/** @jsxImportSource @solidjs/web */
// ThemeStudio — edit the host's theme for both colour schemes and preview it.
//
// The studio starts from the host's own theme, read from its stylesheets
// (read-theme.ts), and keeps only what is changed: a DRAFT of token → value
// (draft.ts). The draft is written on <html> while the studio is open, and,
// given a storageKey, saved for every page of the site in this browser.
//
// Light and dark are edited side by side. Every colour anchor is one
// `light-dark()` value; changing one side keeps the other side exactly as it
// was written, expressions included.
//
// The studio's own chrome is a theme boundary pinned to the host's SHIPPED
// theme, so no draft — however unreadable — can make the editor unusable.
// What the draft looks like is shown in the previews: the host's pages in
// frames (when `pages` is given) and a component catalogue, each in light
// and dark.
//
// Client-only: it reads the document's stylesheets. Hosts that render on the
// server mount it with clientOnly() (see platform/landing's /theme route).

import type { JSX } from '@solidjs/web'
import { createContext, createMemo, createSignal, For, Match, onSettled, Show, Switch, untrack, useContext } from 'solid-js'
import { Accordion, AccordionItem } from '../marketing'
import { Button, Eyebrow, SelectControl, TextInput } from '../primitives'
import type { ClassProp } from '../shared/color-treatment'
import { createEffect } from '../solid-v2'
import { Catalogue, PlateSpecimen } from './catalogue'
import { COLOR_ANCHORS, type ColorAnchor, FONT_TOKENS, type Scheme, SCHEMES, SIZE_LADDERS, type SizeLadder } from './contract'
import { applyDraft, applyDraftFonts, DRAFT_BOOT_ATTRIBUTE, readStoredDraft, type ThemeDraft, writeStoredDraft } from './draft'
import {
	ensureAllCandidatesLoaded,
	FONT_OPTIONS,
	FONT_ROLE_NAMES,
	FONT_ROLES,
	type FontRole,
	fontOptionForStack,
	fontToken,
	googleFontsHref,
	leadingFamily,
} from './fonts'
import { DARK_PRESETS, LIGHT_PRESETS, type SchemeValues } from './presets'
import { PreviewFrames, type PreviewPage } from './frames'
import { joinLightDark, type RegisteredToken, readRegisteredTokens, readThemeSource, splitLightDark } from './read-theme'

export type ThemeStudioProps = {
	/** Save the draft in localStorage under this key. The host renders
	 *  themeDraftBootScript(key) in its <head> so every page applies it.
	 *  Without a key the draft lasts while the studio is open. */
	storageKey?: string
	/** Pages of the host to preview in light and dark frames (same origin). */
	pages?: readonly PreviewPage[]
	class?: ClassProp
}

type Token = `--${string}`

type Ladder = SizeLadder & { steps: RegisteredToken[] }

type StudioModel = {
	draft: () => ThemeDraft
	/** The host's own value: its stylesheet winner, else a ladder's registered initial. */
	site: (token: string) => string | undefined
	/** ui-solid's value: the layered winner, else a ladder's registered initial. */
	library: (token: string) => string | undefined
	current: (token: string) => string | undefined
	isEdited: (token: string) => boolean
	set: (token: string, value: string | undefined) => void
	setSide: (token: string, scheme: Scheme, value: string) => void
	applyScheme: (scheme: Scheme, sides: ReadonlyMap<string, string>) => void
	/** Set scheme-independent tokens (a finish) whole. */
	applyWhole: (values: ReadonlyMap<string, string>) => void
	/** A colour anchor as the browser resolved it in a scheme. */
	resolved: (scheme: Scheme, token: string) => string
	/** Every token's current value: what a theme boundary declares. */
	themeStyle: () => Record<Token, string>
	ladders: readonly Ladder[]
	fontsHref: () => string | undefined
}

const StudioContext = createContext<StudioModel>()

/** Two values written differently but meaning the same (spacing, hex case). */
const same = (a: string, b: string) => a.replace(/\s+/g, '').toLowerCase() === b.replace(/\s+/g, '').toLowerCase()

/** The same in both schemes: `light-dark(x, x)` and `x` are one value. */
const sameInBoth = (a: string, b: string) => {
	const x = splitLightDark(a)
	const y = splitLightDark(b)
	return same(x.light, y.light) && same(x.dark, y.dark)
}

const isColor = (value: string) => value.trim() !== '' && CSS.supports('color', value)

/** Whether a typed value fits a registered step's syntax. Lengths and angles
 *  are judged by the engine; numbers and idents by shape, since an ident
 *  such as a corner-shape keyword may be one the engine has not learnt. */
const acceptsSyntax = (syntax: string, value: string): boolean => {
	const text = value.trim()
	if (text === '') return false
	switch (syntax) {
		case '<length>':
			return !text.includes('%') && CSS.supports('width', text)
		case '<length-percentage>':
			return CSS.supports('width', text)
		case '<number>':
			return Number.isFinite(Number(text))
		case '<angle>':
			return CSS.supports('rotate', text)
		case '<custom-ident>':
			return /^[a-z][\w-]*$/i.test(text)
		default:
			return CSS.supports('width', text)
	}
}

let hexContext: CanvasRenderingContext2D | null | undefined
/** sRGB hex for a resolved colour — what <input type="color"> accepts. */
const toHex = (color: string): string => {
	hexContext ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
	if (!hexContext || color === '') return '#000000'
	hexContext.clearRect(0, 0, 1, 1)
	hexContext.fillStyle = '#000000'
	hexContext.fillStyle = color
	hexContext.fillRect(0, 0, 1, 1)
	const [r = 0, g = 0, b = 0] = hexContext.getImageData(0, 0, 1, 1).data
	return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

export function ThemeStudio(props: ThemeStudioProps) {
	// One-time reads: the stylesheets as loaded, and the key the draft was saved under.
	const storageKey = untrack(() => props.storageKey)
	// Whether the host's pages apply this saved draft (its boot script says so).
	const sitewide = storageKey !== undefined && document.documentElement.getAttribute(DRAFT_BOOT_ATTRIBUTE) === storageKey
	const ladders: Ladder[] = SIZE_LADDERS.map((ladder) => ({ ...ladder, steps: readRegisteredTokens(document, ladder.prefix) }))
	const initials = new Map<string, string>()
	for (const ladder of ladders) for (const step of ladder.steps) initials.set(step.token, step.initial)
	const tokens: Token[] = [
		...COLOR_ANCHORS.map((anchor) => anchor.token),
		...FONT_TOKENS,
		...ladders.flatMap((ladder) => ladder.steps.map((step) => step.token)),
	]
	const source = readThemeSource(document, tokens)
	const site = (token: string) => source.site.get(token) ?? initials.get(token)
	const library = (token: string) => source.library.get(token) ?? initials.get(token)

	const [draft, setDraft] = createSignal<ThemeDraft>(storageKey ? readStoredDraft(storageKey) : {})

	const withValue = (d: ThemeDraft, token: string, value: string | undefined): ThemeDraft => {
		const next: Record<string, string> = { ...d }
		const own = site(token)
		if (value === undefined || (own !== undefined && sameInBoth(value, own))) delete next[token]
		else next[token] = value
		return next
	}
	const withSide = (d: ThemeDraft, token: string, scheme: Scheme, value: string): ThemeDraft => {
		const sides = splitLightDark(d[token] ?? site(token) ?? value)
		return withValue(d, token, joinLightDark({ ...sides, [scheme]: value }))
	}

	const themeStyle = createMemo(() => {
		const d = draft()
		const out: Record<Token, string> = {}
		for (const token of tokens) {
			const value = d[token] ?? site(token)
			if (value !== undefined) out[token] = value
		}
		return out
	})

	const fontsHref = createMemo(() => {
		const d = draft()
		const specs = FONT_ROLES.flatMap((role) => {
			const value = d[fontToken(role)]
			const spec = value === undefined ? undefined : fontOptionForStack(role, value)?.spec
			return spec === undefined ? [] : [spec]
		})
		return specs.length ? googleFontsHref(specs) : undefined
	})

	// Resolved colours per scheme, read from two hidden theme boundaries that
	// declare the current theme — the browser does the colour maths.
	let lightProbe: HTMLSpanElement | undefined
	let darkProbe: HTMLSpanElement | undefined
	const [resolved, setResolved] = createSignal<Record<Scheme, Record<string, string>>>({ light: {}, dark: {} })
	createEffect(
		() => themeStyle(),
		() => {
			const read = (el: HTMLElement) => {
				const computed = getComputedStyle(el)
				return Object.fromEntries(COLOR_ANCHORS.map((anchor) => [anchor.token, computed.getPropertyValue(anchor.token).trim()]))
			}
			if (lightProbe && darkProbe) setResolved({ light: read(lightProbe), dark: read(darkProbe) })
		},
	)

	// The draft on this document's root (and saved), as it changes.
	let onRoot: ThemeDraft = storageKey ? readStoredDraft(storageKey) : {}
	createEffect(
		() => ({ d: draft(), href: fontsHref() }),
		({ d, href }) => {
			applyDraft(document.documentElement, d, onRoot)
			onRoot = d
			applyDraftFonts(document, href)
			if (storageKey) writeStoredDraft(storageKey, d, href)
		},
	)
	onSettled(() => {
		ensureAllCandidatesLoaded(document)
		// Unsaved, the draft belongs to this visit only: take it off the page
		// when the studio closes. Saved, it stays — every page applies it.
		if (storageKey) return
		return () => {
			applyDraft(document.documentElement, {}, onRoot)
			applyDraftFonts(document, undefined)
		}
	})

	const model: StudioModel = {
		draft,
		site,
		library,
		current: (token) => draft()[token] ?? site(token),
		isEdited: (token) => token in draft(),
		set: (token, value) => setDraft((d) => withValue(d, token, value)),
		setSide: (token, scheme, value) => setDraft((d) => withSide(d, token, scheme, value)),
		applyScheme: (scheme, sides) =>
			setDraft((d) => [...sides].reduce((next, [token, value]) => withSide(next, token, scheme, value), d)),
		applyWhole: (values) => setDraft((d) => [...values].reduce((next, [token, value]) => withValue(next, token, value), d)),
		resolved: (scheme, token) => resolved()[scheme][token] ?? '',
		themeStyle,
		ladders,
		fontsHref,
	}

	// Pinned to the shipped theme: unset tokens fall back to their registered initials.
	const chromeStyle: Record<Token, string> = {}
	for (const token of tokens) chromeStyle[token] = source.site.get(token) ?? 'initial'

	const [confirmReset, setConfirmReset] = createSignal(false)
	const [copied, setCopied] = createSignal(false)
	let copiedTimer: ReturnType<typeof setTimeout> | undefined
	onSettled(() => () => clearTimeout(copiedTimer))

	const css = createMemo(() => themeCss(source.authored, tokens, draft(), site, fontsHref()))
	const copy = () => {
		void navigator.clipboard.writeText(css()).then(() => {
			setCopied(true)
			clearTimeout(copiedTimer)
			copiedTimer = setTimeout(() => setCopied(false), 1800)
		})
	}

	return (
		<StudioContext value={model}>
			<div class={['ui-theme', 'ui-studio', props.class]} style={chromeStyle}>
				<header class="ui-studio-head">
					<div class="ui-studio-head-text">
						<h1 class="ui-studio-title">Theme studio</h1>
						<p class="ui-studio-lede">
							{!storageKey
								? 'Changes last while this page is open. Copy the CSS to keep them.'
								: sitewide
									? 'Changes are saved in this browser, and every page of this site uses them, in any tab. Only you see them. Copy the CSS to make them permanent.'
									: 'Changes are saved in this browser. Only you see them. Copy the CSS to make them permanent.'}
						</p>
					</div>
					<div class="ui-studio-head-actions">
						<Show
							when={confirmReset()}
							fallback={
								<Button variant="outline" colorBase="neutral" disabled={Object.keys(draft()).length === 0} onClick={() => setConfirmReset(true)}>
									Reset all
								</Button>
							}
						>
							<span class="ui-studio-confirm">Discard every change?</span>
							<Button
								colorBase="error"
								onClick={() => {
									setDraft({})
									setConfirmReset(false)
								}}
							>
								Discard
							</Button>
							<Button variant="ghost" colorBase="neutral" onClick={() => setConfirmReset(false)}>
								Keep
							</Button>
						</Show>
						<Button onClick={copy}>{copied() ? 'Copied' : 'Copy CSS'}</Button>
					</div>
				</header>

				<div class="ui-studio-body">
					<aside class="ui-studio-editor" aria-label="Theme settings">
						<Accordion exclusive={false} spacing="separated" density="compact" label="Theme settings">
							<AccordionItem summary="Starting points">
								<PresetsSection />
							</AccordionItem>
							<AccordionItem summary="Colours" open>
								<ColoursSection />
							</AccordionItem>
							<AccordionItem summary="Fonts">
								<FontsSection />
							</AccordionItem>
							<For each={ladders}>
								{(ladder) => (
									<AccordionItem summary={ladder.label}>
										<LadderSection ladder={ladder} />
									</AccordionItem>
								)}
							</For>
							<AccordionItem summary="CSS">
								<p class="ui-studio-note">
									The theme block for your stylesheet: everything your site already sets, with the changes marked. Replace your
									current block with it.
								</p>
								<pre class="ui-studio-css">{css()}</pre>
								<Button variant="soft" onClick={copy}>
									{copied() ? 'Copied' : 'Copy CSS'}
								</Button>
							</AccordionItem>
						</Accordion>
					</aside>

					<div class="ui-studio-previews">
						<Show when={props.pages && props.pages.length > 0 ? props.pages : undefined}>
							{(pages) => (
								<section class="ui-studio-preview" aria-label="Pages">
									<Eyebrow>Pages</Eyebrow>
									<PreviewFrames pages={pages()} draft={draft()} fontsHref={fontsHref()} />
								</section>
							)}
						</Show>
						<section class="ui-studio-preview" aria-label="Components">
							<Eyebrow>Components</Eyebrow>
							<Catalogue themeStyle={themeStyle()} ladders={ladders} />
						</section>
					</div>
				</div>

				<span ref={lightProbe} class="ui-theme ui-studio-probe" style={{ ...themeStyle(), 'color-scheme': 'light' }} hidden />
				<span ref={darkProbe} class="ui-theme ui-studio-probe" style={{ ...themeStyle(), 'color-scheme': 'dark' }} hidden />
			</div>
		</StudioContext>
	)
}

/** The theme block to paste: what the site authored plus every change. */
function themeCss(
	authored: ReadonlySet<string>,
	tokens: readonly string[],
	draft: ThemeDraft,
	site: (token: string) => string | undefined,
	fontsHref: string | undefined,
): string {
	const lines = [':root {', '\tcolor-scheme: light dark;']
	for (const token of tokens) {
		const edited = token in draft
		if (!edited && !authored.has(token)) continue
		const value = draft[token] ?? site(token)
		// Re-joined so a minified stylesheet's `light-dark(a,b)` reads `light-dark(a, b)`.
		if (value !== undefined) lines.push(`\t${token}: ${joinLightDark(splitLightDark(value))};${edited ? ' /* changed */' : ''}`)
	}
	lines.push('}')
	if (fontsHref) lines.push('', `/* Load the changed fonts with:`, `   <link rel="stylesheet" href="${fontsHref}" /> */`)
	return lines.join('\n')
}

// ── Starting points ─────────────────────────────────────────────────────────

type Starting = {
	name: string
	note: string
	sides: ReadonlyMap<Token, string>
	/** Scheme-independent tokens the card sets whole (a shipped theme's finish). */
	whole?: ReadonlyMap<Token, string>
}

const presetSides = (values: SchemeValues): ReadonlyMap<Token, string> => {
	const sides = new Map<Token, string>()
	for (const anchor of COLOR_ANCHORS) {
		const value = values[anchor.key]
		if (value !== undefined) sides.set(anchor.token, value)
	}
	return sides
}

function PresetsSection() {
	const model = useContext(StudioContext)
	const rail = (scheme: Scheme): Starting[] => {
		const sidesOf = (value: (token: string) => string | undefined) => {
			const sides = new Map<Token, string>()
			for (const anchor of COLOR_ANCHORS) {
				const v = value(anchor.token)
				if (v !== undefined) sides.set(anchor.token, splitLightDark(v)[scheme])
			}
			return sides
		}
		return [
			{ name: 'This site', note: 'The theme the site ships', sides: sidesOf(model.site) },
			{ name: 'ui-solid', note: "ui-solid's own defaults", sides: sidesOf(model.library) },
			...(scheme === 'light' ? LIGHT_PRESETS : DARK_PRESETS).map((preset) => ({
				name: preset.name,
				note: preset.note,
				sides: presetSides(preset.values),
				whole: preset.finish,
			})),
		]
	}
	return (
		<div class="ui-studio-presets">
			<p class="ui-studio-note">
				A card sets the colours it names for one scheme and leaves the rest as they are. Light and dark are chosen separately. A
				shipped theme’s card also sets its surface finish, which is the same in both schemes.
			</p>
			<For each={SCHEMES}>
				{(scheme) => (
					<div class="ui-studio-rail">
						<Eyebrow>{scheme === 'light' ? 'Light' : 'Dark'}</Eyebrow>
						<div class="ui-studio-rail-cards">
							<For each={rail(scheme)}>
								{(start) => (
									<PresetCard
										scheme={scheme}
										start={start}
										onApply={() => {
											model.applyScheme(scheme, start.sides)
											if (start.whole) model.applyWhole(start.whole)
										}}
									/>
								)}
							</For>
						</div>
					</div>
				)}
			</For>
		</div>
	)
}

const PREVIEW_TOKENS = ['--color-base-100', '--color-base-content', '--color-primary', '--color-secondary', '--color-accent', '--color-success']

function PresetCard(props: { scheme: Scheme; start: Starting; onApply: () => void }) {
	const model = useContext(StudioContext)
	// The card is a plate under the theme it offers, finish included.
	const style = (): JSX.CSSProperties => {
		const anchors: Record<Token, string> = { ...model.themeStyle() }
		for (const [token, value] of props.start.sides) anchors[token] = value
		for (const [token, value] of props.start.whole ?? []) anchors[token] = value
		return { ...anchors, 'color-scheme': props.scheme }
	}
	return (
		<button
			type="button"
			class="ui-theme ui-studio-card"
			data-ui-plate=""
			style={style()}
			onClick={() => props.onApply()}
			title={`Use ${props.start.name} for ${props.scheme}`}
		>
			<span class="ui-studio-card-dots" aria-hidden="true">
				<For each={PREVIEW_TOKENS}>{(token) => <span style={{ background: `var(${token})` }} />}</For>
			</span>
			<span class="ui-studio-card-name">{props.start.name}</span>
			<span class="ui-studio-card-note">{props.start.note}</span>
		</button>
	)
}

// ── Colours ─────────────────────────────────────────────────────────────────

function ColoursSection() {
	return (
		<div class="ui-studio-anchors">
			<p class="ui-studio-note">
				Each colour has a light and a dark value. Pick a colour, or type any CSS colour (oklch, hsl, a var()). Surfaces, borders and
				the readable text on each colour are worked out from these.
			</p>
			<For each={COLOR_ANCHORS}>{(anchor) => <AnchorRow anchor={anchor} />}</For>
		</div>
	)
}

function AnchorRow(props: { anchor: ColorAnchor }) {
	const model = useContext(StudioContext)
	return (
		<div class="ui-studio-anchor">
			<div class="ui-studio-anchor-head">
				<strong>{props.anchor.label}</strong>
				<code>{props.anchor.token}</code>
				<Show when={model.isEdited(props.anchor.token)}>
					<Button class="ui-studio-reset" variant="text" colorBase="neutral" onClick={() => model.set(props.anchor.token, undefined)}>
						Undo changes
					</Button>
				</Show>
			</div>
			<p class="ui-studio-note">{props.anchor.note}</p>
			<div class="ui-studio-sides">
				<For each={SCHEMES}>{(scheme) => <AnchorSide anchor={props.anchor} scheme={scheme} />}</For>
			</div>
		</div>
	)
}

function AnchorSide(props: { anchor: ColorAnchor; scheme: Scheme }) {
	const model = useContext(StudioContext)
	const side = () => splitLightDark(model.current(props.anchor.token) ?? '')[props.scheme]
	const siteSide = () => splitLightDark(model.site(props.anchor.token) ?? '')[props.scheme]
	const changed = () => !same(side(), siteSide())
	const name = () => `${props.anchor.label}, ${props.scheme}`
	return (
		<div class="ui-studio-side" data-scheme={props.scheme}>
			<span class="ui-studio-side-label">
				{props.scheme === 'light' ? 'Light' : 'Dark'}
				<Show when={changed()}>
					<span class="ui-studio-changed"> · changed</span>
				</Show>
			</span>
			<div class="ui-studio-side-controls">
				<input
					type="color"
					class="ui-studio-swatch"
					aria-label={`${name()}: pick a colour`}
					value={toHex(model.resolved(props.scheme, props.anchor.token))}
					onInput={(event) => model.setSide(props.anchor.token, props.scheme, event.currentTarget.value)}
				/>
				<TextInput
					class="ui-studio-value"
					aria-label={`${name()}: CSS colour`}
					spellcheck={false}
					value={side()}
					onChange={(event) => {
						const value = event.currentTarget.value.trim()
						if (isColor(value)) model.setSide(props.anchor.token, props.scheme, value)
						else event.currentTarget.value = side()
					}}
				/>
			</div>
			<div class="ui-studio-side-actions">
				<Show when={props.anchor.follows}>
					{(follows) => (
						<Button
							variant={same(side(), follows().value) ? 'soft' : 'ghost'}
							colorBase="neutral"
							pressed={same(side(), follows().value)}
							onClick={() => model.setSide(props.anchor.token, props.scheme, follows().value)}
						>
							{follows().label}
						</Button>
					)}
				</Show>
				<Show when={changed()}>
					<Button variant="text" colorBase="neutral" onClick={() => model.setSide(props.anchor.token, props.scheme, siteSide())}>
						Undo
					</Button>
				</Show>
			</div>
		</div>
	)
}

// ── Fonts ───────────────────────────────────────────────────────────────────

function FontsSection() {
	return (
		<div class="ui-studio-fonts">
			<p class="ui-studio-note">Fonts are the same in light and dark. Each list shows its families in their own face.</p>
			<For each={FONT_ROLES}>{(role) => <FontRoleField role={role} />}</For>
		</div>
	)
}

function FontRoleField(props: { role: FontRole }) {
	const model = useContext(StudioContext)
	const token = () => fontToken(props.role)
	const choice = () => {
		const value = model.draft()[token()]
		if (value === undefined) return 'site'
		const library = model.library(token())
		if (library !== undefined && same(value, library)) return 'library'
		const option = fontOptionForStack(props.role, value)
		return option && leadingFamily(value) !== familyOf(model.site(token())) ? option.id : 'site'
	}
	const familyOf = (stack: string | undefined) => (stack === undefined ? undefined : leadingFamily(stack))
	const siteLabel = () => {
		const family = familyOf(model.site(token()))
		return family ? `This site: ${family}` : props.role === 'label' ? 'This site: the data font' : 'This site'
	}
	const libraryFamily = () => {
		const library = familyOf(model.library(token()))
		return library !== undefined && library !== familyOf(model.site(token())) ? library : undefined
	}
	const onChoose = (id: string) => {
		if (id === 'site') model.set(token(), undefined)
		else if (id === 'library') model.set(token(), model.library(token()))
		else model.set(token(), FONT_OPTIONS[props.role].find((option) => option.id === id)?.stack)
	}
	return (
		<div class="ui-studio-font">
			<label class="ui-studio-font-label" for={`ui-studio-font-${props.role}`}>
				<strong>{FONT_ROLE_NAMES[props.role].label}</strong>
				<code>{token()}</code>
			</label>
			<p class="ui-studio-note">{FONT_ROLE_NAMES[props.role].note}</p>
			<SelectControl id={`ui-studio-font-${props.role}`} class="ui-studio-font-select" value={choice()} onChange={(event) => onChoose(event.currentTarget.value)}>
				<option value="site">
					<span style={{ 'font-family': model.site(token()) ?? model.site('--font-data') }}>{siteLabel()}</span>
				</option>
				<Show when={libraryFamily()}>
					{(family) => (
						<option value="library">
							<span style={{ 'font-family': model.library(token()) }}>ui-solid: {family()}</span>
						</option>
					)}
				</Show>
				{/* The site's own family is the first entry already. */}
				<For each={FONT_OPTIONS[props.role].filter((option) => option.stack !== undefined && leadingFamily(option.stack) !== familyOf(model.site(token())))}>
					{(option) => (
						<option value={option.id}>
							<span style={{ 'font-family': option.stack }}>{option.label}</span>
						</option>
					)}
				</For>
			</SelectControl>
			<p class="ui-studio-font-specimen" style={{ 'font-family': model.current(token()) ?? model.current('--font-data') }}>
				Sphinx of black quartz, judge my vow · 0123456789
			</p>
		</div>
	)
}

// ── Size ladders ────────────────────────────────────────────────────────────

function LadderSection(props: { ladder: Ladder }) {
	const model = useContext(StudioContext)
	// The surface finish is one look made of every step, so it has one
	// specimen above its rows, carrying the draft's values into the chrome.
	const finish = (): Record<Token, string> => {
		const out: Record<Token, string> = {}
		for (const step of props.ladder.steps) out[step.token] = model.current(step.token) ?? step.initial
		return out
	}
	return (
		<div class="ui-studio-ladder">
			<p class="ui-studio-note">{props.ladder.note} The same in light and dark.</p>
			<Show when={props.ladder.specimen === 'surface'}>
				<PlateSpecimen style={finish()} />
			</Show>
			<For each={props.ladder.steps}>{(step) => <LadderRow ladder={props.ladder} step={step} />}</For>
		</div>
	)
}

function LadderRow(props: { ladder: Ladder; step: RegisteredToken }) {
	const model = useContext(StudioContext)
	const value = () => model.current(props.step.token) ?? props.step.initial
	return (
		<div class="ui-studio-step">
			<code class="ui-studio-step-name">{props.step.token}</code>
			<TextInput
				class="ui-studio-step-value"
				aria-label={`${props.ladder.label}: ${props.step.token}`}
				spellcheck={false}
				value={value()}
				onChange={(event) => {
					const next = event.currentTarget.value.trim()
					if (acceptsSyntax(props.step.syntax, next)) model.set(props.step.token, next)
					else event.currentTarget.value = value()
				}}
			/>
			<span class="ui-studio-step-sample" aria-hidden="true">
				<Switch>
					<Match when={props.ladder.specimen === 'type'}>
						<span style={{ 'font-size': value() }}>Aa</span>
					</Match>
					<Match when={props.ladder.specimen === 'radius'}>
						<span class="ui-studio-radius-sample" style={{ 'border-radius': value() }} />
					</Match>
				</Switch>
			</span>
			<Show when={model.isEdited(props.step.token)}>
				<Button variant="text" colorBase="neutral" onClick={() => model.set(props.step.token, undefined)}>
					Undo
				</Button>
			</Show>
		</div>
	)
}
