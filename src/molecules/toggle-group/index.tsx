/** @jsxImportSource @solidjs/web */
import { For } from 'solid-js'
import { Button } from '../../atoms/button'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export type ToggleOption<T extends string> = { id: T; label: string; disabled?: boolean }

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-tg', {
	traySurface: '<color>',
	trayBorder: '<color>',
	trayRadius: '<length-percentage>',
	trayPad: '<length>',
	gap: '<length>',
})

/** An exclusive set of command modes. Unlike Segmented, these are pressed
 * buttons rather than tabs controlling document panels. The treatment axes
 * drill into the composed Buttons (variant defaults to the classic soft
 * look) and re-pair the tray surface. */
export function ToggleGroup<T extends string>(
	props: {
		label: string
		options: readonly ToggleOption<T>[]
		value: T
		onChange: (value: T) => void
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<div
			class={['ui-toggle-group', props.class]}
			role="group"
			aria-label={props.label}
			{...colorTreatmentData({
				colorBase: props.colorBase,
				colorLevel: props.colorLevel,
				/* The tray shares the buttons' soft default — a solid tray behind
				   soft buttons would read as a filled bar, not a tray. */
				variant: props.variant ?? 'soft',
			})}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<For each={props.options}>
				{(option) => (
					<Button
						colorBase={props.colorBase}
						colorLevel={props.colorLevel}
						variant={props.variant ?? 'soft'}
						pressed={props.value === option.id}
						disabled={option.disabled}
						onClick={() => props.onChange(option.id)}
					>
						{option.label}
					</Button>
				)}
			</For>
		</div>
	)
}
