import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { tmpdir } from 'node:os'

const packageRoot = new URL('../', import.meta.url)
const repoRoot = new URL('../../../', import.meta.url)
const srcRoot = new URL('../src/', import.meta.url)
const SOURCE_COMMIT = '725325a0b'
const SOURCE_PATH = 'packages/ui-solid/src/styles.css'

const source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], {
	cwd: repoRoot,
	encoding: 'utf8',
})
const lines = source.split('\n')

const requiredSourceLandmarks = [
	'@property --ui-surface',
	'@function --ui-color-at-level',
	'@scope (.ui-btn)',
	'@scope (.ui-radial)',
	'@scope (.docs-shell)',
]
if (lines.length !== 2952 || requiredSourceLandmarks.some((landmark) => !source.includes(landmark))) {
	throw new Error(`Refusing to split an unexpected stylesheet snapshot (${lines.length - 1} lines)`)
}

const take = (start, end) => `${lines.slice(start - 1, end).join('\n').trim()}\n`
const outputs = new Map()
const add = (path, chunks, marker, minimumBytes = 40) => {
	const content = chunks.map(([start, end]) => take(start, end)).join('\n')
	if (content.length < minimumBytes || !content.includes(marker)) {
		throw new Error(`Refusing malformed output ${path}: expected ${marker}`)
	}
	outputs.set(path, content)
}

