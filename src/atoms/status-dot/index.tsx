/** @jsxImportSource @solidjs/web */
import { Show } from 'solid-js'
import { colorTreatmentData, type ColorTreatmentProps } from '../../shared/color-treatment'

/** Colour + liveness for a status indicator. Apps map their own status
 *  vocabulary (online/away/flow/…) onto this shape. */
export type StatusVisual = { color: string; live?: boolean }

export function StatusDot(props: { status: StatusVisual; size?: number } & ColorTreatmentProps) {
	const size = () => props.size ?? 8
	const color = () => props.colorBase ? 'var(--ui-mark)' : props.status.color
	return (
		<span {...colorTreatmentData(props)} class="ui-dot" style={{ width: `${size()}px`, height: `${size()}px` }}>
			<Show when={props.status.live}>
				<span class="ui-dot-ping" style={{ background: color() }} />
			</Show>
			<span
				class="ui-dot-core"
				style={{ width: `${size()}px`, height: `${size()}px`, background: color() }}
			/>
		</span>
	)
}
