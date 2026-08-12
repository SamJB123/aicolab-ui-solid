/** @jsxImportSource @solidjs/web */
// Theme Lab — the whole token contract as Storybook controls.
//
// Every colour token is a light/dark PAIR of colour pickers (the package's
// theming model is one light-dark() declaration per token), and each font
// role offers the curated Google Fonts candidates from the toolbar. Edits
// apply live to the specimen collage below — including the derived tokens
// (muted/faint content, borders and primary-soft), which are
// re-hosted onto the lab wrapper so their color-mix() recomputes from YOUR
// ink/accent — and the generated `:root` block at the bottom is ready to
// paste into .design-sync/theme/theme.css.
//
// Preset swatches (theme-presets.ts) offer curated starting points: light
// and dark rails are independent, so any light pick combines with any dark
// pick. Clicking a swatch pushes its values into the controls — tweak from
// there and copy the block as usual.
//
// Tip: combine with the Theme toolbar's Split mode to tune both schemes
// side by side.
import { createEffect, createMemo, For } from 'solid-js'
import { useArgs } from 'storybook/preview-api'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'
import { DARK_PRESETS, LIGHT_PRESETS, type SchemeValues, type ThemePreset } from './theme-presets'
import {
	ensureGoogleFontLoaded,
	FONT_OPTIONS,
	FONT_ROLES,
	type FontRole,
	fontOption,
} from '../../.storybook/fonts'
import { Button, Chip, Counter, Eyebrow, Meter, Panel, Rule, Sparkline } from '../../src/primitives'

type ThemeLabArgs = {
	pageLight: string
	pageDark: string
	page2Light: string
	page2Dark: string
	panelLight: string
	panelDark: string
	panel2Light: string
	panel2Dark: string
	textLight: string
	textDark: string
	accentLight: string
	accentDark: string
	liveLight: string
	liveDark: string
	fontDisplay: string
	fontSans: string
	fontData: string
	fontLabel: string
}

// Canonical values from .design-sync/theme/theme.css (light = Marigold,
// adopted from the preset rail 2026-08-07).
const CANONICAL: ThemeLabArgs = {
	pageLight: '#fff9e8',
	pageDark: '#12100b',
	page2Light: '#f6ecc7',
	page2Dark: '#191610',
	panelLight: '#fffffb',
	panelDark: '#1e1a12',
	panel2Light: '#fbf3d6',
	panel2Dark: '#262117',
	textLight: '#241c0b',
	textDark: '#ede7da',
	accentLight: '#e8b04c',
	accentDark: '#e8b04c',
	liveLight: '#43913a',
	liveDark: '#5aa179',
	fontDisplay: 'default',
	fontSans: 'default',
	fontData: 'default',
	fontLabel: 'default',
}

const colorArg = (name: string, category: string) => ({
	name,
	control: { type: 'color' } as const,
	table: { category },
})

const fontArg = (role: FontRole) => ({
	control: {
		type: 'select' as const,
		labels: Object.fromEntries(FONT_OPTIONS[role].map((o) => [o.id, o.label])),
	},
	options: FONT_OPTIONS[role].map((o) => o.id),
	table: { category: 'Fonts (Google Fonts)' },
})

const meta = {
	title: 'Tokens/Theme Lab',
	args: CANONICAL,
	argTypes: {
		pageLight: colorArg('--color-base-200 (light)', 'Base ladder'),
		pageDark: colorArg('--color-base-200 (dark)', 'Base ladder'),
		page2Light: colorArg('--color-base-300 (light)', 'Base ladder'),
		page2Dark: colorArg('--color-base-300 (dark)', 'Base ladder'),
		panelLight: colorArg('--color-base-100 (light)', 'Base ladder'),
		panelDark: colorArg('--color-base-100 (dark)', 'Base ladder'),
		panel2Light: colorArg('--color-base-150 (light)', 'Base ladder'),
		panel2Dark: colorArg('--color-base-150 (dark)', 'Base ladder'),
		textLight: colorArg('--color-base-content (light)', 'Content'),
		textDark: colorArg('--color-base-content (dark)', 'Content'),
		accentLight: colorArg('--color-primary (light)', 'Semantic families'),
		accentDark: colorArg('--color-primary (dark)', 'Semantic families'),
		liveLight: colorArg('--color-success (light)', 'Semantic families'),
		liveDark: colorArg('--color-success (dark)', 'Semantic families'),
		fontDisplay: { name: '--font-display', ...fontArg('display') },
		fontSans: { name: '--font-sans', ...fontArg('sans') },
		fontData: { name: '--font-data', ...fontArg('data') },
		fontLabel: { name: '--font-label (micro-labels)', ...fontArg('label') },
	},
} satisfies Meta<ThemeLabArgs>

