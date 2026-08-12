/** @jsxImportSource @solidjs/web */
// Preview annotations for @aicolab/ui-solid.
//
// Theming model under test: every colour token is ONE light-dark() pair
// (see ../src/theme-defaults.css); the mode is selected purely by
// `color-scheme` — `[data-theme]` / `.theme-light` / `.theme-dark` on ANY
// ancestor flips it for that subtree, and the default follows the OS via
// `color-scheme: light dark` on :root.
//
// The Theme toolbar drives that directly:
//   Auto  — no data-theme on <html>; the OS decides.
//   Light — data-theme="light" on <html>.
//   Dark  — data-theme="dark" on <html>.
//   Split — the SAME story mounted twice, one subtree wrapped in
//           .theme-light and one in .theme-dark, for pixel-for-pixel
//           comparison while tuning token values.
//
// `createJSXDecorator` mounts this decorator once per story; the theme
// global arrives as a reactive store, so switching modes swaps the layout
// (and the <html> attribute, via the effect) without a remount storm.

// styles.css @imports the base reset itself (since 2026-08-07), so the
// package floor is this one sheet — exactly the same as any consuming app.
import '../src/styles.css'
import './preview.css'

import { createEffect, Show } from 'solid-js'
import { createJSXDecorator, type Preview } from 'storybook-solidjs-vite'
import { ensureGoogleFontLoaded, FONT_OPTIONS, FONT_ROLES, fontOption } from './fonts'

type ThemeMode = 'auto' | 'light' | 'dark' | 'split'

const themeMode = (value: unknown): ThemeMode =>
	value === 'light' || value === 'dark' || value === 'split' ? value : 'auto'

// Split-mode support: styles.css registers typed theme properties via @property. A
// syntax "<color>", and a registered property's light-dark() resolves
// against the color-scheme of the element it is DECLARED on (:root here) —
// descendants inherit the already-resolved colour, so wrapping a subtree in
// .theme-dark alone cannot flip registered tokens declared only at :root
// (probe-verified in Chrome 149; unregistered tokens DO flip per-usage).
// Fix without forking the palette: re-host ONLY authored theme anchors on each
// pane. The pane is a .ui-theme boundary, so ui-solid derives its entire role
// set locally. Storybook therefore exercises the same anchor-only contract as
// a consumer application instead of copying a derived token matrix.
const THEME_ANCHORS = new Set([
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
])

const rehostThemeAnchors = (el: HTMLElement) => {
	for (let s = 0; s < document.styleSheets.length; s++) {
		let rules: CSSRuleList
		try {
			rules = document.styleSheets[s].cssRules
		} catch {
			continue // cross-origin sheet — none of ours
		}
		for (let r = 0; r < rules.length; r++) {
			const rule = rules[r]
			if (!(rule instanceof CSSStyleRule) || rule.selectorText !== ':root') continue
			for (let d = 0; d < rule.style.length; d++) {
				const name = rule.style.item(d)
				if (THEME_ANCHORS.has(name)) el.style.setProperty(name, rule.style.getPropertyValue(name))
			}
		}
	}
}

// A pane also needs any INLINE overrides currently on <html> (the Fonts
// toolbar writes --font-* there): the pane's re-hosted stylesheet values
// are inline on the pane itself, which would beat inherited html overrides.
const applyPaneTokens = (el: HTMLElement) => {
	rehostThemeAnchors(el)
	const rootStyle = document.documentElement.style
	for (let i = 0; i < rootStyle.length; i++) {
		const name = rootStyle.item(i)
		if (THEME_ANCHORS.has(name) || name.startsWith('--font-')) {
			el.style.setProperty(name, rootStyle.getPropertyValue(name))
		}
	}
}

