// The theme contract an app authors on its theme root — the one TypeScript
// list of it. The values themselves live in CSS: theme-defaults.css holds
// ui-solid's defaults (and derives everything else from the anchors), and
// properties.css registers every token. Nothing here restates a value.
//
// Colour anchors are the only colours a theme writes; each is one
// `light-dark(light, dark)` value. The six families that ui-solid can supply
// by itself name that output in `follows`, so a theme may hand the family
// back to ui-solid instead of picking a colour.

import { FONT_ROLES, fontToken } from './fonts'
import type { SchemeValues } from './presets'

export type ColorAnchor = {
	token: `--color-${string}`
	/** The matching key in a preset's SchemeValues. */
	key: keyof SchemeValues
	label: string
	note: string
	follows?: { value: `var(--ui-theme-${string}-default)`; label: string }
}

export const COLOR_ANCHORS: readonly ColorAnchor[] = [
	{
		token: '--color-base-100',
		key: 'base',
		label: 'Surface',
		note: 'The raised material. The page background steps, borders and overlays derive from it.',
	},
	{
		token: '--color-base-content',
		key: 'content',
		label: 'Text',
		note: 'Body ink. Muted and faint text derive from it.',
	},
	{
		token: '--color-primary',
		key: 'primary',
		label: 'Primary',
		note: 'The lead family: primary buttons, links, the focus ring and the soft wash.',
	},
	{
		token: '--color-secondary',
		key: 'secondary',
		label: 'Secondary',
		note: 'A second family for components set to colorBase="secondary".',
		follows: { value: 'var(--ui-theme-secondary-default)', label: 'Follow primary' },
	},
	{
		token: '--color-accent',
		key: 'accent',
		label: 'Accent',
		note: 'A third family for components set to colorBase="accent".',
		follows: { value: 'var(--ui-theme-accent-default)', label: 'Follow primary' },
	},
	{
		token: '--color-neutral',
		key: 'neutral',
		label: 'Neutral',
		note: 'The quiet family: neutral buttons, chips and breadcrumbs.',
		follows: { value: 'var(--ui-theme-neutral-default)', label: 'Follow text' },
	},
	{
		token: '--color-info',
		key: 'info',
		label: 'Info',
		note: 'Informational states.',
		follows: { value: 'var(--ui-theme-info-default)', label: 'ui-solid default' },
	},
	{
		token: '--color-success',
		key: 'success',
		label: 'Success',
		note: 'Positive states and live indicators.',
	},
	{
		token: '--color-warning',
		key: 'warning',
		label: 'Warning',
		note: 'Cautionary states.',
		follows: { value: 'var(--ui-theme-warning-default)', label: 'ui-solid default' },
	},
	{
		token: '--color-error',
		key: 'error',
		label: 'Error',
		note: 'Destructive and failed states.',
		follows: { value: 'var(--ui-theme-error-default)', label: 'ui-solid default' },
	},
]

export const FONT_TOKENS = FONT_ROLES.map(fontToken)

export type SizeLadder = {
	prefix: `--${string}`
	label: string
	note: string
	/** What the studio shows beside the steps: a type specimen per step, a
	 *  rounded box per step, or ONE finished plate for the whole ladder. */
	specimen: 'type' | 'radius' | 'surface'
}

/** The scheme-independent ladders. Their steps are not listed here: the
 *  studio reads them from the `@property` registrations under each prefix,
 *  in the order properties.css declares them, each with its syntax. */
export const SIZE_LADDERS: readonly SizeLadder[] = [
	{ prefix: '--t-', label: 'Type scale', note: 'The text sizes every ui-solid component reads. Any CSS length.', specimen: 'type' },
	{ prefix: '--r-', label: 'Corner radii', note: 'The corner steps every ui-solid component reads. Any CSS length.', specimen: 'radius' },
	{
		prefix: '--s-',
		label: 'Surface finish',
		note: 'How every plate is finished — its shine (grade, angle), its three rings (inner, gap, outer), its bevel, its corner studs, its cast shadow, its lift on hover and its corner shape. At zero, the flat house look.',
		specimen: 'surface',
	},
]

export type Scheme = 'light' | 'dark'
export const SCHEMES: readonly Scheme[] = ['light', 'dark']
