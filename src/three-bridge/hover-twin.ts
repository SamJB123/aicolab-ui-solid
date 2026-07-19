// Auto-twin :hover rules — consumers write ordinary `:hover` CSS; captures
// can't engage native :hover on the invisible layoutsubtree child (geometric/
// trusted-only — curved-slide-scene.ts:778, confirmed there), so the bridge
// clones every reachable `:hover` rule into a `.bridge-hover` twin and the
// panel machine toggles that class on the resolved control. Polyfill path
// keeps real UA :hover and is left alone (panel gates on `native`).

const TWIN_CLASS = 'bridge-hover'
const ACTIVE_TWIN_CLASS = 'bridge-active'

let sheet: CSSStyleSheet | null = null
let hoverSelectors: string[] = []

function twinSelector(selector: string, pseudo: ':hover' | ':active', cls: string): string {
	return selector
		.split(',')
		.map((s) => s.replaceAll(pseudo, `.${cls}`))
		.join(',')
}

/** (Re)build the twin stylesheet from every same-origin stylesheet. Call at
 *  install and again if the app knows its styles changed. */
export function refreshHoverTwins(): void {
	if (!sheet) {
		sheet = new CSSStyleSheet()
		document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
	}
	const rules: string[] = []
	const selectors: string[] = []
	for (const ss of Array.from(document.styleSheets)) {
		let cssRules: CSSRuleList
		try {
			cssRules = ss.cssRules
		} catch {
			continue // cross-origin sheet
		}
		for (const rule of Array.from(cssRules)) {
			if (!(rule instanceof CSSStyleRule)) continue
			const sel = rule.selectorText
			if (sel.includes(':hover')) {
				rules.push(`${twinSelector(sel, ':hover', TWIN_CLASS)}{${rule.style.cssText}}`)
				// Bare element selectors for target resolution: strip the pseudo.
				for (const part of sel.split(',')) {
					if (part.includes(':hover')) selectors.push(part.replaceAll(':hover', '').trim() || '*')
				}
			}
			if (sel.includes(':active')) {
				rules.push(`${twinSelector(sel, ':active', ACTIVE_TWIN_CLASS)}{${rule.style.cssText}}`)
			}
		}
	}
	hoverSelectors = selectors
	sheet.replaceSync(rules.join('\n'))
}

/** The nearest ancestor of `el` (within `root`) that any authored :hover rule
 *  targets — the hover/active/cursor treatment target (the generic form of
 *  curved-slide's `closest('[data-probe]')`). */
export function hoverTargetFor(el: HTMLElement | null, root: HTMLElement): HTMLElement | null {
	if (!el || hoverSelectors.length === 0) return null
	const joined = hoverSelectors.join(',')
	let node: HTMLElement | null = el
	while (node && root.contains(node)) {
		try {
			if (node.matches(joined)) return node
		} catch {
			return null // a selector the engine rejects — fail open, no hover
		}
		node = node.parentElement
	}
	return null
}

export const HOVER_TWIN_CLASS = TWIN_CLASS
export const ACTIVE_TWIN = ACTIVE_TWIN_CLASS
