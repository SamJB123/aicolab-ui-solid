/** @jsxImportSource @solidjs/web */
// The component catalogue: every colour family, level and variant, the font
// roles and the size ladders, rendered twice — a light pane and a dark pane.
// Each pane is a theme boundary (.ui-theme) that declares the whole current
// theme and forces its scheme, so ui-solid re-derives every role inside it.
// Composed only through public component props and presentation roles.

import type { JSX } from '@solidjs/web'
import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { Field, IconButton, Segmented } from '../controls'
import { Accordion, AccordionItem, Mark } from '../marketing'
import {
	Avatar,
	AvatarStack,
	type AvatarStackPerson,
	Breadcrumb,
	Button,
	Chip,
	type ColorBase,
	type ColorLevel,
	Counter,
	Eyebrow,
	Meter,
	Panel,
	Rule,
	SelectControl,
	Sparkline,
	StatusDot,
	type Variant,
	Waveform,
} from '../primitives'
import { type Scheme, SCHEMES, type SizeLadder } from './contract'
import { FONT_ROLE_NAMES, FONT_ROLES, fontToken } from './fonts'
import type { RegisteredToken } from './read-theme'

const FAMILIES: readonly ColorBase[] = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error']
const LEVELS: readonly ColorLevel[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const VARIANTS: readonly Variant[] = ['solid', 'soft', 'outline', 'ghost', 'text']
const VARIANT_OPTIONS: { id: Variant; label: string }[] = VARIANTS.map((variant) => ({ id: variant, label: variant }))

const SURFACE_TOKENS = [
	'--color-base-100',
	'--color-base-150',
	'--color-base-200',
	'--color-base-300',
	'--color-base-content',
	'--color-base-content-muted',
	'--color-base-content-faint',
	'--color-border',
	'--color-border-strong',
	'--color-primary-soft',
]

const SURFACE_ROLES: readonly { token: string; meaning: string }[] = [
	{ token: '--ui-surface', meaning: 'resting surface' },
	{ token: '--ui-surface-hover', meaning: 'hover surface' },
	{ token: '--ui-surface-active', meaning: 'active surface' },
	{ token: '--ui-surface-selected', meaning: 'selected surface' },
	{ token: '--ui-surface-disabled', meaning: 'disabled surface' },
]

const PEOPLE: AvatarStackPerson[] = [
	{ name: 'Ada Lovelace', color: 'currentColor' },
	{ name: 'Grace Hopper', color: 'currentColor' },
	{ name: 'Alan Turing', color: 'currentColor' },
	{ name: 'Katherine Johnson', color: 'currentColor' },
]

type Treatment = { colorBase: ColorBase; colorLevel: ColorLevel; variant: Variant }

const find = <T,>(options: readonly T[], value: string): T | undefined => options.find((option) => String(option) === value)

export function Catalogue(props: {
	themeStyle: Record<`--${string}`, string>
	ladders: readonly (SizeLadder & { steps: RegisteredToken[] })[]
}) {
	const [colorBase, setColorBase] = createSignal<ColorBase>('info')
	const [colorLevel, setColorLevel] = createSignal<ColorLevel>(600)
	const [variant, setVariant] = createSignal<Variant>('outline')
	const treatment = (): Treatment => ({ colorBase: colorBase(), colorLevel: colorLevel(), variant: variant() })
	return (
		<div class="ui-studio-catalogue">
			<div class="ui-studio-catalogue-bar">
				<Field label="Family">
					<SelectControl
						value={colorBase()}
						onChange={(event) => {
							const next = find(FAMILIES, event.currentTarget.value)
							if (next !== undefined) setColorBase(next)
						}}
					>
						<For each={FAMILIES}>{(family) => <option value={family}>{family}</option>}</For>
					</SelectControl>
				</Field>
				<Field label="Level">
					<SelectControl
						value={String(colorLevel())}
						onChange={(event) => {
							const next = find(LEVELS, event.currentTarget.value)
							if (next !== undefined) setColorLevel(next)
						}}
					>
						<For each={LEVELS}>{(level) => <option value={String(level)}>{level}</option>}</For>
					</SelectControl>
				</Field>
				<Segmented label="Variant" options={VARIANT_OPTIONS} value={variant()} onChange={setVariant} />
				<span class="ui-studio-note">The specimen panels below use this treatment.</span>
			</div>
			<div class="ui-studio-panes">
				<For each={SCHEMES}>
					{(scheme) => (
						<section
							class="ui-theme ui-studio-pane"
							data-scheme={scheme}
							style={{ ...props.themeStyle, 'color-scheme': scheme }}
							aria-label={`${scheme === 'light' ? 'Light' : 'Dark'} components`}
						>
							<span class="ui-studio-pane-tag" aria-hidden="true">
								{scheme}
							</span>
							<Specimens scheme={scheme} treatment={treatment()} ladders={props.ladders} themeStyle={props.themeStyle} />
						</section>
					)}
				</For>
			</div>
		</div>
	)
}

/** One finished plate beside a treated button, a soft button and a chip:
 *  what the surface finish in force where this sits does to every plate.
 *  The studio's chrome passes the draft's finish as `style`; a preview pane
 *  already carries it. */
export function PlateSpecimen(props: { style?: JSX.CSSProperties }) {
	return (
		<div class="ui-studio-plates" style={props.style}>
			<span class="ui-studio-plate-sample" data-ui-plate="">
				No family
			</span>
			<Button colorBase="primary">Primary</Button>
			<Button colorBase="neutral" variant="soft">
				Soft
			</Button>
			<Chip tone="accent">chip</Chip>
		</div>
	)
}

function Specimens(props: {
	scheme: Scheme
	treatment: Treatment
	ladders: readonly (SizeLadder & { steps: RegisteredToken[] })[]
	themeStyle: Record<`--${string}`, string>
}) {
	const label = () => `${props.treatment.colorBase} · ${props.treatment.colorLevel} · ${props.treatment.variant}`
	return (
		<div class="ui-studio-specimens">
			<Rule label="Type" />
			<div class="ui-studio-type">
				<For each={FONT_ROLES}>
					{(role) => (
						<div class="ui-studio-type-row" data-role={role}>
							<Eyebrow colorBase="primary">{FONT_ROLE_NAMES[role].label}</Eyebrow>
							<span class="ui-studio-type-sample" style={{ 'font-family': role === 'label' ? `var(${fontToken(role)}, var(--font-data))` : `var(${fontToken(role)})` }}>
								{role === 'display'
									? 'A commons for collective intelligence'
									: role === 'sans'
										? 'Workshops, working groups and shared infrastructure for people building with AI in the public interest.'
										: role === 'data'
											? '0123456789 · 87% · 12:45 PM · { x: 0.618 }'
											: 'eyebrows · chips · kickers · field labels'}
							</span>
						</div>
					)}
				</For>
			</div>

			<Rule label="Surfaces and text" />
			<div class="ui-studio-swatches">
				<For each={SURFACE_TOKENS}>
					{(token) => (
						<div class="ui-studio-swatch-cell">
							<span class="ui-studio-swatch-chip" style={{ background: `var(${token})` }} />
							<code>{token.replace('--color-', '')}</code>
						</div>
					)}
				</For>
			</div>

			<Rule label="Families × levels" />
			<div class="ui-studio-matrix">
				<For each={FAMILIES}>
					{(family) => (
						<div class="ui-studio-matrix-row">
							<strong>{family}</strong>
							<For each={LEVELS}>{(level) => <LevelSwatch family={family} level={level} />}</For>
						</div>
					)}
				</For>
			</div>

			<Rule label="Families × variants" />
			<div class="ui-studio-variants">
				<For each={FAMILIES}>
					{(family) => (
						<div class="ui-studio-variants-row">
							<strong>{family}</strong>
							<For each={VARIANTS}>
								{(v) => (
									<Button colorBase={family} variant={v}>
										{v}
									</Button>
								)}
							</For>
						</div>
					)}
				</For>
			</div>

			<Rule label="One treatment, many shapes" />
			<div class="ui-studio-shapes">
				<For each={VARIANTS}>
					{(v) => (
						<Chip colorBase="info" colorLevel={600} variant={v}>
							info · {v}
						</Chip>
					)}
				</For>
				<StatusDot colorBase="success" colorLevel={600} variant="solid" status={{ color: 'currentColor', live: true }} />
				<Counter colorBase="warning" colorLevel={600} variant="text" value={1284} />
			</div>

			<Rule label={`Specimen: ${label()}`} />
			<div class="ui-studio-specimen-panels">
				<Panel title="Resolver roles" kicker={label()} {...props.treatment}>
					<ResolverAnatomy treatment={props.treatment} />
				</Panel>
				<Panel title="Identity and wayfinding" kicker={label()} {...props.treatment}>
					<div class="ui-studio-stack">
						<Breadcrumb items={[{ label: 'Commons', href: '#' }, { label: 'Research', href: '#' }, { label: 'Theme' }]} colorBase="neutral" variant="solid" />
						<div class="ui-studio-row">
							<Avatar name="Ada Lovelace" faceColor="currentColor" status={{ color: 'var(--color-success)', live: true }} colorBase="primary" variant="soft" />
							<AvatarStack people={PEOPLE} max={3} colorBase="secondary" variant="outline" />
							<IconButton label="Add collaborator">＋</IconButton>
						</div>
					</div>
				</Panel>
				<Panel title="Data marks" kicker={label()} {...props.treatment}>
					<div class="ui-studio-stack">
						<Counter {...props.treatment} value={72} format={(n) => `${Math.round(n)}%`} />
						<Meter {...props.treatment} value={72} max={100} />
						<Sparkline {...props.treatment} data={[12, 18, 14, 27, 24, 39, 35, 52]} />
						<Waveform {...props.treatment} bars={[0.2, 0.55, 0.35, 0.9, 0.68, 0.42, 0.78, 0.3, 0.62]} />
						<Rule {...props.treatment} label="derived mark hierarchy" />
					</div>
				</Panel>
				<Panel title="Native interaction" kicker={label()} {...props.treatment}>
					<NativeInteraction scheme={props.scheme} />
				</Panel>
			</div>

			<For each={props.ladders}>
				{(ladder) => (
					<>
						<Rule label={ladder.label} />
						<Switch>
							<Match when={ladder.specimen === 'surface'}>
								<div class="ui-studio-surface-ladder">
									<PlateSpecimen />
									<div class="ui-studio-surface-steps">
										<For each={ladder.steps}>
											{(step) => (
												<code>
													{step.token}: {props.themeStyle[step.token] ?? step.initial}
												</code>
											)}
										</For>
									</div>
								</div>
							</Match>
							<Match when={ladder.specimen !== 'surface'}>
								<div class={ladder.specimen === 'type' ? 'ui-studio-type-ladder' : 'ui-studio-radius-ladder'}>
									<For each={ladder.steps}>
										{(step) => (
											<div class="ui-studio-ladder-cell">
												<Show
													when={ladder.specimen === 'type'}
													fallback={<span class="ui-studio-radius-box" style={{ 'border-radius': `var(${step.token})` }} />}
												>
													<span class="ui-studio-type-step" style={{ 'font-size': `var(${step.token})` }}>
														Aa
													</span>
												</Show>
												<code>{step.token}</code>
											</div>
										)}
									</For>
								</div>
							</Match>
						</Switch>
					</>
				)}
			</For>
		</div>
	)
}

function LevelSwatch(props: { family: ColorBase; level: ColorLevel }) {
	let swatch: HTMLButtonElement | undefined
	const [value, setValue] = createSignal('')
	const [copied, setCopied] = createSignal(false)
	const read = () => {
		const resolved = swatch ? getComputedStyle(swatch).backgroundColor : ''
		setValue(resolved)
		return resolved
	}
	return (
		<button
			ref={swatch}
			type="button"
			class="ui-studio-level"
			data-ui-color-base={props.family}
			data-ui-color-level={props.level}
			aria-label={`Copy the resolved ${props.family} ${props.level} colour`}
			title={value() ? `${props.family} ${props.level}: ${value()}${copied() ? ' (copied)' : ' — click to copy'}` : `${props.family} ${props.level}`}
			onPointerEnter={read}
			onFocus={read}
			onPointerLeave={() => setCopied(false)}
			onClick={() => {
				const resolved = read()
				if (resolved) void navigator.clipboard.writeText(resolved).then(() => setCopied(true))
			}}
		>
			{props.level}
		</button>
	)
}

function RoleLabel(props: { token: string; meaning: string }) {
	return (
		<span class="ui-studio-role">
			<code>{props.token}</code>
			<span>{props.meaning}</span>
		</span>
	)
}

function ResolverAnatomy(props: { treatment: Treatment }) {
	return (
		<div
			class="ui-studio-anatomy"
			data-ui-color-base={props.treatment.colorBase}
			data-ui-color-level={props.treatment.colorLevel}
			data-ui-color-variant={props.treatment.variant}
		>
			<div class="ui-studio-anatomy-surfaces">
				<For each={SURFACE_ROLES}>
					{(role) => (
						<div class="ui-studio-anatomy-surface">
							<span class="ui-studio-anatomy-swatch" style={{ background: `var(${role.token})` }} />
							<RoleLabel token={role.token} meaning={role.meaning} />
						</div>
					)}
				</For>
			</div>
			<div class="ui-studio-anatomy-ink">
				<strong>Foreground on the component surface</strong>
				<span class="ui-studio-ink-muted">Muted supporting foreground</span>
				<span class="ui-studio-ink-faint">Faint tertiary foreground</span>
			</div>
			<div class="ui-studio-anatomy-marks">
				<div class="ui-studio-anatomy-track">
					<span />
				</div>
				<RoleLabel token="--ui-color" meaning="the family at this level" />
				<RoleLabel token="--ui-track" meaning="the track behind a mark" />
			</div>
		</div>
	)
}

function NativeInteraction(props: { scheme: Scheme }) {
	const [segment, setSegment] = createSignal<'overview' | 'activity' | 'members'>('overview')
	return (
		<div class="ui-studio-stack">
			<Segmented
				label={`Sections (${props.scheme})`}
				options={[
					{ id: 'overview', label: 'Overview' },
					{ id: 'activity', label: 'Activity' },
					{ id: 'members', label: 'Members' },
				]}
				value={segment()}
				onChange={setSegment}
			/>
			<Field label="Selected view">
				<input value={segment()} readonly />
			</Field>
			<Accordion label="Resolver details" density="compact" spacing="separated">
				<AccordionItem summary="What does the theme author?" open>
					Only its anchors. <Mark tone="highlight">Every displayed role is derived.</Mark>
				</AccordionItem>
				<AccordionItem summary="What does a component consume?">
					Presentation roles such as surface, ink, border, mark and focus ring.
				</AccordionItem>
			</Accordion>
		</div>
	)
}