export default meta
// Component-less meta: StoryObj can't infer args from `typeof meta`, so the
// args shape is passed explicitly (defaults still come from meta.args).
type Story = StoryObj<ThemeLabArgs>

const PAIRS = [
	['--color-base-200', 'pageLight', 'pageDark'],
	['--color-base-300', 'page2Light', 'page2Dark'],
	['--color-base-100', 'panelLight', 'panelDark'],
	['--color-base-150', 'panel2Light', 'panel2Dark'],
	['--color-base-content', 'textLight', 'textDark'],
	['--color-primary', 'accentLight', 'accentDark'],
	['--color-success', 'liveLight', 'liveDark'],
] satisfies [string, keyof ThemeLabArgs, keyof ThemeLabArgs][]

const LEGACY_ALIASES = [
	['--c-page', '--color-base-200'],
	['--c-page-2', '--color-base-300'],
	['--c-panel', '--color-base-100'],
	['--c-panel-2', '--color-base-150'],
	['--c-text', '--color-base-content'],
	['--c-muted', '--color-base-content-muted'],
	['--c-faint', '--color-base-content-faint'],
	['--c-accent', '--color-primary'],
	['--c-live', '--color-success'],
	['--c-line', '--color-border'],
	['--c-line-strong', '--color-border-strong'],
	['--c-accent-soft', '--color-primary-soft'],
] as const

const DERIVED = [
	'--color-base-content-muted',
	'--color-base-content-faint',
	'--color-border',
	'--color-border-strong',
	'--color-primary-soft',
]

const FAMILY_DERIVATIONS = [
	'--color-primary-content: #2b210d;',
	'--color-primary-content: color-mix(in oklch, var(--color-primary) 22%, contrast-color(var(--color-primary)));',
	'--color-secondary: oklch(from var(--color-primary) l calc(c * 0.72) calc(h + 35));',
	'--color-secondary-content: #2b210d;',
	'--color-secondary-content: contrast-color(var(--color-secondary));',
	'--color-accent: oklch(from var(--color-primary) l c calc(h - 55));',
	'--color-accent-content: #2b210d;',
	'--color-accent-content: contrast-color(var(--color-accent));',
	'--color-neutral: oklch(from var(--color-base-content) l calc(c * 0.35) h);',
	'--color-neutral-content: light-dark(#fffffb, #12100b);',
	'--color-neutral-content: contrast-color(var(--color-neutral));',
	'--color-info: oklch(0.58 0.12 230);',
	'--color-info-content: #fffffb;',
	'--color-info-content: contrast-color(var(--color-info));',
	'--color-success-content: #fffffb;',
	'--color-success-content: contrast-color(var(--color-success));',
	'--color-warning: oklch(0.72 0.16 75);',
	'--color-warning-content: #2b210d;',
	'--color-warning-content: contrast-color(var(--color-warning));',
	'--color-error: oklch(0.58 0.18 28);',
	'--color-error-content: #fffffb;',
	'--color-error-content: contrast-color(var(--color-error));',
] as const

const SEMANTIC_FAMILIES = [
	'primary',
	'secondary',
	'accent',
	'neutral',
	'info',
	'success',
	'warning',
	'error',
] as const
const SEMANTIC_TOKENS = SEMANTIC_FAMILIES.flatMap((family) => [
	`--color-${family}`,
	`--color-${family}-content`,
])
const COLOR_LEVELS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

