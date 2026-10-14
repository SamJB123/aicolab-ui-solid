import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const [resolver, foundations, accordion, selectControl, button, formControl, iconButton, holdButton, mark, notice, accordionItem, carousel, workspace, prosekit, callout, flowMap, richList] = await Promise.all([
	read('../src/resolver.css'),
	read('../src/foundations.css'),
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
	read('../src/molecules/callout/styles.css'),
	read('../src/organisms/flow-map/styles.css'),
	read('../src/molecules/rich-list/styles.css'),
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

/* The surface ladder: the resolver works the surface paint and the edge out
   of the theme's --s-* choices for treated elements and plain plates alike
   (both paths, the frontier one collapsing the rest paint to the flat
   colour), and the exemplar atom paints the two roles where it painted its
   surface and its ring. */
requireAll(
	resolver,
	[
		/:where\(\[data-ui-plate\]\)/,
		/:where\(\[data-ui-plate\], \[data-ui-color-base\]\)/,
		/* The rim is solid: the theme's rim on a plain plate, the family colour on a treated one. */
		/--ui-edge-source: var\(--color-rim\);/,
		/--ui-edge-source: var\(--ui-color\);/,
		/--ui-surface-paint: var\(--ui-studs\), var\(--ui-shine\);/,
		/--ui-surface-paint: if\(\n\t\t\tstyle\(--s-grade: 0\): if\(style\(--s-stud: 0px\): var\(--ui-paint-source\); else: var\(--ui-studs\), var\(--ui-shine\)\);/,
		/--ui-edge:\n/,
		/--ui-edge-hover:\n/,
		/--ui-edge-selected:\n/,
		/--ui-edge-disabled: 0 0 0 0 transparent;/,
		/var\(--s-grade\)/,
		/var\(--s-grade-angle\)/,
		/var\(--s-edge-inner\)/,
		/var\(--s-edge-gap\)/,
		/var\(--s-edge-outer\)/,
		/var\(--s-bevel\)/,
		/var\(--s-stud\)/,
		/var\(--s-shadow\)/,
		/* The studs are placed from the plate's own corner (the shared radius
		   adapter) and the theme's corner shape: never a fixed offset. */
		/--ui-stud-at: max\(/,
		/min\(var\(--_ui-radius\), 50%\)/,
		/--ui-stud-tile: calc\(2 \* var\(--ui-stud-at\) \* \(1 - sign\(var\(--_ui-radius\) - min\(var\(--_ui-radius\), 50%\)\)\)\);/,
		/var\(--ui-stud\) left top \/ var\(--ui-stud-tile\) var\(--ui-stud-tile\) no-repeat,/,
		/@supports \(corner-shape: squircle\) and \(color: if\(style\(--ui-compat-probe: yes\): red; else: blue\)\)/,
		/style\(--s-corner: squircle\): 2;/,
	],
	'surface ladder resolver',
)
requireAll(
	foundations,
	[/@property --_ui-radius \{\n\tsyntax: "<length-percentage>";\n\tinherits: false;\n\tinitial-value: 0px;\n\}/],
	'shared element corner registration',
)
requireAll(
	button,
	[
		/background: var\(--ui-surface-paint\);/,
		/background: var\(--ui-surface-paint-hover\);/,
		/background: var\(--ui-surface-paint-disabled\);/,
		/var\(--ui-edge\),/,
		/var\(--ui-edge-hover\),/,
		/var\(--ui-edge-disabled\),/,
		/corner-shape: var\(--s-corner\);/,
		/translate: 0 calc\(-1 \* var\(--s-lift\)\);/,
	],
	'button paints the surface ladder',
)
requireAll(
	accordion,
	[
		/data-ui-accordion-spacing="separated"/,
		/data-ui-accordion-density="compact"/,
		/@container ui-accordion style\(--ui-accordion-spacing: separated\)/,
		/@container ui-accordion style\(--ui-accordion-density: compact\)/,
		/--_ui-accordion-item-gap: var\(--ui-accordion-item-gap, 0\.75rem\)/,
		/--_ui-accordion-item-gap: attr\(data-ui-accordion-item-gap type\(<length>\), var\(--ui-accordion-item-gap, 0\.75rem\)\)/,
	],
	'accordion style-query fallback',
)
requireAll(
	selectControl,
	[
		/@supports \(appearance: base-select\)/,
		/@supports \(width: attr\(data-ui-compat-probe type\(<length>\), 0px\)\)/,
		/--_ui-radius: var\(--ui-select-radius, var\(--r-md\)\)/,
		/--_ui-radius: attr\(data-ui-select-radius type\(<length-percentage>\), var\(--ui-select-radius, var\(--r-md\)\)\)/,
		/--_ui-select-hover-border: var\(--ui-select-hover-border, var\(--ui-border-hover\)\)/,
		/--_ui-select-hover-border: attr\(data-ui-select-hover-border type\(<color>\), var\(--ui-select-hover-border, var\(--ui-border-hover\)\)\)/,
	],
	'select-control knob boundary',
)
requireAll(
	button,
	[
		/@supports \(width: attr\(data-ui-compat-probe type\(<length>\), 0px\)\)/,
		/--_ui-radius: var\(--ui-btn-radius, var\(--r-pill\)\)/,
		/--_ui-radius: attr\(data-ui-btn-radius type\(<length-percentage>\), var\(--ui-btn-radius, var\(--r-pill\)\)\)/,
		/border-radius: var\(--_ui-radius\);/,
		/--_ui-btn-pad-inline: var\(--ui-btn-pad-inline, 4px\)/,
		/--_ui-btn-pad-inline: attr\(data-ui-btn-pad-inline type\(<length>\), var\(--ui-btn-pad-inline, 4px\)\)/,
	],
	'button knob boundary',
)
requireAll(
	formControl,
	[
		/@supports \(width: attr\(data-ui-compat-probe type\(<length>\), 0px\)\)/,
		/--_ui-radius: var\(--ui-input-radius, var\(--r-xs\)\)/,
		/--_ui-radius: attr\(data-ui-input-radius type\(<length-percentage>\), var\(--ui-input-radius, var\(--r-xs\)\)\)/,
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
		/--_ui-iconbtn-surface: var\(--ui-iconbtn-surface, transparent\)/,
		/--_ui-iconbtn-surface: attr\(data-ui-iconbtn-surface type\(<color>\), var\(--ui-iconbtn-surface, transparent\)\)/,
		/--_ui-iconbtn-ink: var\(--ui-iconbtn-ink, var\(--color-base-content-muted\)\)/,
		/--_ui-iconbtn-ink: attr\(data-ui-iconbtn-ink type\(<color>\), var\(--ui-iconbtn-ink, var\(--color-base-content-muted\)\)\)/,
		/--_ui-iconbtn-ink: var\(--ui-iconbtn-ink, var\(--ui-color-foreground\)\)/,
		/--_ui-iconbtn-ink: attr\(data-ui-iconbtn-ink type\(<color>\), var\(--ui-iconbtn-ink, var\(--ui-color-foreground\)\)\)/,
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
		/--_ui-radius: var\(--ui-notice-radius, var\(--r-xs\)\)/,
		/--_ui-radius: attr\(data-ui-notice-radius type\(<length-percentage>\), var\(--ui-notice-radius, var\(--r-xs\)\)\)/,
	],
	'notice knob boundary',
)
requireAll(
	callout,
	[
		/--_ui-radius: var\(--ui-callout-radius, var\(--r-sm\)\)/,
		/--_ui-radius: attr\(data-ui-callout-radius type\(<length-percentage>\), var\(--ui-callout-radius, var\(--r-sm\)\)\)/,
		/--_ui-callout-pad: attr\(data-ui-callout-pad type\(<length>\), var\(--ui-callout-pad, 0\.8rem\)\)/,
	],
	'callout knob boundary',
)
requireAll(
	flowMap,
	[
		/--_ui-fm-node-radius: var\(--ui-fm-node-radius, var\(--r-md\)\)/,
		/--_ui-fm-node-radius: attr\(data-ui-fm-node-radius type\(<length-percentage>\), var\(--ui-fm-node-radius, var\(--r-md\)\)\)/,
		/--_ui-fm-connector-width: attr\(data-ui-fm-connector-width type\(<length>\), var\(--ui-fm-connector-width, 2px\)\)/,
		/@container ui-flow-map \(inline-size < 40rem\)/,
		/@supports \(anchor-name: --a\)/,
	],
	'flow map knob boundary',
)
requireAll(
	richList,
	[
		/--_ui-rl-leading-mark-size: var\(--ui-rl-leading-mark-size, 1\.25rem\)/,
		/--_ui-rl-leading-mark-size: attr\(data-ui-rl-leading-mark-size type\(<length>\), var\(--ui-rl-leading-mark-size, 1\.25rem\)\)/,
		/* The mark box: a fixed square, pictures fill it. */
		/\.ui-rich-list-leading\[data-width="mark"\] \{/,
		/\.ui-rich-list-leading\[data-width="mark"\] > :is\(svg, img\) \{/,
	],
	'rich-list knob boundary',
)
requireAll(
	accordionItem,
	[
		/--_ui-acc-divider: var\(--ui-acc-divider, var\(--color-border\)\)/,
		/--_ui-acc-divider: attr\(data-ui-acc-divider type\(<color>\), var\(--ui-acc-divider, var\(--color-border\)\)\)/,
		/--_ui-acc-icon-ink: var\(--ui-acc-icon-ink, var\(--color-primary\)\)/,
		/--_ui-acc-icon-ink: attr\(data-ui-acc-icon-ink type\(<color>\), var\(--ui-acc-icon-ink, var\(--color-primary\)\)\)/,
		/* Treated items paint the surface⇄ink role pair (the surface through its paint). */
		/background: var\(--ui-surface-paint\);\n\t\tcolor: var\(--ui-ink\);/,
		/* Mode carriers sit between the public knob and the context default. */
		/--_ui-acc-pad-inline: var\(--ui-acc-pad-inline, var\(--ui-accordion-pad-inline, 1rem\)\)/,
		/--_ui-acc-radius: attr\(data-ui-acc-radius type\(<length-percentage>\), var\(--ui-acc-radius, var\(--ui-accordion-radius, var\(--r-md\)\)\)\)/,
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

/* ── Generic knob-wire pairing check (foundations + all tiers, ALL knobs) ─
   Parses every knob-bearing stylesheet and enforces, for every knob:
   1. each frontier attr() assignment reads the attribute pairing its public
      variable (data-ui-x ⇄ --ui-x);
   2. each frontier assignment's fallback is byte-identical to a compat
      assignment of the same adapter IN THAT SHEET — the two wires cannot
      disagree (per-context re-defaults live with their own swaps);
   3. registration/assignment pairing is checked GLOBALLY — shared adapters
      (the .ui-anchored shell; the element corner --_ui-radius, assigned by
      every sheet that rounds something) are registered once in
      foundations.css and re-defaulted by composing sheets.
   Knobs consumed on descendants/child-state contexts legitimately have no
   attr() swap (attr() reads only the matched element) — they simply
   contribute no frontier lines. */
const knobSheets = ['../src/foundations.css']
for (const tier of ['atoms', 'molecules', 'organisms']) {
	for (const entry of readdirSync(new URL(`../src/${tier}/`, import.meta.url), {
		withFileTypes: true,
	})) {
		if (entry.isDirectory()) knobSheets.push(`../src/${tier}/${entry.name}/styles.css`)
	}
}
const globallyRegistered = new Set()
const globallyAssigned = new Map()
const sheetSources = new Map()
for (const sheet of knobSheets) {
	try {
		sheetSources.set(sheet, await read(sheet))
	} catch {}
}
for (const source of sheetSources.values()) {
	for (const match of source.matchAll(/@property (--_[\w-]+)/g)) globallyRegistered.add(match[1])
}
/* A plate's rim is solid (resolver.css "Surface paint and edge"): no sheet
   draws the rings and studs from a hairline border, which ui-solid derives
   as a wash by default. */
for (const [sheet, source] of sheetSources) {
	assert.doesNotMatch(
		source,
		/--ui-edge-source:\s*(?:var\(--(?:color-border|ui-border)|color-mix\()/,
		`${sheet.replace('../src/', '')}: a plate's rim must be a solid colour (the theme's rim or the family colour), not a border`,
	)
}
for (const [sheet, source] of sheetSources) {
	const name = sheet.replace('../src/', '')
	const compat = new Set()
	for (const line of source.split('\n')) {
		const assignment = line.match(/^\s*(--_[\w-]+):\s*(.+);$/)
		if (!assignment) continue
		const [, adapter, value] = assignment
		globallyAssigned.set(adapter, name)
		const viaVar = value.match(/^var\((--ui-[\w-]+),\s*(.+)\)$/)
		if (viaVar) compat.add(`${adapter}|${viaVar[1]}|${viaVar[2]}`)
		const viaAttr = value.match(/^attr\((data-[\w-]+)\s+type\(<[\w-]+>\),\s*var\((--ui-[\w-]+),\s*(.+)\)\)$/)
		if (viaAttr) {
			const [, attribute, publicVar, fallback] = viaAttr
			assert.equal(
				attribute,
				`data-${publicVar.slice(2)}`,
				`${name}: frontier attribute ${attribute} does not pair with ${publicVar}`,
			)
			assert.ok(
				compat.has(`${adapter}|${publicVar}|${fallback}`),
				`${name}: frontier swap for ${adapter} has no byte-identical compat assignment (fallback: ${fallback})`,
			)
		}
		assert.ok(
			globallyRegistered.has(adapter),
			`${name}: assigned adapter ${adapter} is not @property-registered anywhere`,
		)
	}
}
for (const adapter of globallyRegistered) {
	assert.ok(
		globallyAssigned.has(adapter),
		`registered adapter ${adapter} is never assigned in any sheet`,
	)
}

console.log('CSS compatibility contracts valid: Baseline fallbacks and frontier gates are present')
