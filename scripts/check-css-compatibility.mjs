import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

const [resolver, accordion, selectControl, carousel, workspace, prosekit] = await Promise.all([
	read('../src/resolver.css'),
	read('../src/molecules/accordion/styles.css'),
	read('../src/atoms/select-control/styles.css'),
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
		/border-radius: var\(--ui-select-radius, var\(--r-md\)\)/,
		/border-radius: attr\(data-ui-select-radius type\(<length-percentage>\), var\(--ui-select-radius, var\(--r-md\)\)\)/,
		/border-color: var\(--ui-select-hover-border, var\(--ui-border-hover\)\)/,
		/border-color: attr\(data-ui-select-hover-border type\(<color>\), var\(--ui-select-hover-border, var\(--ui-border-hover\)\)\)/,
	],
	'select-control knob boundary',
)
requireAll(
	carousel,
	[/@supports \(scroll-marker-group: after\).*selector\(::scroll-marker\).*selector\(::scroll-button\(left\)\)/],
	'CSS carousel boundary',
)
requireAll(workspace, [/@supports \(container-type: scroll-state\)/], 'workspace scroll-state boundary')
requireAll(prosekit, [/@supports \(container-type: scroll-state\)/], 'ProseKit scroll-state boundary')

console.log('CSS compatibility contracts valid: Baseline fallbacks and frontier gates are present')
