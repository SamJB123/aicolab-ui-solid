/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiLength } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). `pad` is special:
 * --ui-panel-pad is a pre-existing REGISTERED, INHERITED density token (an
 * ancestor's data-density tightens every panel beneath it), so the prop
 * emits the inline variable only — a stylesheet-side read would clobber
 * that inheritance. */
const knobs = defineKnobs('ui-panel', {
	radius: '<length-percentage>',
	surface: '<color>',
	topSeam: '<color>',
	glowInk: '<color>',
})

type PanelProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'class'> & {
	class?: ClassProp
	index?: string
	title: string
	kicker?: string
	// A render function (lazy slot), not a pre-created element: created in
	// Panel's own scope so its hydration keys align (a pre-created element
	// from the caller's scope leaves an unclaimed node on hydration).
	action?: () => JSX.Element
	glow?: boolean
	/** Instance padding; outranks ancestor density (see contract note). */
	pad?: UiLength
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Panel(props: PanelProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'index',
		'title',
		'kicker',
		'action',
		'glow',
		'pad',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'surface',
		'topSeam',
		'glowInk',
	)
	return (
		// `group` is kept as a marker class for consumers' group-hover styling.
		<section
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-panel group', props.class]}
			style={mergeKnobStyle(
				{
					...knobs.style(props),
					...(props.pad === undefined ? undefined : { '--ui-panel-pad': props.pad }),
				},
				props.style,
			)}
		>
			<Show when={props.glow}>
				<span class="ui-panel-glow" />
			</Show>
			<header>
				<div class="ui-panel-head-left">
					<Show when={props.index}>
						<span class="ui-panel-index">{props.index}</span>
					</Show>
					<div>
						<h2>{props.title}</h2>
						<Show when={props.kicker}>
							<p class="ui-panel-kicker">{props.kicker}</p>
						</Show>
					</div>
				</div>
				{props.action?.()}
			</header>
			{props.children}
		</section>
	)
}
