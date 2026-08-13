/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { Show } from 'solid-js'
import { Eyebrow } from '../../atoms/eyebrow'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-section', {
	maxWidth: '<length>',
	padBlock: '<length>',
	headGap: '<length>',
	headMargin: '<length>',
	titleSize: '<length>',
	titleInk: '<color>',
	ledeSize: '<length>',
	ledeInk: '<color>',
})

export function Section(
	props: {
		id?: string
		eyebrow?: string
		title?: JSX.Element
		lede?: JSX.Element
		wide?: boolean
		center?: boolean
		class?: ClassProp
		children?: JSX.Element
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<section
			id={props.id}
			class={['ui-section', props.class]}
			data-wide={props.wide ? '' : undefined}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<Show when={props.eyebrow || props.title || props.lede}>
				<header class="ui-section-head" data-center={props.center ? '' : undefined}>
					<Show when={props.eyebrow}>
						{/* The eyebrow follows the section's family, primary default. */}
						<Eyebrow
							colorBase={props.colorBase ?? 'primary'}
							colorLevel={props.colorLevel}
							variant={props.variant}
						>
							{props.eyebrow}
						</Eyebrow>
					</Show>
					<Show when={props.title}>
						<h2>{props.title}</h2>
					</Show>
					<Show when={props.lede}>
						<p class="ui-section-lede">{props.lede}</p>
					</Show>
				</header>
			</Show>
			{props.children}
		</section>
	)
}
