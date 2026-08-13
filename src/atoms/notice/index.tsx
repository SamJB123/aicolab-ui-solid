/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-notice', {
	radius: '<length-percentage>',
	padBlock: '<length>',
	padInline: '<length>',
	fontSize: '<length>',
})

type NoticeProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
	selected?: boolean
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Notice(props: NoticeProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'role',
		'selected',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'padBlock',
		'padInline',
		'fontSize',
	)
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			role={props.role ?? 'status'}
			data-selected={props.selected ? '' : undefined}
			class={['ui-notice', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</div>
	)
}
