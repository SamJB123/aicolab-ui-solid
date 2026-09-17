/** @jsxImportSource @solidjs/web */
import { createSignal, onSettled } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import type { ClassProp, ColorTreatmentProps } from '../../shared/color-treatment'
import type { UiColor, UiLength, UiLengthPercentage } from '../../shared/knobs'

export type ThemeMode = 'auto' | 'light' | 'dark'

const THEME_KEY = 'ui-solid:theme'
const THEME_ICON: Record<ThemeMode, string> = { auto: '◐', light: '☀', dark: '●' }
const THEME_NAME: Record<ThemeMode, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' }

const applyTheme = (mode: ThemeMode): void => {
	document.documentElement.style.colorScheme = mode === 'auto' ? '' : mode
}

/**
 * Inline boot script for a document <head>: re-applies the persisted theme
 * BEFORE first paint. The toggle itself restores the choice only after
 * hydration (it must render Auto on the server), so without this a person
 * who chose Dark on a light-scheme OS sees a light flash on every load.
 * Render it as `<script innerHTML={themeBootScript()} />` above the
 * stylesheet, or paste the string into a static HTML shell.
 */
export const themeBootScript = (storageKey: string = THEME_KEY): string =>
	`(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)});if(m==="light"||m==="dark"){document.documentElement.style.colorScheme=m}}catch(e){}})()`

/** Shared Auto → Light → Dark control for ui-solid's light-dark() theme.
 *  The server renders Auto; persisted client preference is restored after
 *  settlement so the control remains hydration-safe in document shells. */
export function ThemeToggle(
	props: {
		class?: ClassProp
		storageKey?: string
		/** Composed-IconButton styling, drilled straight through. */
		size?: 'sm' | 'md' | 'lg' | UiLength
		radius?: UiLengthPercentage
		ring?: UiColor
		hoverSurface?: UiColor
		hoverInk?: UiColor
	} & ColorTreatmentProps,
) {
	const [mode, setMode] = createSignal<ThemeMode>('auto')

	onSettled(() => {
		const stored = localStorage.getItem(props.storageKey ?? THEME_KEY)
		const initial: ThemeMode = stored === 'light' || stored === 'dark' ? stored : 'auto'
		setMode(initial)
		applyTheme(initial)
	})

	const cycle = (): void => {
		const next: ThemeMode = mode() === 'auto' ? 'light' : mode() === 'light' ? 'dark' : 'auto'
		setMode(next)
		applyTheme(next)
		try {
			localStorage.setItem(props.storageKey ?? THEME_KEY, next)
		} catch {
			/* Persistence is best-effort; the current document still updates. */
		}
	}

	return (
		<IconButton
			class={props.class}
			label={`Theme: ${THEME_NAME[mode()]}`}
			title={`${THEME_NAME[mode()]} theme; activate to change`}
			onClick={cycle}
			colorBase={props.colorBase}
			colorLevel={props.colorLevel}
			variant={props.variant}
			size={props.size}
			radius={props.radius}
			ring={props.ring}
			hoverSurface={props.hoverSurface}
			hoverInk={props.hoverInk}
		>
			<span aria-hidden="true">{THEME_ICON[mode()]}</span>
		</IconButton>
	)
}