const withTheme = createJSXDecorator((Story, context) => {
	const mode = () => themeMode(context.globals.theme)
	let lightPane: HTMLElement | undefined
	let darkPane: HTMLElement | undefined

	// Fonts toolbar: pick a Google Fonts candidate per font role. The choice
	// is applied as an inline --font-* override on <html> (theme default =
	// no override), with the css2 stylesheet injected on demand.
	const fontChoices = () => ({
		display: fontOption('display', context.globals.fontDisplay),
		sans: fontOption('sans', context.globals.fontSans),
		data: fontOption('data', context.globals.fontData),
		label: fontOption('label', context.globals.fontLabel),
	})

	// Forced single mode rides <html data-theme> → theme-defaults.css maps it to
	// `color-scheme`. Auto and Split clear it (Split's panes force their own).
	createEffect(
		() => ({ m: mode(), fonts: fontChoices() }),
		({ m, fonts }) => {
			const root = document.documentElement
			if (m === 'light' || m === 'dark') root.setAttribute('data-theme', m)
			else root.removeAttribute('data-theme')
			for (const role of FONT_ROLES) {
				const choice = fonts[role]
				if (choice && choice.stack !== undefined) {
					ensureGoogleFontLoaded(choice)
					root.style.setProperty(`--font-${role}`, choice.stack)
				} else {
					root.style.removeProperty(`--font-${role}`)
				}
			}
			// Split panes hold their own inline token copies — refresh them so
			// mode/font changes propagate.
			for (const pane of [lightPane, darkPane]) {
				if (pane?.isConnected) applyPaneTokens(pane)
			}
			return () => {
				root.removeAttribute('data-theme')
				for (const role of FONT_ROLES) root.style.removeProperty(`--font-${role}`)
			}
		},
	)

	return (
		<Show when={mode() === 'split'} fallback={<Story />}>
			<div class="sb-theme-split">
				<section
					class="sb-theme-pane theme-light ui-theme"
					ref={(el) => {
						lightPane = el
						applyPaneTokens(el)
					}}
				>
					<span class="sb-theme-pane-tag" aria-hidden="true">
						light
					</span>
					<Story />
				</section>
				<section
					class="sb-theme-pane theme-dark ui-theme"
					ref={(el) => {
						darkPane = el
						applyPaneTokens(el)
					}}
				>
					<span class="sb-theme-pane-tag" aria-hidden="true">
						dark
					</span>
					<Story />
				</section>
			</div>
		</Show>
	)
})

const preview: Preview = {
	decorators: [withTheme],
	globalTypes: {
		theme: {
			description: 'Colour scheme for the light-dark() token contract',
			toolbar: {
				title: 'Theme',
				icon: 'paintbrush',
				items: [
					{ value: 'auto', title: 'Auto (OS)', icon: 'browser' },
					{ value: 'light', title: 'Light', icon: 'sun' },
					{ value: 'dark', title: 'Dark', icon: 'moon' },
					{ value: 'split', title: 'Split — light | dark', icon: 'sidebyside' },
				],
				dynamicTitle: true,
			},
		},
		fontDisplay: {
			description: 'Candidate for the --font-display role (Google Fonts)',
			toolbar: {
				title: 'Display font',
				items: FONT_OPTIONS.display.map((o) => ({ value: o.id, title: o.label })),
				dynamicTitle: true,
			},
		},
		fontSans: {
			description: 'Candidate for the --font-sans role (Google Fonts)',
			toolbar: {
				title: 'Sans font',
				items: FONT_OPTIONS.sans.map((o) => ({ value: o.id, title: o.label })),
				dynamicTitle: true,
			},
		},
		fontData: {
			description: 'Candidate for the --font-data role (Google Fonts)',
			toolbar: {
				title: 'Data font',
				items: FONT_OPTIONS.data.map((o) => ({ value: o.id, title: o.label })),
				dynamicTitle: true,
			},
		},
		fontLabel: {
			description:
				'Candidate for the --font-label role — micro-labels: eyebrows, chips, panel kickers, field labels, calendar weekday heads. Theme default follows the Data font.',
			toolbar: {
				title: 'Label font',
				items: FONT_OPTIONS.label.map((o) => ({ value: o.id, title: o.label })),
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		theme: 'auto',
		fontDisplay: 'default',
		fontSans: 'default',
		fontData: 'default',
		fontLabel: 'default',
	},
	parameters: {
		layout: 'padded',
		options: {
			storySort: {
				order: ['Foundations', 'Atoms', 'Molecules', 'Organisms'],
			},
		},
		// The page surface comes from the token contract (--color-base-200), not from
		// Storybook's white/dark background presets.
		backgrounds: { disable: true },
	},
	tags: ['autodocs'],
}

export default preview
