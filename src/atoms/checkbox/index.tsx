/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createEffect, omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). `size` is the box;
 * the check glyph and label scale from it. */
const knobs = defineKnobs('ui-checkbox', {
	size: '<length>',
	radius: '<length-percentage>',
	accent: '<color>',
	checkInk: '<color>',
	focusRing: '<color>',
})

type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'class' | 'type' | 'size'> & {
	class?: ClassProp
	/** Visible label text; omit it (and supply aria-label) for a bare box. */
	children?: JSX.Element
	/** Mixed state (select-all). Set imperatively — it is not a content attr. */
	indeterminate?: boolean
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * A native checkbox with a painted box: the `<input>` stays the real control
 * (keyboard, forms, a11y); the visual is a sibling driven entirely by its
 * `:checked`/`:indeterminate`/`:disabled` states.
 */
export function Checkbox(props: CheckboxProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'indeterminate',
		'colorBase',
		'colorLevel',
		'variant',
		'size',
		'radius',
		'accent',
		'checkInk',
		'focusRing',
	)
	let input: HTMLInputElement | undefined
	createEffect(
		() => props.indeterminate ?? false,
		(mixed) => {
			if (input) input.indeterminate = mixed
		},
	)
	// Knob wires land on the CONSUMING elements (the Meter fill-element
	// pattern): `size` on the input, everything on the box (whose ::after
	// resolves attr() against it), so BOTH wires apply everywhere.
	const sizeOnly = () => ({ size: props.size })
	return (
		<label {...colorTreatmentData(props)} class={['ui-checkbox', props.class]} style={props.style}>
			<input
				{...attributes}
				ref={input}
				type="checkbox"
				class="ui-checkbox-input"
				{...knobs.attributes(sizeOnly())}
				style={mergeKnobStyle(knobs.style(sizeOnly()), false)}
			/>
			<span
				class="ui-checkbox-box"
				aria-hidden="true"
				{...knobs.attributes(props)}
				style={mergeKnobStyle(knobs.style(props), false)}
			/>
			<Show when={props.children}>
				<span class="ui-checkbox-label">{props.children}</span>
			</Show>
		</label>
	)
}
