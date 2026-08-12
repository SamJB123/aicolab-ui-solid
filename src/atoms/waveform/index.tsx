/** @jsxImportSource @solidjs/web */
import { For } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'

export function Waveform(props: { bars: number[]; barColor?: string; class?: ClassProp } & ColorTreatmentProps) {
	const color = () => props.colorBase ? 'var(--ui-color-foreground)' : (props.barColor ?? 'var(--color-primary)')
	return (
		<div {...colorTreatmentData(props)} class={['ui-waveform', props.class]}>
			<For each={props.bars}>
				{(v) => (
					<div
						class="ui-waveform-bar"
						style={{
							height: `${Math.max(8, v * 100)}%`,
							background: color(),
							opacity: String(0.32 + v * 0.6),
						}}
					/>
				)}
			</For>
		</div>
	)
}