function ColorFamilyLevelMatrix() {
	return (
		<div style={{ overflow: 'auto', 'padding-block-end': '4px' }}>
			<div style={{ display: 'grid', gap: '10px', 'min-width': '900px' }}>
				<For each={SEMANTIC_FAMILIES}>
					{(color) => (
						<div style={{ display: 'grid', 'grid-template-columns': '88px repeat(11, minmax(56px, 1fr))', gap: '6px', 'align-items': 'center' }}>
							<strong style={{ 'font-size': 'var(--t-xs)' }}>{color}</strong>
							<For each={COLOR_LEVELS}>
								{(level) => (
									<div
										class="ui-color"
										data-color={color}
										data-level={level}
										title={`${color} ${level}`}
										style={{
											background: 'var(--ui-resolved-color)',
											'border-radius': 'var(--r-sm)',
											'block-size': '42px',
											'box-shadow': 'inset 0 0 0 1px color-mix(in oklab, var(--color-base-content) 12%, transparent)',
										}}
									/>
								)}
							</For>
						</div>
					)}
				</For>
			</div>
		</div>
	)
}

// Default stacks from theme.css, used when a role stays on 'default'.
// --font-label has NO default stack on purpose: unset, the micro-label
// voice falls through to whatever --font-data resolves to.
const DEFAULT_STACKS: Record<'display' | 'sans' | 'data', string> = {
	display: 'ui-sans-serif, system-ui, sans-serif',
	sans: 'ui-sans-serif, system-ui, sans-serif',
	data: '"Azeret Mono", ui-monospace, "SFMono-Regular", monospace',
}

// Copy the :root token declarations from the loaded stylesheets onto the
// lab wrapper, so the derived color-mix() tokens recompute against the
// wrapper's overridden inputs (registered @property values resolve where
// they are DECLARED — see the preview decorator note).
const rehostRootTokens = (el: HTMLElement) => {
	for (let s = 0; s < document.styleSheets.length; s++) {
		let rules: CSSRuleList
		try {
			rules = document.styleSheets[s].cssRules
		} catch {
			continue
		}
		for (let r = 0; r < rules.length; r++) {
			const rule = rules[r]
			if (!(rule instanceof CSSStyleRule) || rule.selectorText !== ':root') continue
			for (let d = 0; d < rule.style.length; d++) {
				const name = rule.style.item(d)
				if (name.startsWith('--')) el.style.setProperty(name, rule.style.getPropertyValue(name))
			}
		}
	}
}

// Map a preset's scheme-agnostic values onto the lab's per-scheme arg keys.
const schemeArgs = (v: SchemeValues, scheme: 'light' | 'dark'): Partial<ThemeLabArgs> =>
	scheme === 'light'
		? {
				pageLight: v.page,
				page2Light: v.page2,
				panelLight: v.panel,
				panel2Light: v.panel2,
				textLight: v.text,
				accentLight: v.accent,
				liveLight: v.live,
			}
		: {
				pageDark: v.page,
				page2Dark: v.page2,
				panelDark: v.panel,
				panel2Dark: v.panel2,
				textDark: v.text,
				accentDark: v.accent,
				liveDark: v.live,
			}

// The shipped theme.css values as a preset, one per rail, for an easy reset.
const canonicalPreset = (scheme: 'light' | 'dark'): ThemePreset => ({
	name: scheme === 'light' ? 'Marigold' : 'Lantern Gold',
	note: `Canonical — the shipped theme.css ${scheme} scheme`,
	values:
		scheme === 'light'
			? {
					page: CANONICAL.pageLight,
					page2: CANONICAL.page2Light,
					panel: CANONICAL.panelLight,
					panel2: CANONICAL.panel2Light,
					text: CANONICAL.textLight,
					accent: CANONICAL.accentLight,
					live: CANONICAL.liveLight,
				}
			: {
					page: CANONICAL.pageDark,
					page2: CANONICAL.page2Dark,
					panel: CANONICAL.panelDark,
					panel2: CANONICAL.panel2Dark,
					text: CANONICAL.textDark,
					accent: CANONICAL.accentDark,
					live: CANONICAL.liveDark,
				},
})

