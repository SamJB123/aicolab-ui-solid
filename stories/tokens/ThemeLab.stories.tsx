/** @jsxImportSource @solidjs/web */
// Theme Lab — the whole token contract as Storybook controls.
//
// Each genuine anchor is a light/dark pair. The browser derives the surface
// ladder, content hierarchy, borders, content partners and remaining semantic
// families through ui-solid's canonical theme layer. Controls therefore edit
// anchors only; the specimen matrix shows the resulting computed system. The
// generated `:root` block is ready to paste into a consumer theme unchanged.
//
// Preset swatches (theme-presets.ts) offer curated starting points: light
// and dark rails are independent, so any light pick combines with any dark
// pick. Clicking a swatch pushes its values into the controls — tweak from
// there and copy the block as usual.
//
// Tip: combine with the Theme toolbar's Split mode to tune both schemes
// side by side.
import { createMemo, createSignal, For, Show } from 'solid-js'
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
import {
	Avatar,
	AvatarStack,
	Breadcrumb,
	Button,
	Chip,
	Counter,
	Eyebrow,
	Meter,
	Panel,
	Rule,
	Sparkline,
	StatusDot,
	Waveform,
	type Variant,
	type ColorBase,
	type ColorLevel,
} from '../../src/primitives'
import { Field, IconButton, Segmented } from '../../src/controls'
import { Accordion, AccordionItem, Mark } from '../../src/marketing'
import { createEffect } from '../../src/solid-v2'

type ThemeLabArgs = {
	baseLight: string
	baseDark: string
	contentLight: string
	contentDark: string
	primaryLight: string
	primaryDark: string
	secondaryLight: string
	secondaryDark: string
	accentLight: string
	accentDark: string
	neutralLight: string
	neutralDark: string
	infoLight: string
	infoDark: string
	successLight: string
	successDark: string
	warningLight: string
	warningDark: string
	errorLight: string
	errorDark: string
	fontDisplay: string
	fontSans: string
	fontData: string
	fontLabel: string
}

