// Reads a document's theme from its stylesheets: for each contract token, the
// declaration that wins on the root element, as written (`light-dark(…)`,
// `var(…)`), not as computed. The written form is what a theme edits: a side
// left alone keeps its expression (a derivation stays live), and an export
// writes the theme back the way it was authored.
//
// The winner is chosen the way the cascade chooses it: importance, then
// cascade layer, then specificity, then source order. A declaration outside
// every layer is the APP's (ui-solid ships everything layered, and unlayered
// app CSS outranks it — see README "Developing"); a layered winner is the
// library's. Rules nested inside a style rule, and rules under @container,
// @scope or @starting-style, are not theme blocks and are not read.

import type { Scheme } from './contract'

export type ThemeSource = {
	/** The winning declaration on the root, from any stylesheet. */
	site: ReadonlyMap<string, string>
	/** The winning declaration among layered (library) rules only. */
	library: ReadonlyMap<string, string>
	/** Tokens whose site winner is unlayered — the ones the app authored. */
	authored: ReadonlySet<string>
}

type Candidate = {
	value: string
	important: boolean
	/** Cascade-layer precedence key; see LayerOrder. */
	layer: readonly number[]
	specificity: readonly number[]
	order: number
}

const OUTSIDE_LAYERS = Number.POSITIVE_INFINITY

const compareKeys = (a: readonly number[], b: readonly number[]): number => {
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const x = a[i] ?? -1
		const y = b[i] ?? -1
		if (x !== y) return x < y ? -1 : 1
	}
	return 0
}

/** Layer precedence as the cascade defines it: sibling layers rank by first
 *  appearance; a layer's own declarations outrank its sub-layers; anything
 *  outside every layer outranks all layers. Each declaration gets a key — its
 *  layer path's sibling indices, then OUTSIDE_LAYERS for "own" — and keys
 *  compare lexicographically. */
class LayerOrder {
	#index = new Map<string, number>()
	#children = new Map<string, number>()
	#anonymous = 0

	anonymousName(): string {
		this.#anonymous += 1
		return `\u0000anonymous-${this.#anonymous}`
	}

	key(path: readonly string[]): number[] {
		const key: number[] = []
		for (let depth = 0; depth < path.length; depth++) {
			const parent = path.slice(0, depth).join('.')
			const name = path.slice(0, depth + 1).join('.')
			let index = this.#index.get(name)
			if (index === undefined) {
				index = this.#children.get(parent) ?? 0
				this.#children.set(parent, index + 1)
				this.#index.set(name, index)
			}
			key.push(index)
		}
		key.push(OUTSIDE_LAYERS)
		return key
	}
}

const beats = (a: Candidate, b: Candidate): boolean => {
	if (a.important !== b.important) return a.important
	// Important declarations reverse layer order.
	const layer = compareKeys(a.layer, b.layer) * (a.important ? -1 : 1)
	if (layer !== 0) return layer > 0
	const specificity = compareKeys(a.specificity, b.specificity)
	if (specificity !== 0) return specificity > 0
	return a.order > b.order
}

/** Split at top-level commas (outside parentheses, brackets and quotes). */
const splitTopLevel = (text: string): string[] => {
	const parts: string[] = []
	let depth = 0
	let quote = ''
	let start = 0
	for (let i = 0; i < text.length; i++) {
		const ch = text[i]
		if (quote) {
			if (ch === '\\') i++
			else if (ch === quote) quote = ''
		} else if (ch === '"' || ch === "'") quote = ch
		else if (ch === '(' || ch === '[') depth++
		else if (ch === ')' || ch === ']') depth--
		else if (ch === ',' && depth === 0) {
			parts.push(text.slice(start, i).trim())
			start = i + 1
		}
	}
	parts.push(text.slice(start).trim())
	return parts.filter((part) => part !== '')
}

const IDENT = /[-\w -￿\\]/
const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter'])
const max = (values: number[][]): number[] => values.reduce((best, v) => (compareKeys(v, best) > 0 ? v : best), [0, 0, 0])

