export type ClassProp = string | Record<string, boolean>

export type ColorBase =
	| 'primary' | 'secondary' | 'accent' | 'neutral'
	| 'info' | 'success' | 'warning' | 'error'
export type ColorLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
export type Appearance = 'solid' | 'soft' | 'outline' | 'ghost' | 'text'
export type ColorTreatmentProps = {
	colorBase?: ColorBase
	colorLevel?: ColorLevel
	appearance?: Appearance
}

export const colorTreatmentData = (props: ColorTreatmentProps) => ({
	'data-ui-color-base': props.colorBase,
	'data-ui-color-level': props.colorBase ? (props.colorLevel ?? 500) : undefined,
	'data-ui-appearance': props.colorBase ? (props.appearance ?? 'solid') : undefined,
})