// Preset cards render their own hexes (not tokens) so each card previews its
// palette faithfully regardless of the currently applied theme.
function PresetCard(props: { preset: ThemePreset; onApply: () => void }) {
	const v = () => props.preset.values
	return (
		<button
			type="button"
			onClick={() => props.onApply()}
			title={`Apply ${props.preset.name}`}
			style={{
				background: v().page,
				color: v().text,
				border: 'none',
				'box-shadow': `inset 0 0 0 1px color-mix(in oklab, ${v().text} 28%, transparent)`,
				'border-radius': '10px',
				padding: '10px 12px',
				display: 'grid',
				gap: '7px',
				'justify-items': 'start',
				cursor: 'pointer',
				width: '168px',
				'text-align': 'left',
				font: 'inherit',
			}}
		>
			<span style={{ display: 'flex', gap: '5px' }}>
				<For each={[v().page2, v().panel, v().accent, v().live, v().text]}>
					{(hex) => (
						<span
							style={{
								width: '15px',
								height: '15px',
								'border-radius': '50%',
								background: hex,
								'box-shadow': `inset 0 0 0 1px color-mix(in oklab, ${v().text} 30%, transparent)`,
							}}
						/>
					)}
				</For>
			</span>
			<span style={{ 'font-weight': '600', 'font-size': '13px' }}>{props.preset.name}</span>
			<span
				style={{
					'font-size': '10.5px',
					'line-height': '1.35',
					color: `color-mix(in oklab, ${v().text} 62%, transparent)`,
				}}
			>
				{props.preset.note}
			</span>
		</button>
	)
}

function Swatch(props: { token: string }) {
	return (
		<div style={{ display: 'grid', gap: '4px', 'justify-items': 'center' }}>
			<span
				style={{
					width: '44px',
					height: '32px',
					'border-radius': '7px',
					background: `var(${props.token})`,
					'box-shadow': 'inset 0 0 0 1px var(--color-border-strong)',
				}}
			/>
			<code
				style={{ 'font-family': 'var(--font-data)', 'font-size': '9.5px', color: 'var(--color-base-content-muted)' }}
			>
				{props.token}
			</code>
		</div>
	)
}