/** Selectors Level 4 specificity as [ids, classes, types]. */
export function specificity(selector: string): number[] {
	const total = [0, 0, 0]
	const add = (s: readonly number[]) => {
		total[0] += s[0] ?? 0
		total[1] += s[1] ?? 0
		total[2] += s[2] ?? 0
	}
	let i = 0
	const readIdent = () => {
		const start = i
		while (i < selector.length && IDENT.test(selector[i] ?? '')) i++
		return selector.slice(start, i)
	}
	const readArgs = () => {
		// selector[i] is '('.
		let depth = 0
		const start = i + 1
		for (; i < selector.length; i++) {
			if (selector[i] === '(') depth++
			else if (selector[i] === ')' && --depth === 0) break
		}
		const args = selector.slice(start, i)
		i++
		return args
	}
	while (i < selector.length) {
		const ch = selector[i] ?? ''
		if (ch === '#') {
			i++
			readIdent()
			add([1, 0, 0])
		} else if (ch === '.') {
			i++
			readIdent()
			add([0, 1, 0])
		} else if (ch === '[') {
			while (i < selector.length && selector[i] !== ']') i++
			i++
			add([0, 1, 0])
		} else if (ch === ':') {
			const element = selector[i + 1] === ':'
			i += element ? 2 : 1
			const name = readIdent().toLowerCase()
			const args = selector[i] === '(' ? readArgs() : undefined
			if (element || LEGACY_PSEUDO_ELEMENTS.has(name)) add([0, 0, 1])
			else if (name === 'where') add([0, 0, 0])
			else if (name === 'is' || name === 'not' || name === 'has' || name === 'matches')
				add(max(splitTopLevel(args ?? '').map(specificity)))
			else add([0, 1, 0])
		} else if (IDENT.test(ch)) {
			readIdent()
			add([0, 0, 1])
		} else i++
	}
	return total
}

/** The highest specificity among a selector list's members that match `el`,
 *  or undefined when none does. */
const matchingSpecificity = (el: Element, selectorText: string): number[] | undefined => {
	let best: number[] | undefined
	for (const part of splitTopLevel(selectorText)) {
		let matches = false
		try {
			matches = el.matches(part)
		} catch {
			matches = false
		}
		if (!matches) continue
		const s = specificity(part)
		if (!best || compareKeys(s, best) > 0) best = s
	}
	return best
}

