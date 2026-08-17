/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-empty', {
	pad: '<length>',
	gap: '<length>',
	glyphSize: '<length>',
	glyphInk: '<color>',
})

type EmptyStateProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'title'> & {
	class?: ClassProp
	/** Decorative glyph slot (emoji/SVG) — lazy, like every ui-solid slot. */
	glyph?: () => JSX.Element
	title: JSX.Element
	/** Supporting line under the title. */
	hint?: JSX.Element
	/** Call-to-action slot (typically a Button). Lazy. */
	action?: () => JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * The nothing-here voice: glyph, title, hint, and an optional action — one
 * consistent shape for empty lists, empty folders, and first-run states.
 */
export function EmptyState(props: EmptyStateProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'glyph',
		'title',
		'hint',
		'action',
		'colorBase',
		'colorLevel',
		'variant',
		'pad',
		'gap',
		'glyphSize',
		'glyphInk',
	)
	// Root-consumed knobs (pad, gap) ride the root; the glyph's knobs land on
	// the glyph span it styles (the Meter fill-element pattern).
	const rootValues = () => ({ pad: props.pad, gap: props.gap })
	const glyphValues = () => ({ glyphSize: props.glyphSize, glyphInk: props.glyphInk })
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(rootValues())}
			class={['ui-empty-state', props.class]}
			style={mergeKnobStyle(knobs.style(rootValues()), props.style)}
		>
			<Show when={props.glyph}>
				{(glyph) => (
					<span
						class="ui-empty-state-glyph"
						aria-hidden="true"
						{...knobs.attributes(glyphValues())}
						style={mergeKnobStyle(knobs.style(glyphValues()), false)}
					>
						{glyph()()}
					</span>
				)}
			</Show>
			<p class="ui-empty-state-title">{props.title}</p>
			<Show when={props.hint}>
				<p class="ui-empty-state-hint">{props.hint}</p>
			</Show>
			{props.children}
			<Show when={props.action}>
				{(action) => <div class="ui-empty-state-action">{action()()}</div>}
			</Show>
		</div>
	)
}
