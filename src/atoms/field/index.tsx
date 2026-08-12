/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { type ParentProps } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
export function Field(props: ParentProps<{ label: string; class?: ClassProp }>) {
	const child = (): JSX.Element => props.children
	return (
		<div class={['ui-field', props.class]}>
			<span class="ui-field-label">{props.label}</span>
			{child()}
		</div>
	)
}
