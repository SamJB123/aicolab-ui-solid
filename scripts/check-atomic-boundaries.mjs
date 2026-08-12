import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const src = fileURLToPath(new URL('../src/', import.meta.url))
const tiers = ['atoms', 'molecules', 'organisms']
const rank = new Map(tiers.map((tier, index) => [tier, index]))
const sourceExtensions = new Set(['.ts', '.tsx', '.css'])
const componentNames = new Set(tiers.flatMap((tier) => readdirSync(resolve(src, tier))))

const walk = (directory) => readdirSync(directory).flatMap((name) => {
	const path = resolve(directory, name)
	return statSync(path).isDirectory() ? walk(path) : [path]
})

const importsIn = (path) => {
	const source = readFileSync(path, 'utf8')
	const values = []
	const patterns = [
		/(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
		/@import\s+(?:url\()?['"]([^'"]+)['"]/g,
	]
	for (const pattern of patterns) {
		for (const match of source.matchAll(pattern)) values.push(match[1])
	}
	return values.filter((value) => value.startsWith('.'))
}

const describe = (path) => relative(src, path).split(sep)
const violations = []
for (const path of walk(resolve(src, 'shared')).filter((path) => sourceExtensions.has(extname(path)))) {
	const stem = relative(resolve(src, 'shared'), path).split(sep)[0].replace(/\.[^.]+$/, '')
	if (componentNames.has(stem)) {
		violations.push(`${relative(src, path)} is component-family-specific and must be owned by ${stem}`)
	}
}
const graph = new Map()
const nodeFor = (tier, component) => `${tier}/${component}`
for (const tier of tiers) {
	const root = resolve(src, tier)
	for (const importer of walk(root).filter((path) => sourceExtensions.has(extname(path)))) {
		const [importerTier, importerComponent] = describe(importer)
		// Tier barrels are public aggregators, not component implementations.
		if (!importerComponent || importerComponent === 'index.ts') continue
		const importerNode = nodeFor(importerTier, importerComponent)
		if (!graph.has(importerNode)) graph.set(importerNode, new Set())
		for (const specifier of importsIn(importer)) {
			const target = resolve(dirname(importer), specifier)
			if (!target.startsWith(src + sep)) continue
			const [targetTier, targetComponent] = describe(target)
			if (!rank.has(targetTier)) continue
			const sameComponent = importerTier === targetTier && importerComponent === targetComponent
			if (sameComponent) continue
			if (rank.get(targetTier) > rank.get(importerTier)) {
				violations.push(`${relative(src, importer)} imports ${specifier} (${targetTier}/${targetComponent})`)
			}
			graph.get(importerNode).add(nodeFor(targetTier, targetComponent))
		}
	}
}

const visited = new Set()
const active = new Set()
const path = []
const cycles = []
const visit = (node) => {
	if (active.has(node)) {
		const start = path.indexOf(node)
		cycles.push([...path.slice(start), node].join(' → '))
		return
	}
	if (visited.has(node)) return
	visited.add(node)
	active.add(node)
	path.push(node)
	for (const dependency of graph.get(node) ?? []) visit(dependency)
	path.pop()
	active.delete(node)
}
for (const node of graph.keys()) visit(node)
for (const cycle of new Set(cycles)) violations.push(`dependency cycle: ${cycle}`)

if (violations.length) {
	console.error('Atomic Design boundary violations:\n' + violations.map((value) => `  - ${value}`).join('\n'))
	process.exitCode = 1
} else {
	console.log('Atomic Design boundaries valid: no upward imports or dependency cycles')
}
