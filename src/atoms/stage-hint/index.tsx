/** @jsxImportSource @solidjs/web */
import type { ParentProps } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

/** Concise, non-interactive guidance over an active visual or spatial stage. */
export function StageHint(props: ParentProps<{ dismissed?: boolean; class?: ClassProp }>) {
	return (
		<div
			class={['ui-stage-hint', props.class]}
			data-dismissed={props.dismissed ? 'true' : undefined}
			aria-hidden="true"
		>
			{props.children}
		</div>
	)
}
