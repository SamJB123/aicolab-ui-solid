/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Button } from '../../atoms/button'
import type { ColorTreatmentProps } from '../../shared/color-treatment'

/** Shared date/time picker trigger — a composed Button. Untreated pickers
 * keep the classic neutral base-300 look via the -plain tuning class; a
 * treated picker hands its family straight to the Button. */
export function PickerTrigger(
	props: {
		popoverTarget: string
		anchorName: string
		icon: string
		value: JSX.Element
	} & ColorTreatmentProps,
) {
	return (
		<Button
			class={`ui-picker-trigger${props.colorBase ? '' : ' ui-picker-trigger-plain'}`}
			popoverTarget={props.popoverTarget}
			style={{ 'anchor-name': props.anchorName }}
			colorBase={props.colorBase ?? 'neutral'}
			colorLevel={props.colorLevel}
			variant={props.variant ?? 'ghost'}
			radius="var(--r-md)"
			padBlock="10px"
			padInline="14px"
			fontSize="var(--t-md)"
		>
			<span aria-hidden="true" class="ui-picker-trigger-icon">
				{props.icon}
			</span>
			<span class="ui-picker-trigger-value">{props.value}</span>
		</Button>
	)
}
