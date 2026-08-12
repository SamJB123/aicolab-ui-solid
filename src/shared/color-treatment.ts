export type ClassProp = string | Record<string, boolean>

export type ColorBase =
	| 'primary' | 'secondary' | 'accent' | 'neutral'
	| 'info' | 'success' | 'warning' | 'error'
export type ColorLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
export type Variant = 'solid' | 'soft' | 'outline' | 'ghost' | 'text'
export type ColorTreatmentProps = {
	colorBase?: ColorBase
	colorLevel?: ColorLevel
	variant?: Variant
}

export const colorTreatmentData = (props: ColorTreatmentProps) => ({
	'data-ui-color-base': props.colorBase,
	'data-ui-color-level': props.colorBase ? (props.colorLevel ?? 500) : undefined,
	'data-ui-color-variant': props.colorBase ? (props.variant ?? 'solid') : undefined,
})
