import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const [resolver, accordion, selectControl, button, formControl, iconButton, holdButton, mark, notice, accordionItem, carousel, workspace, prosekit] = await Promise.all([
	read('../src/resolver.css'),
	read('../src/molecules/accordion/styles.css'),
	read('../src/atoms/select-control/styles.css'),
	read('../src/atoms/button/styles.css'),
	read('../src/atoms/form-control/styles.css'),
	read('../src/atoms/icon-button/styles.css'),
	read('../src/atoms/hold-button/styles.css'),
	read('../src/atoms/mark/styles.css'),
	read('../src/atoms/notice/styles.css'),
	read('../src/atoms/accordion-item/styles.css'),
	read('../src/molecules/carousel/styles.css'),
	read('../src/organisms/workspace/styles.css'),
	read('../src/prosekit-solid/styles.css'),
])

const requireAll = (source, expressions, contract) => {
	for (const expression of expressions) {
		assert.match(source, expression, `${contract}: missing ${expression}`)
	}
}

/* Compatibility contract: keep these checks until the corresponding comments
   say the feature has reached the supported Baseline floor. At that point the
   fallback and its assertion should be removed together. */
requireAll(
	resolver,
	['secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'].map(
		(base) => new RegExp(`data-ui-color-base="${base}"`),
	),
	'colour resolver base axis',
)
requireAll(
	resolver,
	[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map(
		(level) => new RegExp(`data-ui-color-level="${level}"`),
	),
	'colour resolver level axis',
)
requireAll(
	resolver,
	['soft', 'outline', 'ghost', 'text'].map(
		(variant) => new RegExp(`data-ui-color-variant="${variant}"`),
	),
	'colour resolver variant axis',
)
requireAll(
	resolver,
	[
		/@supports \(width: attr\(data-ui-compat-probe type\(<length>\), 0px\)\)/,
		/@supports at-rule\(@function\)/,
		/@function --ui-color-at-level/,
		/color: if\(style\(--ui-compat-probe: yes\): red; else: blue\)/,
	],
	'frontier resolver boundary',
)

requireAll(
	accordion,
	[
		/data-ui-accordion-spacing="separated"/,
		/data-ui-accordion-density="compact"/,
		/@container ui-accordion style\(--ui-accordion-spacing: separated\)/,
		/@container ui-accordion style\(--ui-accordion-density: compact\)/,
	],
	'accordion style-query fallback',
)
requireAll(
	selectControl,
	[
		/@supports \(appearance: base-select\)/,
		/@supports \(width: attr\(data-ui-compat-probe type\(<length>\), 0px\)\)/,
		/@property --_ui-select-radius \{\n\tsyntax: "<length-percentage>";/,
		/--_ui-select-radius: var\(--ui-select-radius, var\(--r-md\)\)/,
		/--_ui-select-radius: attr\(data-ui-select-radius type\(<length-percentage>\), var\(--ui-select-radius, var\(--r-md\)\)\)/,
		/--_ui-select-hover-border: var\(--ui-select-hover-border, var\(--ui-border-hover\)\)/,
		/--_ui-select-hover-border: attr\(data-ui-select-hover-border type\(<color>\), var\(--ui-select-hover-border, var\(--ui-border-hover\)\)\)/,
	],
	'select-control knob boundary',
)
requireAll(
	button,
	[
		/@supports \(width: attr\(data-ui-compat-probe type\(<length>\), 0px\)\)/,
		/@property --_ui-btn-radius \{\n\tsyntax: "<length-percentage>";/,
		/--_ui-btn-radius: var\(--ui-btn-radius, var\(--r-pill\)\)/,
		/--_ui-btn-radius: attr\(data-ui-btn-radius type\(<length-percentage>\), var\(--ui-btn-radius, var\(--r-pill\)\)\)/,
		/--_ui-btn-pad-inline: var\(--ui-btn-pad-inline, 4px\)/,
		/--_ui-btn-pad-inline: attr\(data-ui-btn-pad-inline type\(<length>\), var\(--ui-btn-pad-inline, 4px\)\)/,
	],
	'button knob boundary',
)
requireAll(
	formControl,
	[
		/@supports \(width: attr\(data-ui-compat-probe type\(<length>\), 0px\)\)/,
		/--_ui-input-radius: var\(--ui-input-radius, var\(--r-xs\)\)/,
		/--_ui-input-radius: attr\(data-ui-input-radius type\(<length-percentage>\), var\(--ui-input-radius, var\(--r-xs\)\)\)/,
		/--_ui-input-placeholder-ink: var\(--ui-input-placeholder-ink, var\(--color-base-content-faint\)\)/,
		/--_ui-input-placeholder-ink: attr\(data-ui-input-placeholder-ink type\(<color>\), var\(--ui-input-placeholder-ink, var\(--color-base-content-faint\)\)\)/,
		/--_ui-input-min-height: var\(--ui-input-min-height, 5rem\)/,
		/--_ui-range-accent: attr\(data-ui-range-accent type\(<color>\), var\(--ui-range-accent, var\(--ui-color\)\)\)/,
	],
	'form-control knob boundary',
)
requireAll(
	iconButton,
	[
		/@supports \(width: attr\(data-ui-compat-probe type\(<length>\), 0px\)\)/,
		/--_ui-iconbtn-size: var\(--ui-iconbtn-size, 30px\)/,
		/--_ui-iconbtn-size: attr\(data-ui-iconbtn-size type\(<length>\), var\(--ui-iconbtn-size, 30px\)\)/,
	],
	'icon-button knob boundary',
)
requireAll(
	holdButton,
	[
		/--_ui-hold-size: var\(--ui-hold-size, 4\.25rem\)/,
		/--_ui-hold-size: attr\(data-ui-hold-size type\(<length>\), var\(--ui-hold-size, 4\.25rem\)\)/,
	],
	'hold-button knob boundary',
)
requireAll(
	mark,
	[
		/--_ui-mark-ink: var\(--ui-mark-ink, var\(--color-primary\)\)/,
		/--_ui-mark-ink: attr\(data-ui-mark-ink type\(<color>\), var\(--ui-mark-ink, var\(--color-primary\)\)\)/,
	],
	'mark knob boundary',
)
requireAll(
	notice,
	[
		/--_ui-notice-radius: var\(--ui-notice-radius, var\(--r-xs\)\)/,
		/--_ui-notice-radius: attr\(data-ui-notice-radius type\(<length-percentage>\), var\(--ui-notice-radius, var\(--r-xs\)\)\)/,
	],
	'notice knob boundary',
)
requireAll(
	accordionItem,
	[
		/--_ui-acc-divider: var\(--ui-acc-divider, var\(--color-border\)\)/,
		/--_ui-acc-divider: attr\(data-ui-acc-divider type\(<color>\), var\(--ui-acc-divider, var\(--color-border\)\)\)/,
		/--_ui-acc-icon-ink: var\(--ui-acc-icon-ink, var\(--color-primary\)\)/,
	],
	'accordion-item knob boundary',
)
requireAll(
	carousel,
	[/@supports \(scroll-marker-group: after\).*selector\(::scroll-marker\).*selector\(::scroll-button\(left\)\)/],
	'CSS carousel boundary',
)
requireAll(workspace, [/@supports \(container-type: scroll-state\)/], 'workspace scroll-state boundary')
requireAll(prosekit, [/@supports \(container-type: scroll-state\)/], 'ProseKit scroll-state boundary')

/* ── Generic knob-wire pairing check (all atoms, ALL knobs) ──────────────
   Parses every atom stylesheet and enforces, for every knob:
   1. each frontier attr() assignment reads the attribute pairing its public
      variable (data-ui-x ⇄ --ui-x);
   2. each frontier assignment's fallback is byte-identical to a compat
      assignment of the same adapter — the two wires cannot disagree;
   3. every @property-registered private adapter is assigned somewhere, and
      every assigned adapter is registered.
   Knobs consumed on descendants/child-state contexts legitimately have no
   attr() swap (attr() reads only the matched element) — they simply
   contribute no frontier lines. */
const atomsDir = new URL('../src/atoms/', import.meta.url)
for (const entry of readdirSync(atomsDir, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue
	let source
	try {
		source = await read(`../src/atoms/${entry.name}/styles.css`)
	} catch {
		continue
	}
	const registered = new Set([...source.matchAll(/@property (--_[\w-]+)/g)].map((m) => m[1]))
	const compat = new Set()
	const assigned = new Set()
	for (const line of source.split('\n')) {
		const assignment = line.match(/^\s*(--_[\w-]+):\s*(.+);$/)
		if (!assignment) continue
		const [, adapter, value] = assignment
		assigned.add(adapter)
		const viaVar = value.match(/^var\((--ui-[\w-]+),\s*(.+)\)$/)
		if (viaVar) compat.add(`${adapter}|${viaVar[1]}|${viaVar[2]}`)
		const viaAttr = value.match(/^attr\((data-[\w-]+)\s+type\(<[\w-]+>\),\s*var\((--ui-[\w-]+),\s*(.+)\)\)$/)
		if (viaAttr) {
			const [, attribute, publicVar, fallback] = viaAttr
			assert.equal(
				attribute,
				`data-${publicVar.slice(2)}`,
				`${entry.name}: frontier attribute ${attribute} does not pair with ${publicVar}`,
			)
			assert.ok(
				compat.has(`${adapter}|${publicVar}|${fallback}`),
				`${entry.name}: frontier swap for ${adapter} has no byte-identical compat assignment (fallback: ${fallback})`,
			)
		}
	}
	for (const adapter of registered) {
		assert.ok(assigned.has(adapter), `${entry.name}: registered adapter ${adapter} is never assigned`)
	}
	for (const adapter of assigned) {
		assert.ok(registered.has(adapter), `${entry.name}: assigned adapter ${adapter} is not @property-registered`)
	}
}

console.log('CSS compatibility contracts valid: Baseline fallbacks and frontier gates are present')