const validateCssShape = (path, content) => {
	const commentStarts = content.match(/\/\*/g)?.length ?? 0
	const commentEnds = content.match(/\*\//g)?.length ?? 0
	if (commentStarts !== commentEnds) {
		throw new Error(`Refusing malformed output ${path}: unbalanced CSS comments`)
	}
	const withoutComments = content.replace(/\/\*[\s\S]*?\*\//g, '')
	let depth = 0
	for (const character of withoutComments) {
		if (character === '{') depth += 1
		if (character === '}') depth -= 1
		if (depth < 0) throw new Error(`Refusing malformed output ${path}: unexpected }`)
	}
	if (depth !== 0) throw new Error(`Refusing malformed output ${path}: unbalanced CSS blocks`)
}

add('properties.css', [[90, 332]], '@property --ui-surface', 2_000)
add('theme-defaults.css', [[333, 412]], ':root', 1_000)
add('resolver.css', [[413, 580]], '@function --ui-color-at-level', 3_000)
add('foundations.css', [[581, 645], [722, 762]], '.font-display', 1_000)
add('enhancements.css', [[867, 878], [1605, 1610]], '.ui-reveal', 200)

add('atoms/segmented/styles.css', [[646, 721], [1611, 1615]], '@scope (.seg)', 1_000)
add('molecules/pickers/styles.css', [[763, 815], [2449, 2477]], '@scope (.ui-picker-pop)', 1_000)
outputs.set('molecules/date-picker/styles.css', `@scope (.ui-picker-pop) {\n\t:scope { padding: 12px; }\n${take(2480, 2548)}\n}\n`)
outputs.set('molecules/time-picker/styles.css', `@scope (.ui-picker-pop) {\n\t:scope { padding: 12px; }\n${take(2549, 2679)}\n}\n`)
add('molecules/steps/styles.css', [[879, 939], [2804, 2906]], '@scope (.ui-steps)', 1_000)
add('atoms/mark/styles.css', [[940, 967]], '@scope (.ui-mark)', 300)
add('atoms/accordion-item/styles.css', [[968, 1032], [1616, 1620]], '@scope (.ui-acc)', 900)
add('molecules/carousel/styles.css', [[1033, 1093]], '@scope (.ui-carousel)', 900)
add('organisms/facets/styles.css', [[1094, 1250]], '@scope (.facets)', 2_000)
add('organisms/depth-card/styles.css', [[1251, 1483]], '@scope (.depth-card)', 3_000)
add('organisms/docs-shell/styles.css', [[1484, 1541], [1542, 1603], [1621, 1626], [2931, 2951]], '@scope (.docs-shell)', 1_500)
add('organisms/radial-menu/styles.css', [[1847, 2050]], '@scope (.ui-radial)', 2_000)
add('atoms/icon-button/styles.css', [[2287, 2308]], '@scope (.ui-iconbtn)', 250)
add('atoms/field/styles.css', [[2309, 2325]], '@scope (.ui-field)', 200)
add('molecules/month-calendar/styles.css', [[2326, 2448], [816, 859]], '@scope (.ui-cal)', 1_500)
add('molecules/page-hero/styles.css', [[2682, 2730]], '@scope (.ui-hero)', 500)
add('molecules/section/styles.css', [[2731, 2765]], '@scope (.ui-section)', 400)
add('molecules/feature-grid/styles.css', [[2766, 2803]], '@scope (.ui-feature-grid)', 400)
add('molecules/logo-cloud/styles.css', [[2907, 2930]], '@scope (.ui-logo-cloud)', 250)

for (const [name, range, marker] of [
	['eyebrow', [1635, 1646], '@scope (.ui-eyebrow)'],
	['status-dot', [1647, 1665], '@scope (.ui-dot)'],
	['avatar', [1666, 1694], '@scope (.ui-avatar)'],
	['avatar-stack', [1695, 1725], '@scope (.ui-avatar-stack)'],
	['chip', [1726, 1763], '@scope (.ui-chip)'],
	['breadcrumb', [1764, 1846], '@scope (.ui-breadcrumb)'],
	['button', [2051, 2107], '@scope (.ui-btn)'],
	['panel', [2108, 2215], '@scope (.ui-panel)'],
	['counter', [2216, 2223], '@scope (.ui-counter)'],
	['sparkline', [2224, 2228], '@scope (.ui-sparkline)'],
	['waveform', [2229, 2246], '@scope (.ui-waveform)'],
	['meter', [2247, 2273], '@scope (.ui-meter)'],
	['rule', [2274, 2286], '@scope (.ui-rule)'],
]) add(`${name === 'avatar-stack' ? 'molecules' : 'atoms'}/${name}/styles.css`, [range], marker, 60)

const imports = (tier, names) => outputs.set(`${tier}.css`, `${names.map((name) => `@import url("./${tier}/${name}/styles.css");`).join('\n')}\n`)
imports('atoms', ['accordion-item', 'avatar', 'breadcrumb', 'button', 'chip', 'counter', 'eyebrow', 'field', 'icon-button', 'mark', 'meter', 'panel', 'rule', 'segmented', 'sparkline', 'status-dot', 'waveform'])
outputs.set('molecules.css', `@import url("./molecules/pickers/styles.css");\n${['accordion', 'avatar-stack', 'carousel', 'date-picker', 'feature-grid', 'logo-cloud', 'month-calendar', 'page-hero', 'section', 'steps', 'time-picker'].map((name) => `@import url("./molecules/${name}/styles.css");`).join('\n')}\n`)
imports('organisms', ['depth-card', 'docs-shell', 'facets', 'radial-menu'])
outputs.set('styles.css', `/* @aicolab/ui-solid — public stylesheet entrypoint. */
@layer reset, ui.tokens, ui.resolver, ui.foundations, ui.atoms, ui.molecules, ui.organisms, ui.enhancements;

@import url("./reset.css");
@import url("./properties.css") layer(ui.tokens);
@import url("./theme-defaults.css") layer(ui.tokens);
@import url("./resolver.css") layer(ui.resolver);
@import url("./foundations.css") layer(ui.foundations);
@import url("./atoms.css") layer(ui.atoms);
@import url("./molecules.css") layer(ui.molecules);
@import url("./organisms.css") layer(ui.organisms);
@import url("./enhancements.css") layer(ui.enhancements);
`)

for (const [path, content] of outputs) validateCssShape(path, content)

const staging = mkdtempSync(join(tmpdir(), 'ui-solid-css-split-'))
try {
	for (const [path, content] of outputs) {
		const target = join(staging, path)
		mkdirSync(dirname(target), { recursive: true })
		writeFileSync(target, content)
	}
	for (const [path, expected] of outputs) {
		const staged = readFileSync(join(staging, path), 'utf8')
		if (staged !== expected) throw new Error(`Staging verification failed for ${path}`)
	}
	for (const path of outputs.keys()) {
		const destination = new URL(path, srcRoot)
		mkdirSync(dirname(destination.pathname), { recursive: true })
		renameSync(join(staging, path), destination)
	}
} finally {
	rmSync(staging, { recursive: true, force: true })
}

console.log(`Regenerated ${outputs.size} CSS files from immutable ${SOURCE_COMMIT}:${SOURCE_PATH}`)