// Canonical values from src/theme-defaults.css (light = Marigold,
// dark = Lantern Gold). Empty values are the families intentionally left to
// ui-solid's canonical CSS derivation layer.
const CANONICAL: ThemeLabArgs = {
	baseLight: '#fffffb',
	baseDark: '#000512',
	contentLight: '#241c0b',
	contentDark: '#ede7da',
	primaryLight: '#e8b04c',
	primaryDark: '#e8b04c',
	secondaryLight: '#005682',
	secondaryDark: '#005682',
	accentLight: '#b9c27a',
	accentDark: '#b9c27a',
	neutralLight: '',
	neutralDark: '',
	infoLight: 'oklch(0.58 0.12 230)',
	infoDark: 'oklch(0.58 0.12 230)',
	successLight: '#43913a',
	successDark: '#5aa179',
	warningLight: '#fcb700',
	warningDark: '#fcb700',
	errorLight: '#c50035',
	errorDark: '#c50035',
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

const optionalColorArg = (name: string) => ({
	name,
	control: { type: 'text' } as const,
	table: { category: 'Optional semantic overrides' },
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
	title: 'Foundations/Theme Lab',
	args: CANONICAL,
	argTypes: {
		baseLight: colorArg('--color-base-100 anchor (light)', 'Surface anchor'),
		baseDark: colorArg('--color-base-100 anchor (dark)', 'Surface anchor'),
		contentLight: colorArg('--color-base-content (light)', 'Content'),
		contentDark: colorArg('--color-base-content (dark)', 'Content'),
		primaryLight: colorArg('--color-primary (light)', 'Semantic families'),
		primaryDark: colorArg('--color-primary (dark)', 'Semantic families'),
		secondaryLight: optionalColorArg('--color-secondary override (light)'),
		secondaryDark: optionalColorArg('--color-secondary override (dark)'),
		accentLight: optionalColorArg('--color-accent override (light)'),
		accentDark: optionalColorArg('--color-accent override (dark)'),
		neutralLight: optionalColorArg('--color-neutral override (light)'),
		neutralDark: optionalColorArg('--color-neutral override (dark)'),
		infoLight: optionalColorArg('--color-info override (light)'),
		infoDark: optionalColorArg('--color-info override (dark)'),
		successLight: colorArg('--color-success (light)', 'Semantic families'),
		successDark: colorArg('--color-success (dark)', 'Semantic families'),
		warningLight: optionalColorArg('--color-warning override (light)'),
		warningDark: optionalColorArg('--color-warning override (dark)'),
		errorLight: optionalColorArg('--color-error override (light)'),
		errorDark: optionalColorArg('--color-error override (dark)'),
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
	['--color-base-100', 'baseLight', 'baseDark'],
	['--color-base-content', 'contentLight', 'contentDark'],
	['--color-primary', 'primaryLight', 'primaryDark'],
	['--color-success', 'successLight', 'successDark'],
] satisfies [string, keyof ThemeLabArgs, keyof ThemeLabArgs][]

const OPTIONAL_PAIRS = [
	['--color-secondary', 'secondaryLight', 'secondaryDark'],
	['--color-accent', 'accentLight', 'accentDark'],
	['--color-neutral', 'neutralLight', 'neutralDark'],
	['--color-info', 'infoLight', 'infoDark'],
	['--color-warning', 'warningLight', 'warningDark'],
	['--color-error', 'errorLight', 'errorDark'],
] satisfies [string, keyof ThemeLabArgs, keyof ThemeLabArgs][]

const optionalDefault = (token: string) =>
	`var(${token.replace('--color-', '--ui-theme-')}-default)`

const DERIVED = [
	'--color-base-150',
	'--color-base-200',
	'--color-base-300',
	'--color-base-content-muted',
	'--color-base-content-faint',
	'--color-border',
	'--color-border-strong',
	'--color-primary-soft',
	'--color-ring',
]

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

function ColorLevelSwatch(props: { color: (typeof SEMANTIC_FAMILIES)[number]; level: (typeof COLOR_LEVELS)[number] }) {
	let swatch: HTMLButtonElement | undefined
	const [resolvedColor, setResolvedColor] = createSignal('')
	const [hovered, setHovered] = createSignal(false)
	const [copied, setCopied] = createSignal(false)
	const resolveColor = () => {
		if (!swatch) return ''
		const value = getComputedStyle(swatch).backgroundColor
		setResolvedColor(value)
		setHovered(true)
		return value
	}
	const copyColor = async () => {
		const value = resolveColor()
		if (!value) return
		await navigator.clipboard.writeText(value)
		setCopied(true)
	}

	return (
		<button
			ref={swatch}
			type="button"
			data-ui-color-base={props.color}
			data-ui-color-level={props.level}
			onPointerEnter={resolveColor}
			onPointerLeave={() => {
				setHovered(false)
				setCopied(false)
			}}
			onFocus={resolveColor}
			onBlur={() => {
				setHovered(false)
				setCopied(false)
			}}
			onClick={copyColor}
			aria-label={`Copy resolved ${props.color} ${props.level} colour`}
			title={`${props.color} ${props.level}${resolvedColor() ? ` — ${resolvedColor()} — click to copy` : ' — click to copy'}`}
			style={{
				background: 'var(--ui-surface)',
				color: 'var(--ui-ink)',
				'border-radius': 'var(--r-sm)',
				'block-size': '42px',
				'box-shadow': 'inset 0 0 0 1px color-mix(in oklab, var(--color-base-content) 12%, transparent)',
				display: 'grid',
				'place-items': 'center',
				'font-family': 'var(--font-data)',
				'font-size': 'var(--t-2xs)',
				'font-weight': 700,
				position: 'relative',
				border: 'none',
				padding: 0,
				cursor: 'copy',
			}}
		>
			{props.level}
			<Show when={hovered() && resolvedColor()} keyed>
				{(value) => (
					<code
						style={{
							position: 'absolute',
							'z-index': 20,
							inset: 'auto auto calc(100% + 7px) 50%',
							transform: 'translateX(-50%)',
							'white-space': 'nowrap',
							background: 'var(--color-base-100)',
							color: 'var(--color-base-content)',
							border: '1px solid var(--color-border-strong)',
							'border-radius': 'var(--r-sm)',
							padding: '5px 7px',
							'box-shadow': '0 4px 14px color-mix(in oklab, black 18%, transparent)',
							'font-size': '10px',
							'font-weight': 500,
							'pointer-events': 'none',
						}}
					>
						{copied() ? `Copied ${value}` : `${value} · click to copy`}
					</code>
				)}
			</Show>
		</button>
	)
}

function ColorBaseLevelMatrix() {
	return (
		<div style={{ overflow: 'auto', 'padding-block-end': '4px' }}>
			<div style={{ display: 'grid', gap: '10px', 'min-width': '900px' }}>
				<For each={SEMANTIC_FAMILIES}>
					{(color) => (
						<div style={{ display: 'grid', 'grid-template-columns': '88px repeat(11, minmax(56px, 1fr))', gap: '6px', 'align-items': 'center' }}>
							<strong style={{ 'font-size': 'var(--t-xs)' }}>{color}</strong>
							<For each={COLOR_LEVELS}>
								{(level) => <ColorLevelSwatch color={color} level={level} />}
							</For>
						</div>
					)}
				</For>
			</div>
		</div>
	)
}

// Default stacks from theme-defaults.css, used when a role stays on 'default'.
// --font-label has NO default stack on purpose: unset, the micro-label
// voice falls through to whatever --font-data resolves to.
const DEFAULT_STACKS: Record<'display' | 'sans' | 'data', string> = {
	display: 'ui-sans-serif, system-ui, sans-serif',
	sans: 'ui-sans-serif, system-ui, sans-serif',
	data: '"Azeret Mono", ui-monospace, "SFMono-Regular", monospace',
}

// Map a preset's scheme-agnostic values onto the lab's per-scheme arg keys.
const schemeArgs = (v: SchemeValues, scheme: 'light' | 'dark'): Partial<ThemeLabArgs> =>
	scheme === 'light'
		? {
				baseLight: v.base,
				contentLight: v.content,
				primaryLight: v.primary,
				successLight: v.success,
				secondaryLight: v.secondary ?? '',
				accentLight: v.accent ?? '',
				neutralLight: v.neutral ?? '',
				infoLight: v.info ?? '',
				warningLight: v.warning ?? '',
				errorLight: v.error ?? '',
			}
		: {
				baseDark: v.base,
				contentDark: v.content,
				primaryDark: v.primary,
				successDark: v.success,
				secondaryDark: v.secondary ?? '',
				accentDark: v.accent ?? '',
				neutralDark: v.neutral ?? '',
				infoDark: v.info ?? '',
				warningDark: v.warning ?? '',
				errorDark: v.error ?? '',
			}

// The shipped theme-defaults.css values as a preset, one per rail, for an easy reset.
const canonicalPreset = (scheme: 'light' | 'dark'): ThemePreset => ({
	name: scheme === 'light' ? 'Marigold' : 'Lantern Gold',
	note: `Canonical — the shipped ui-solid ${scheme} scheme`,
	values:
		scheme === 'light'
			? {
					base: CANONICAL.baseLight,
					content: CANONICAL.contentLight,
					primary: CANONICAL.primaryLight,
					success: CANONICAL.successLight,
					secondary: CANONICAL.secondaryLight,
					accent: CANONICAL.accentLight,
					info: CANONICAL.infoLight,
					warning: CANONICAL.warningLight,
					error: CANONICAL.errorLight,
				}
			: {
					base: CANONICAL.baseDark,
					content: CANONICAL.contentDark,
					primary: CANONICAL.primaryDark,
					success: CANONICAL.successDark,
					secondary: CANONICAL.secondaryDark,
					accent: CANONICAL.accentDark,
					info: CANONICAL.infoDark,
					warning: CANONICAL.warningDark,
					error: CANONICAL.errorDark,
				},
})

// Each card is an independent canonical theme boundary: it supplies anchors
// and previews the roles produced by ui-solid's real derivation layer.
function PresetCard(props: { preset: ThemePreset; onApply: () => void }) {
	const v = () => props.preset.values
	return (
		<button
			class="ui-theme"
			type="button"
			onClick={() => props.onApply()}
			title={`Apply ${props.preset.name}`}
			style={{
				'--color-base-100': v().base,
				'--color-base-content': v().content,
				'--color-primary': v().primary,
				'--color-success': v().success,
				...(v().secondary ? { '--color-secondary': v().secondary } : {}),
				...(v().accent ? { '--color-accent': v().accent } : {}),
				...(v().neutral ? { '--color-neutral': v().neutral } : {}),
				...(v().info ? { '--color-info': v().info } : {}),
				...(v().warning ? { '--color-warning': v().warning } : {}),
				...(v().error ? { '--color-error': v().error } : {}),
				background: 'var(--color-base-200)',
				color: 'var(--color-base-content)',
				border: 'none',
				'box-shadow': 'inset 0 0 0 1px var(--color-border-strong)',
				'border-radius': '10px',
				padding: '10px 12px',
				display: 'grid',
				gap: '7px',
				'justify-items': 'start',
				cursor: 'pointer',
				width: '190px',
				'text-align': 'left',
				font: 'inherit',
			}}
		>
			<span style={{ display: 'grid', 'grid-template-columns': 'repeat(6, 15px)', gap: '5px' }}>
				<For each={[
					'--color-base-300',
					'--color-base-100',
					'--color-base-content',
					'--color-primary',
					'--color-secondary',
					'--color-accent',
					'--color-neutral',
					'--color-info',
					'--color-success',
					'--color-warning',
					'--color-error',
					'--color-ring',
				]}>
					{(token) => (
						<span
							style={{
								width: '15px',
								height: '15px',
								'border-radius': '50%',
								background: `var(${token})`,
								'box-shadow': 'inset 0 0 0 1px var(--color-border-strong)',
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
					color: 'var(--color-base-content-muted)',
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

const cssColorToHex = (color: string): string => {
	const canvas = document.createElement('canvas')
	canvas.width = 1
	canvas.height = 1
	const context = canvas.getContext('2d')
	if (!context) return '#000000'
	context.clearRect(0, 0, 1, 1)
	context.fillStyle = color
	context.fillRect(0, 0, 1, 1)
	const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
	return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const BUILDER_FIELDS = [
	['Surface', 'baseLight', 'baseDark'],
	['Content', 'contentLight', 'contentDark'],
	['Primary', 'primaryLight', 'primaryDark'],
	['Success', 'successLight', 'successDark'],
] as const satisfies readonly [string, keyof ThemeLabArgs, keyof ThemeLabArgs][]

const OPTIONAL_BUILDER_FIELDS = [
	['Secondary', '--color-secondary', 'secondaryLight', 'secondaryDark', 'Derived by canonical CSS from primary'],
	['Accent', '--color-accent', 'accentLight', 'accentDark', 'Derived by canonical CSS from primary'],
	['Neutral', '--color-neutral', 'neutralLight', 'neutralDark', 'Derived by canonical CSS from content'],
	['Info', '--color-info', 'infoLight', 'infoDark', 'Canonical semantic CSS default'],
	['Warning', '--color-warning', 'warningLight', 'warningDark', 'Canonical semantic CSS default'],
	['Error', '--color-error', 'errorLight', 'errorDark', 'Canonical semantic CSS default'],
] as const satisfies readonly [string, string, keyof ThemeLabArgs, keyof ThemeLabArgs, string][]

function ThemeBuilder(props: {
	args: ThemeLabArgs
	onChange: (patch: Partial<ThemeLabArgs>) => void
}) {
	const schemeBoundary = (
		scheme: 'light' | 'dark',
		token: string,
		lightKey: keyof ThemeLabArgs,
		darkKey: keyof ThemeLabArgs,
	) => {
		const light = props.args[lightKey].trim()
		const dark = props.args[darkKey].trim()
		const suffix = scheme === 'light' ? 'Light' : 'Dark'
		const style: Record<string, string> = {
			'color-scheme': scheme,
			'--color-base-100': props.args[`base${suffix}` as keyof ThemeLabArgs],
			'--color-base-content': props.args[`content${suffix}` as keyof ThemeLabArgs],
			'--color-primary': props.args[`primary${suffix}` as keyof ThemeLabArgs],
			'--color-success': props.args[`success${suffix}` as keyof ThemeLabArgs],
		}
		const override = scheme === 'light' ? light : dark
		if (override) style[token] = override
		return style
	}
	return (
		<div style={{ display: 'grid', gap: '14px' }}>
			<div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap' }}>
				<Button variant="soft" onClick={() => props.onChange(CANONICAL)}>
					Reset to canonical
				</Button>
				<Button
					variant="outline"
					onClick={() => props.onChange({
						baseLight: '#ffffff',
						baseDark: '#202020',
						contentLight: '#202020',
						contentDark: '#f2f2f2',
						primaryLight: '#666666',
						primaryDark: '#b8b8b8',
						successLight: '#4f7a56',
						successDark: '#85b28d',
						secondaryLight: '', secondaryDark: '',
						accentLight: '', accentDark: '',
						neutralLight: '', neutralDark: '',
						infoLight: '', infoDark: '',
						warningLight: '', warningDark: '',
						errorLight: '', errorDark: '',
					})}
				>
					Start from neutral
				</Button>
			</div>
			<div style={{ display: 'grid', 'grid-template-columns': 'minmax(100px, .7fr) repeat(2, minmax(150px, 1fr))', gap: '8px 12px', 'align-items': 'center' }}>
				<strong style={{ 'font-size': 'var(--t-xs)' }}>Anchor</strong>
				<Eyebrow>Light</Eyebrow>
				<Eyebrow>Dark</Eyebrow>
				<For each={BUILDER_FIELDS}>
					{([label, lightKey, darkKey]) => (
						<>
							<label for={`builder-${String(lightKey)}`} style={{ 'font-size': 'var(--t-sm)', 'font-weight': 600 }}>{label}</label>
							<div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
								<input
									id={`builder-${String(lightKey)}`}
									type="color"
									value={props.args[lightKey]}
									onInput={(event) => props.onChange({ [lightKey]: event.currentTarget.value } as Partial<ThemeLabArgs>)}
								/>
								<code>{props.args[lightKey]}</code>
							</div>
							<div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
								<input
									id={`builder-${String(darkKey)}`}
									type="color"
									value={props.args[darkKey]}
									onInput={(event) => props.onChange({ [darkKey]: event.currentTarget.value } as Partial<ThemeLabArgs>)}
								/>
								<code>{props.args[darkKey]}</code>
							</div>
						</>
					)}
				</For>
				<div style={{ 'grid-column': '1 / -1', 'border-top': '1px solid var(--color-border)', 'margin-block': '4px' }} />
				<strong style={{ 'font-size': 'var(--t-xs)' }}>Optional base override</strong>
				<span style={{ 'font-size': 'var(--t-2xs)', color: 'var(--color-base-content-muted)' }}>Light CSS colour</span>
				<span style={{ 'font-size': 'var(--t-2xs)', color: 'var(--color-base-content-muted)' }}>Dark CSS colour</span>
				<For each={OPTIONAL_BUILDER_FIELDS}>
					{([label, token, lightKey, darkKey, explanation]) => {
						let lightProbe: HTMLSpanElement | undefined
						let darkProbe: HTMLSpanElement | undefined
						const [lightPicker, setLightPicker] = createSignal('#000000')
						const [darkPicker, setDarkPicker] = createSignal('#000000')
						createEffect(
							() => JSON.stringify({
								baseLight: props.args.baseLight,
								baseDark: props.args.baseDark,
								contentLight: props.args.contentLight,
								contentDark: props.args.contentDark,
								primaryLight: props.args.primaryLight,
								primaryDark: props.args.primaryDark,
								light: props.args[lightKey],
								dark: props.args[darkKey],
							}),
							() => {
								requestAnimationFrame(() => {
									if (lightProbe) setLightPicker(cssColorToHex(getComputedStyle(lightProbe).backgroundColor))
									if (darkProbe) setDarkPicker(cssColorToHex(getComputedStyle(darkProbe).backgroundColor))
								})
							},
						)
						return <>
							<span style={{ display: 'grid', gap: '5px' }}>
								<strong style={{ 'font-size': 'var(--t-sm)' }}>{label}</strong>
								<span style={{ display: 'flex', gap: '6px', 'align-items': 'center' }}>
									<span ref={lightProbe} class="ui-theme theme-light" title={`Light ${token}`} style={{ ...schemeBoundary('light', token, lightKey, darkKey), width: '28px', height: '20px', 'border-radius': '5px', background: `var(${token})`, 'box-shadow': 'inset 0 0 0 1px var(--color-border-strong)' }} />
									<span ref={darkProbe} class="ui-theme theme-dark" title={`Dark ${token}`} style={{ ...schemeBoundary('dark', token, lightKey, darkKey), width: '28px', height: '20px', 'border-radius': '5px', background: `var(${token})`, 'box-shadow': 'inset 0 0 0 1px var(--color-border-strong)' }} />
									<small style={{ color: 'var(--color-base-content-muted)' }}>
										{props.args[lightKey].trim() || props.args[darkKey].trim() ? 'explicit override where supplied; derivation/default elsewhere' : explanation}
									</small>
								</span>
							</span>
							<div style={{ display: 'flex', gap: '7px', 'align-items': 'center' }}>
								<input type="color" aria-label={`${label} light override`} value={lightPicker()} onInput={(event) => props.onChange({ [lightKey]: event.currentTarget.value } as Partial<ThemeLabArgs>)} />
								<input type="text" value={props.args[lightKey]} placeholder="leave blank to derive" onInput={(event) => props.onChange({ [lightKey]: event.currentTarget.value } as Partial<ThemeLabArgs>)} />
							</div>
							<div style={{ display: 'flex', gap: '7px', 'align-items': 'center' }}>
								<input type="color" aria-label={`${label} dark override`} value={darkPicker()} onInput={(event) => props.onChange({ [darkKey]: event.currentTarget.value } as Partial<ThemeLabArgs>)} />
								<input type="text" value={props.args[darkKey]} placeholder="leave blank to derive" onInput={(event) => props.onChange({ [darkKey]: event.currentTarget.value } as Partial<ThemeLabArgs>)} />
							</div>
						</>
					}}
				</For>
			</div>
			<p style={{ margin: 0, color: 'var(--color-base-content-muted)', 'font-size': 'var(--t-sm)' }}>
				Preset clicks seed the four core anchors. Optional bases accept any CSS colour. Each light or dark override applies independently; an empty side retains its canonical derivation/default.
			</p>
		</div>
	)
}

const VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'text'] as const

const SURFACE_ROLES = [
	['--ui-surface', 'resting surface'],
	['--ui-surface-hover', 'hover surface'],
	['--ui-surface-active', 'active surface'],
	['--ui-surface-selected', 'selected surface'],
	['--ui-surface-disabled', 'disabled surface'],
] as const

function RoleLabel(props: { token: string; meaning: string }) {
	return (
		<span style={{ display: 'grid', gap: '2px' }}>
			<code style={{ 'font-size': 'var(--t-2xs)', 'font-weight': 700 }}>{props.token}</code>
			<span style={{ 'font-size': 'var(--t-2xs)', color: 'color-mix(in oklab, currentColor 72%, transparent)' }}>{props.meaning}</span>
		</span>
	)
}

function ResolverAnatomy(props: { colorBase: ColorBase; colorLevel: ColorLevel; variant: Variant }) {
	return (
		<div
			data-ui-color-base={props.colorBase}
			data-ui-color-level={props.colorLevel}
			data-ui-color-variant={props.variant}
			style={{ display: 'grid', gap: '16px' }}
		>
			<div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
				<For each={SURFACE_ROLES}>
					{([token, meaning]) => (
						<div style={{ display: 'grid', gap: '7px' }}>
							<div
								style={{
									background: `var(${token})`,
									border: '1px solid var(--ui-border)',
									'border-radius': 'var(--r-sm)',
									'block-size': '54px',
								}}
							/>
							<RoleLabel token={token} meaning={meaning} />
						</div>
					)}
				</For>
			</div>

			<div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
				<div
					style={{
						background: 'var(--ui-surface)',
						color: 'var(--ui-ink)',
						border: '2px solid var(--ui-border)',
						'border-radius': 'var(--r-md)',
						padding: '14px',
						display: 'grid',
						gap: '8px',
					}}
				>
					<strong style={{ color: 'var(--ui-ink)' }}>Foreground on the component surface</strong>
					<span style={{ color: 'var(--ui-ink-muted)' }}>Muted supporting foreground</span>
					<span style={{ color: 'var(--ui-ink-faint)' }}>Faint tertiary foreground</span>
					<div style={{ display: 'grid', gap: '5px', 'margin-top': '6px' }}>
						<RoleLabel token="--ui-ink" meaning="primary text/icons on --ui-surface" />
						<RoleLabel token="--ui-ink-muted" meaning="secondary text on --ui-surface" />
						<RoleLabel token="--ui-ink-faint" meaning="tertiary text on --ui-surface" />
						<RoleLabel token="--ui-border" meaning="edge around --ui-surface" />
					</div>
				</div>

				<div
					style={{
						background: 'var(--color-base-200)',
						color: 'var(--color-base-content)',
						border: '1px solid var(--color-border)',
						'border-radius': 'var(--r-md)',
						padding: '14px',
						display: 'grid',
						gap: '12px',
					}}
				>
					<strong>Graphics on the ambient page/panel surface</strong>
					<div style={{ height: '6px', 'border-radius': 'var(--r-pill)', background: 'var(--ui-track)', overflow: 'hidden' }}>
						<div style={{ width: '68%', height: '100%', background: 'var(--ui-color)' }} />
					</div>
					<div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
						<span style={{ width: '12px', height: '12px', 'border-radius': '50%', background: 'var(--ui-color)' }} />
						<span style={{ width: '64px', height: '3px', background: 'var(--ui-ink-muted)' }} />
					</div>
					<RoleLabel token="--ui-color" meaning="resolved base × perceptual level" />
					<RoleLabel token="--ui-ink-muted" meaning="de-emphasised foreground" />
					<RoleLabel token="--ui-track" meaning="track behind an ambient graphic" />
				</div>
			</div>
		</div>
	)
}

/** A system-wide specimen, intentionally composed only through public
 * component props and canonical presentation roles. */
function SystemCatalogue() {
	const [segment, setSegment] = createSignal<'overview' | 'activity' | 'members'>('overview')
	const [showcaseBase, setShowcaseBase] = createSignal<ColorBase>('info')
	const [showcaseLevel, setShowcaseLevel] = createSignal<ColorLevel>(600)
	const [showcaseVariant, setShowcaseVariant] = createSignal<Variant>('outline')
	const people = [
		{ name: 'Ada Lovelace', color: 'currentColor' },
		{ name: 'Grace Hopper', color: 'currentColor' },
		{ name: 'Alan Turing', color: 'currentColor' },
		{ name: 'Katherine Johnson', color: 'currentColor' },
	]

	return (
		<div style={{ display: 'grid', gap: '24px' }}>
			<div style={{ display: 'grid', gap: '12px', overflow: 'auto' }}>
				<Eyebrow>All semantic bases × all variants</Eyebrow>
				<div style={{ display: 'grid', gap: '10px', 'min-width': '850px' }}>
					<For each={SEMANTIC_FAMILIES}>
						{(colorBase) => (
							<div style={{ display: 'grid', 'grid-template-columns': '90px repeat(5, 1fr)', gap: '8px', 'align-items': 'center' }}>
								<strong style={{ 'font-size': 'var(--t-xs)' }}>{colorBase}</strong>
								<For each={VARIANTS}>
									{(variant) => (
										<Button colorBase={colorBase} colorLevel={500} variant={variant}>
											{variant}
										</Button>
									)}
								</For>
							</div>
						)}
					</For>
				</div>
			</div>

			<div style={{ display: 'grid', gap: '12px' }}>
				<Eyebrow>Shared treatment across component shapes</Eyebrow>
				<div style={{ display: 'flex', gap: '8px', 'flex-wrap': 'wrap', 'align-items': 'center' }}>
					<For each={VARIANTS}>
						{(variant) => (
							<Chip colorBase="info" colorLevel={600} variant={variant}>
								info · {variant}
							</Chip>
						)}
					</For>
					<StatusDot colorBase="success" colorLevel={600} variant="solid" status={{ color: 'currentColor', live: true }} />
					<Counter colorBase="warning" colorLevel={600} variant="text" value={1284} />
				</div>
				<div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
					<For each={VARIANTS}>
						{(variant, index) => (
							<Panel
								index={`0${index() + 1}`}
								title={variant}
								kicker="One resolver; component-local geometry"
								colorBase="accent"
								colorLevel={500}
								variant={variant}
							>
								<p style={{ margin: 0, color: 'var(--ui-ink-muted)', 'font-size': 'var(--t-sm)' }}>
									Surface, border, ink, hierarchy and interaction states all come from shared roles.
								</p>
							</Panel>
						)}
					</For>
				</div>
			</div>

			<Panel title="Configurable specimen" kicker="Public three-axis component contract" colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()}>
				<div style={{ display: 'flex', gap: '12px', 'flex-wrap': 'wrap', 'align-items': 'end' }}>
					<Field label="colorBase">
						<select value={showcaseBase()} onChange={(event) => setShowcaseBase(event.currentTarget.value as ColorBase)}>
							<For each={SEMANTIC_FAMILIES}>{(value) => <option value={value}>{value}</option>}</For>
						</select>
					</Field>
					<Field label="colorLevel">
						<select value={showcaseLevel()} onChange={(event) => setShowcaseLevel(Number(event.currentTarget.value) as ColorLevel)}>
							<For each={COLOR_LEVELS}>{(value) => <option value={value}>{value}</option>}</For>
						</select>
					</Field>
					<Field label="variant">
						<select value={showcaseVariant()} onChange={(event) => setShowcaseVariant(event.currentTarget.value as Variant)}>
							<For each={VARIANTS}>{(value) => <option value={value}>{value}</option>}</For>
						</select>
					</Field>
					<Chip colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()}>
						{showcaseBase()} · {showcaseLevel()} · {showcaseVariant()}
					</Chip>
				</div>
			</Panel>

			<Panel title="Resolver anatomy" kicker={`${showcaseBase()} · ${showcaseLevel()} · ${showcaseVariant()}`}>
				<ResolverAnatomy colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()} />
			</Panel>

			<div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', 'align-items': 'start' }}>
				<Panel title="Identity and wayfinding" kicker={`${showcaseBase()} · ${showcaseLevel()} · ${showcaseVariant()}`} colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()}>
					<div style={{ display: 'grid', gap: '16px' }}>
						<Breadcrumb
							items={[{ label: 'Commons', href: '#' }, { label: 'Research', href: '#' }, { label: 'Theme system' }]}
							colorBase="neutral"
							variant="solid"
						/>
						<div style={{ display: 'flex', gap: '14px', 'align-items': 'center', 'flex-wrap': 'wrap' }}>
							<Avatar name="Ada Lovelace" faceColor="currentColor" status={{ color: 'var(--color-success)', live: true }} colorBase="primary" variant="soft" />
							<AvatarStack people={people} max={3} colorBase="secondary" variant="outline" />
							<IconButton label="Add collaborator">＋</IconButton>
						</div>
					</div>
				</Panel>

				<Panel title="Data marks" kicker={`${showcaseBase()} · ${showcaseLevel()} · ${showcaseVariant()}`} colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()}>
					<div style={{ display: 'grid', gap: '14px' }}>
						<Counter colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()} value={72} format={(n) => `${Math.round(n)}%`} />
						<Meter colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()} value={72} max={100} />
						<Sparkline colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()} data={[12, 18, 14, 27, 24, 39, 35, 52]} />
						<Waveform colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()} bars={[0.2, 0.55, 0.35, 0.9, 0.68, 0.42, 0.78, 0.3, 0.62]} />
						<Rule colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()} label="derived mark hierarchy" />
					</div>
				</Panel>

				<Panel title="Native interaction" kicker={`${showcaseBase()} · ${showcaseLevel()} · ${showcaseVariant()}`} colorBase={showcaseBase()} colorLevel={showcaseLevel()} variant={showcaseVariant()}>
					<div style={{ display: 'grid', gap: '16px' }}>
						<Segmented
							options={[{ id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity' }, { id: 'members', label: 'Members' }]}
							value={segment()}
							onChange={setSegment}
						/>
						<Field label="Selected view">
							<input value={segment()} readonly />
						</Field>
						<Accordion label="Resolver details" density="compact" spacing="separated">
							<AccordionItem summary="What does the theme author?" open>
								Only genuine anchors. <Mark tone="highlight">Every displayed role is derived.</Mark>
							</AccordionItem>
							<AccordionItem summary="What does a component consume?">
								Presentation roles such as surface, ink, border, mark and focus ring.
							</AccordionItem>
						</Accordion>
					</div>
				</Panel>
			</div>
		</div>
	)
}

export const Lab: Story = {
	name: 'Theme Lab (all tokens live)',
	render: (args) => {
		let wrap: HTMLDivElement | undefined
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
			for (const [token, lightKey, darkKey] of OPTIONAL_PAIRS) {
				const light = args[lightKey].trim()
				const dark = args[darkKey].trim()
				if (light || dark) {
					const fallback = optionalDefault(token)
					out[token] = `light-dark(${light || fallback}, ${dark || fallback})`
				}
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
			for (const [token] of OPTIONAL_PAIRS) {
				if (!(token in values)) wrap.style.removeProperty(token)
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
				...OPTIONAL_PAIRS.flatMap(([token, lightKey, darkKey]) => {
					const light = args[lightKey].trim()
					const dark = args[darkKey].trim()
					const fallback = optionalDefault(token)
					return light || dark
						? [`\t${token}: light-dark(${light || fallback}, ${dark || fallback});`]
						: []
				}),
				'\t/* ui-solid derives the surface ladder, content hierarchy, */',
				'\t/* borders, content partners and remaining colour families. */',
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
				class="ui-theme"
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

				<Rule label="Custom theme builder" />
				<ThemeBuilder args={args} onChange={(patch) => updateArgs(patch)} />

				<Rule label="Type specimens" />
				{/* ── Type specimens, one per font role ── */}
				<div style={{ display: 'grid', gap: '10px' }}>
					<Eyebrow colorBase="primary">--font-display</Eyebrow>
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
					<Eyebrow colorBase="primary">--font-sans</Eyebrow>
					<p style={{ margin: '0', 'max-width': '58ch', color: 'var(--color-base-content-muted)' }}>
						Workshops, working groups, and shared infrastructure for people building with AI in the
						public interest. Body copy rides the sans role; secondary ink is derived from
						your text colour.
					</p>
					<Eyebrow colorBase="primary">--font-data</Eyebrow>
					<div style={{ 'font-family': 'var(--font-data)', 'font-size': '20px' }}>
						0123456789 · 87% · 12:45 PM · {'{ x: 0.618 }'}
					</div>
					<Eyebrow colorBase="primary">--font-label</Eyebrow>
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

				<Rule label="Colour base × perceptual level" />
				<ColorBaseLevelMatrix />

				<Rule label="System catalogue" />
				<SystemCatalogue />

				<Rule label="theme output" />
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
