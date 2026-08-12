/** @jsxImportSource @solidjs/web */
import { Show } from 'solid-js'
import { Eyebrow } from '../eyebrow'
import { colorTreatmentData, type ColorTreatmentProps } from '../../shared/color-treatment'

export function Rule(props: { label?: string } & ColorTreatmentProps) {
	return (
		<div {...colorTreatmentData(props)} class="ui-rule">
			<span class="ui-rule-line" />
			<Show when={props.label}>
				<Eyebrow>{props.label}</Eyebrow>
				<span class="ui-rule-line" />
			</Show>
		</div>
	)
}
