/** @jsxImportSource @solidjs/web */
import { createSignal, onSettled } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import type { ClassProp } from '../../shared/color-treatment'

export type ThemeMode = 'auto' | 'light' | 'dark'

const THEME_KEY = 'ui-solid:theme'
const THEME_ICON: Record<ThemeMode, string> = { auto: '◐', light: '☀', dark: '●' }
const THEME_NAME: Record<ThemeMode, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' }

const applyTheme = (mode: ThemeMode): void => {
	document.documentElement.style.colorScheme = mode === 'auto' ? '' : mode
}

/** Shared Auto → Light → Dark control for ui-solid's light-dark() theme.
 *  The server renders Auto; persisted client preference is restored after
 *  settlement so the control remains hydration-safe in document shells. */
export function ThemeToggle(props: { class?: ClassProp; storageKey?: string }) {
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
		>
			<span aria-hidden="true">{THEME_ICON[mode()]}</span>
		</IconButton>
	)
}