/** Read every contract token's winning declaration on `doc`'s root. */
export function readThemeSource(doc: Document, tokens: readonly string[]): ThemeSource {
	const view = doc.defaultView
	const root = doc.documentElement
	const wanted = new Set(tokens)
	const candidates = new Map<string, Candidate[]>()
	const layers = new LayerOrder()
	let order = 0
	if (!view) return { site: new Map(), library: new Map(), authored: new Set() }

	const mediaMatches = (media: MediaList) => media.length === 0 || view.matchMedia(media.mediaText).matches
	const layerPath = (base: readonly string[] | null, name: string): string[] => [
		...(base ?? []),
		...(name === '' ? [layers.anonymousName()] : name.split('.')),
	]

	const walk = (rules: CSSRuleList, path: readonly string[] | null) => {
		for (const rule of Array.from(rules)) {
			if (rule instanceof view.CSSImportRule) {
				if (!mediaMatches(rule.media)) continue
				if (rule.supportsText && !view.CSS.supports(rule.supportsText)) continue
				const inner = rule.layerName === null ? path : layerPath(path, rule.layerName)
				if (inner) layers.key(inner)
				let sheetRules: CSSRuleList | undefined
				try {
					sheetRules = rule.styleSheet?.cssRules
				} catch {
					sheetRules = undefined
				}
				if (sheetRules) walk(sheetRules, inner)
			} else if (rule instanceof view.CSSLayerStatementRule) {
				for (const name of Array.from(rule.nameList)) layers.key(layerPath(path, name))
			} else if (rule instanceof view.CSSLayerBlockRule) {
				const inner = layerPath(path, rule.name)
				layers.key(inner)
				walk(rule.cssRules, inner)
			} else if (rule instanceof view.CSSMediaRule) {
				if (mediaMatches(rule.media)) walk(rule.cssRules, path)
			} else if (rule instanceof view.CSSSupportsRule) {
				if (view.CSS.supports(rule.conditionText)) walk(rule.cssRules, path)
			} else if (rule instanceof view.CSSStyleRule) {
				const s = matchingSpecificity(root, rule.selectorText)
				if (!s) continue
				const layer = path ? layers.key(path) : [OUTSIDE_LAYERS]
				for (const token of wanted) {
					const value = rule.style.getPropertyValue(token).trim()
					if (value === '') continue
					const list = candidates.get(token) ?? []
					list.push({
						value,
						important: rule.style.getPropertyPriority(token) === 'important',
						layer,
						specificity: s,
						order: order++,
					})
					candidates.set(token, list)
				}
			}
		}
	}

	for (const sheet of Array.from(doc.styleSheets)) {
		if (sheet.disabled || !mediaMatches(sheet.media)) continue
		let rules: CSSRuleList
		try {
			rules = sheet.cssRules
		} catch {
			// A cross-origin sheet (a font provider's) is unreadable and holds no theme.
			continue
		}
		walk(rules, null)
	}

	const site = new Map<string, string>()
	const library = new Map<string, string>()
	const authored = new Set<string>()
	for (const [token, list] of candidates) {
		const winner = (pool: Candidate[]) => pool.reduce<Candidate | undefined>((best, c) => (!best || beats(c, best) ? c : best), undefined)
		const all = winner(list)
		const layered = winner(list.filter((c) => c.layer[0] !== OUTSIDE_LAYERS))
		if (all) site.set(token, all.value)
		if (layered) library.set(token, layered.value)
		if (all && all.layer[0] === OUTSIDE_LAYERS) authored.add(token)
	}
	return { site, library, authored }
}

export type RegisteredToken = { token: `--${string}`; initial: string }

const isCustomProperty = (name: string): name is `--${string}` => name.startsWith('--')

/** The `@property` registrations whose names start with `prefix`, in source
 *  order, with their initial values (ui-solid's defaults for the ladders). */
export function readRegisteredTokens(doc: Document, prefix: `--${string}`): RegisteredToken[] {
	const view = doc.defaultView
	if (!view) return []
	const found = new Map<`--${string}`, string>()
	const walk = (rules: CSSRuleList) => {
		for (const rule of Array.from(rules)) {
			if (rule instanceof view.CSSPropertyRule) {
				const name = rule.name
				if (isCustomProperty(name) && name.startsWith(prefix) && !found.has(name)) found.set(name, rule.initialValue ?? '')
			} else if (rule instanceof view.CSSImportRule) {
				let sheetRules: CSSRuleList | undefined
				try {
					sheetRules = rule.styleSheet?.cssRules
				} catch {
					sheetRules = undefined
				}
				if (sheetRules) walk(sheetRules)
			} else if (rule instanceof view.CSSGroupingRule) walk(rule.cssRules)
		}
	}
	for (const sheet of Array.from(doc.styleSheets)) {
		let rules: CSSRuleList
		try {
			rules = sheet.cssRules
		} catch {
			continue
		}
		walk(rules)
	}
	return [...found].map(([token, initial]) => ({ token, initial }))
}

/** A value's two sides. `light-dark(a, b)` splits; anything else is the same
 *  value in both schemes. */
export function splitLightDark(value: string): Record<Scheme, string> {
	const text = value.trim()
	const match = /^light-dark\(/i.exec(text)
	if (match && text.endsWith(')')) {
		const parts = splitTopLevel(text.slice(match[0].length, -1))
		const [light, dark] = parts
		if (parts.length === 2 && light !== undefined && dark !== undefined) return { light, dark }
	}
	return { light: text, dark: text }
}

/** The inverse of splitLightDark: equal sides collapse to one value. */
export const joinLightDark = (sides: Record<Scheme, string>): string =>
	sides.light === sides.dark ? sides.light : `light-dark(${sides.light}, ${sides.dark})`
