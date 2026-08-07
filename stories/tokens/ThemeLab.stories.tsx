/** @jsxImportSource @solidjs/web */
// Theme Lab — the whole token contract as Storybook controls.
//
// Every colour token is a light/dark PAIR of colour pickers (the package's
// theming model is one light-dark() declaration per token), and each font
// role offers the curated Google Fonts candidates from the toolbar. Edits
// apply live to the specimen collage below — including the derived tokens
// (--c-muted/--c-faint/--c-line/--c-line-strong/--c-accent-soft), which are
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
	accentLight: '#cc6a00',
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
		pageLight: colorArg('--c-page (light)', 'Page surfaces'),
		pageDark: colorArg('--c-page (dark)', 'Page surfaces'),
		page2Light: colorArg('--c-page-2 (light)', 'Page surfaces'),
		page2Dark: colorArg('--c-page-2 (dark)', 'Page surfaces'),
		panelLight: colorArg('--c-panel (light)', 'Panel surfaces'),
		panelDark: colorArg('--c-panel (dark)', 'Panel surfaces'),
		panel2Light: colorArg('--c-panel-2 (light)', 'Panel surfaces'),
		panel2Dark: colorArg('--c-panel-2 (dark)', 'Panel surfaces'),
		textLight: colorArg('--c-text (light)', 'Ink'),
		textDark: colorArg('--c-text (dark)', 'Ink'),
		accentLight: colorArg('--c-accent (light)', 'Signals'),
		accentDark: colorArg('--c-accent (dark)', 'Signals'),
		liveLight: colorArg('--c-live (light)', 'Signals'),
		liveDark: colorArg('--c-live (dark)', 'Signals'),
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
	['--c-page', 'pageLight', 'pageDark'],
	['--c-page-2', 'page2Light', 'page2Dark'],
	['--c-panel', 'panelLight', 'panelDark'],
	['--c-panel-2', 'panel2Light', 'panel2Dark'],
	['--c-text', 'textLight', 'textDark'],
	['--c-accent', 'accentLight', 'accentDark'],
	['--c-live', 'liveLight', 'liveDark'],
] satisfies [string, keyof ThemeLabArgs, keyof ThemeLabArgs][]

const DERIVED = ['--c-muted', '--c-faint', '--c-line', '--c-line-strong', '--c-accent-soft']

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
					'box-shadow': 'inset 0 0 0 1px var(--c-line-strong)',
				}}
			/>
			<code
				style={{ 'font-family': 'var(--font-data)', 'font-size': '9.5px', color: 'var(--c-muted)' }}
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
				'\t--c-muted: color-mix(in oklab, var(--c-text) 58%, transparent);',
				'\t--c-faint: color-mix(in oklab, var(--c-text) 36%, transparent);',
				'\t--c-line: color-mix(in oklab, var(--c-text) 10%, transparent);',
				'\t--c-line-strong: color-mix(in oklab, var(--c-text) 20%, transparent);',
				'\t--c-accent-soft: color-mix(in oklab, var(--c-accent) 14%, transparent);',
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
					background: 'var(--c-page)',
					color: 'var(--c-text)',
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
					<p style={{ margin: '0', 'max-width': '58ch', color: 'var(--c-muted)' }}>
						Workshops, working groups, and shared infrastructure for people building with AI in the
						public interest. Body copy rides the sans role; secondary ink is --c-muted derived from
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
							color: 'var(--c-muted)',
						}}
					>
						micro-labels · eyebrows · chips · panel kickers · field labels
					</div>
				</div>

				<Rule label="Token swatches" />
				<div style={{ display: 'flex', gap: '18px', 'flex-wrap': 'wrap' }}>
					<For each={[...PAIRS.map(([token]) => token), ...DERIVED]}>
						{(token) => <Swatch token={token} />}
					</For>
				</div>

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
							<Meter value={87} max={100} color="var(--c-accent)" />
							<Sparkline data={[12, 18, 14, 22, 30, 26, 38, 34, 41, 39, 47, 52]} />
						</div>
					</Panel>
					<div style={{ display: 'grid', gap: '12px', 'align-content': 'start' }}>
						<div style={{ display: 'flex', gap: '10px' }}>
							<Button variant="primary">Primary action</Button>
							<Button>Ghost action</Button>
						</div>
						<div
							style={{
								background: 'var(--c-page-2)',
								padding: '14px',
								'border-radius': '10px',
								'box-shadow': 'inset 0 0 0 1px var(--c-line)',
								color: 'var(--c-muted)',
								'font-size': '13.5px',
							}}
						>
							Recessed surface (--c-page-2) with a hairline (--c-line) and muted ink.
						</div>
						<div
							style={{
								background: 'var(--c-accent-soft)',
								padding: '14px',
								'border-radius': '10px',
								color: 'var(--c-accent)',
								'font-size': '13.5px',
							}}
						>
							Accent wash (--c-accent-soft) with accent ink.
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
							background: 'var(--c-panel)',
							'box-shadow': 'inset 0 0 0 1px var(--c-line)',
							'font-family': 'var(--font-data)',
							'font-size': '12px',
							'line-height': '1.55',
							'overflow-x': 'auto',
							'max-width': '100%',
						}}
					>
						{cssBlock()}
					</pre>
					<Button variant="primary" onClick={() => navigator.clipboard.writeText(cssBlock())}>
						Copy :root block
					</Button>
				</div>
			</div>
		)
	},
}