export const Lab: Story = {
	name: 'Theme Lab (all tokens live)',
	render: (args) => {
		let wrap: HTMLDivElement | undefined
		let rehosted = false
		const [, updateArgs] = useArgs<ThemeLabArgs>()

		const stacks = createMemo(() => ({
			display: fontOption('display', args.fontDisplay)?.stack ?? DEFAULT_STACKS.display,
			sans: fontOption('sans', args.fontSans)?.stack ?? DEFAULT_STACKS.sans,
			data: fontOption('data', args.fontData)?.stack ?? DEFAULT_STACKS.data,
			// undefined = leave --font-label unset so labels follow the data pick
			label: fontOption('label', args.fontLabel)?.stack,
		}))

		const overrides = createMemo(() => {
			const out: Record<string, string> = {}
			for (const [token, lightKey, darkKey] of PAIRS) {
				out[token] = `light-dark(${args[lightKey]}, ${args[darkKey]})`
			}
			out['--color-base-content-muted'] = 'color-mix(in oklab, var(--color-base-content) 58%, transparent)'
			out['--color-base-content-faint'] = 'color-mix(in oklab, var(--color-base-content) 36%, transparent)'
			out['--color-border'] = 'color-mix(in oklab, var(--color-base-content) 10%, transparent)'
			out['--color-border-strong'] = 'color-mix(in oklab, var(--color-base-content) 20%, transparent)'
			out['--color-primary-soft'] = 'color-mix(in oklab, var(--color-primary) 14%, transparent)'
			for (const [legacy, semantic] of LEGACY_ALIASES) out[legacy] = `var(${semantic})`
			const s = stacks()
			for (const role of FONT_ROLES) {
				const stack = s[role]
				if (stack !== undefined) out[`--font-${role}`] = stack
			}
			return out
		})

		createEffect(overrides, (values) => {
			if (!wrap) return
			if (!rehosted) {
				rehostRootTokens(wrap)
				rehosted = true
			}
			for (const role of FONT_ROLES) {
				const choice = fontOption(
					role,
					{
						display: args.fontDisplay,
						sans: args.fontSans,
						data: args.fontData,
						label: args.fontLabel,
					}[role],
				)
				if (choice) ensureGoogleFontLoaded(choice)
				// Roles without an override (label on 'default') must be CLEARED so
				// a previous pick doesn't linger on the wrapper.
				if (!(`--font-${role}` in values)) wrap.style.removeProperty(`--font-${role}`)
			}
			for (const [name, value] of Object.entries(values)) wrap.style.setProperty(name, value)
		})

		const cssBlock = createMemo(() => {
			const s = stacks()
			const lines = [
				':root {',
				'\tcolor-scheme: light dark;',
				...PAIRS.map(
					([token, lightKey, darkKey]) =>
						`\t${token}: light-dark(${args[lightKey]}, ${args[darkKey]});`,
				),
				...FAMILY_DERIVATIONS.map((declaration) => `\t${declaration}`),
				'\t--color-base-content-muted: color-mix(in oklab, var(--color-base-content) 58%, transparent);',
				'\t--color-base-content-faint: color-mix(in oklab, var(--color-base-content) 36%, transparent);',
				'\t--color-border: color-mix(in oklab, var(--color-base-content) 10%, transparent);',
				'\t--color-border-strong: color-mix(in oklab, var(--color-base-content) 20%, transparent);',
				'\t--color-primary-soft: color-mix(in oklab, var(--color-primary) 14%, transparent);',
				'\t/* Legacy compatibility outputs. */',
				...LEGACY_ALIASES.map(([legacy, semantic]) => `\t${legacy}: var(${semantic});`),
				`\t--font-display: ${s.display};`,
				`\t--font-sans: ${s.sans};`,
				`\t--font-data: ${s.data};`,
				...(s.label !== undefined
					? [`\t--font-label: ${s.label};`]
					: ['\t/* --font-label unset — micro-labels follow --font-data */']),
				'}',
			]
			return lines.join('\n')
		})

		return (
			<div
				ref={wrap}
				style={{
					background: 'var(--color-base-200)',
					color: 'var(--color-base-content)',
					padding: '28px',
					'border-radius': '12px',
					display: 'grid',
					gap: '28px',
					'font-family': 'var(--font-sans)',
				}}
			>
				{/* ── Preset swatches: independent light/dark rails, click to apply ── */}
				<div style={{ display: 'grid', gap: '14px' }}>
					<Rule label="Light presets — click to apply" />
					<div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: '10px' }}>
						<For each={[canonicalPreset('light'), ...LIGHT_PRESETS]}>
							{(preset) => (
								<PresetCard
									preset={preset}
									onApply={() => updateArgs(schemeArgs(preset.values, 'light'))}
								/>
							)}
						</For>
					</div>
					<Rule label="Dark presets — click to apply" />
					<div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: '10px' }}>
						<For each={[canonicalPreset('dark'), ...DARK_PRESETS]}>
							{(preset) => (
								<PresetCard
									preset={preset}
									onApply={() => updateArgs(schemeArgs(preset.values, 'dark'))}
								/>
							)}
						</For>
					</div>
				</div>

				<Rule label="Type specimens" />
				{/* ── Type specimens, one per font role ── */}
				<div style={{ display: 'grid', gap: '10px' }}>
					<Eyebrow class="ui-accent-ink">--font-display</Eyebrow>
					<div
						style={{
							'font-family': 'var(--font-display)',
							'font-size': '42px',
							'font-weight': '600',
							'line-height': '1.1',
						}}
					>
						A commons for collective intelligence
					</div>
					<Eyebrow class="ui-accent-ink">--font-sans</Eyebrow>
					<p style={{ margin: '0', 'max-width': '58ch', color: 'var(--color-base-content-muted)' }}>
						Workshops, working groups, and shared infrastructure for people building with AI in the
						public interest. Body copy rides the sans role; secondary ink is derived from
						your text colour.
					</p>
					<Eyebrow class="ui-accent-ink">--font-data</Eyebrow>
					<div style={{ 'font-family': 'var(--font-data)', 'font-size': '20px' }}>
						0123456789 · 87% · 12:45 PM · {'{ x: 0.618 }'}
					</div>
					<Eyebrow class="ui-accent-ink">--font-label</Eyebrow>
					<div
						style={{
							'font-family': 'var(--font-label, var(--font-data))',
							'font-size': '10px',
							'text-transform': 'uppercase',
							'letter-spacing': '0.2em',
							color: 'var(--color-base-content-muted)',
						}}
					>
						micro-labels · eyebrows · chips · panel kickers · field labels
					</div>
				</div>

				<Rule label="Token swatches" />
				<div style={{ display: 'flex', gap: '18px', 'flex-wrap': 'wrap' }}>
					<For each={[...PAIRS.map(([token]) => token), ...SEMANTIC_TOKENS, ...DERIVED]}>
						{(token) => <Swatch token={token} />}
					</For>
				</div>

				<Rule label="Colour family × perceptual level" />
				<ColorFamilyLevelMatrix />

				<Rule label="Components on these tokens" />
				<div
					style={{
						display: 'grid',
						'grid-template-columns': 'repeat(auto-fit, minmax(300px, 1fr))',
						gap: '20px',
						'align-items': 'start',
					}}
				>
					<Panel index="01" title="Studio occupancy" kicker="Live across both floors" glow>
						<div style={{ display: 'grid', gap: '12px' }}>
							<div style={{ display: 'flex', gap: '8px' }}>
								<Chip tone="live">live</Chip>
								<Chip tone="accent">peak</Chip>
								<Chip>floor 2</Chip>
							</div>
							<div style={{ display: 'flex', 'align-items': 'baseline', gap: '10px' }}>
								<Counter value={87} format={(n) => `${Math.round(n)}%`} class="font-data" />
								<Eyebrow>capacity</Eyebrow>
							</div>
							<Meter value={87} max={100} color="var(--color-primary)" />
							<Sparkline data={[12, 18, 14, 22, 30, 26, 38, 34, 41, 39, 47, 52]} />
						</div>
					</Panel>
					<div style={{ display: 'grid', gap: '12px', 'align-content': 'start' }}>
						<div style={{ display: 'flex', gap: '10px' }}>
							<Button variant="solid">Primary action</Button>
							<Button color="info" variant="soft">Information</Button>
							<Button color="error" variant="outline">Error</Button>
							<Button>Ghost action</Button>
						</div>
						<div
							style={{
								background: 'var(--color-base-300)',
								padding: '14px',
								'border-radius': '10px',
								'box-shadow': 'inset 0 0 0 1px var(--color-border)',
								color: 'var(--color-base-content-muted)',
								'font-size': '13.5px',
							}}
						>
							Recessed surface (base-300) with a derived border and muted content.
						</div>
						<div
							style={{
								background: 'var(--color-primary-soft)',
								padding: '14px',
								'border-radius': '10px',
								color: 'var(--color-primary)',
								'font-size': '13.5px',
							}}
						>
							Primary-soft wash with primary content.
						</div>
					</div>
				</div>

				<Rule label="theme.css output" />
				<div style={{ display: 'grid', gap: '10px', 'justify-items': 'start' }}>
					<pre
						style={{
							margin: '0',
							padding: '16px',
							'border-radius': '10px',
							background: 'var(--color-base-100)',
							'box-shadow': 'inset 0 0 0 1px var(--color-border)',
							'font-family': 'var(--font-data)',
							'font-size': '12px',
							'line-height': '1.55',
							'overflow-x': 'auto',
							'max-width': '100%',
						}}
					>
						{cssBlock()}
					</pre>
					<Button variant="solid" onClick={() => navigator.clipboard.writeText(cssBlock())}>
						Copy :root block
					</Button>
				</div>
			</div>
		)
	},
}
