/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { For, Show } from 'solid-js'
import { Eyebrow } from '../../atoms/eyebrow'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-hero', {
	maxWidth: '<length>',
	gap: '<length>',
	titleSize: '<length>',
	titleInk: '<color>',
	ledeSize: '<length>',
	ledeInk: '<color>',
})

/** A lede given as a list of paragraphs, or nothing for a single element —
 * the branch is decided by the value's shape, so neither side is asserted. */
const paragraphs = (lede: JSX.Element | readonly string[]): readonly string[] | undefined => {
	if (!Array.isArray(lede)) return undefined
	const list: string[] = []
	for (const item of lede) {
		if (typeof item !== 'string') return undefined
		list.push(item)
	}
	return list
}

/** The hero is a band the width of its container, its words in a column of
 * at most the max-width knob. A `backdrop` fills the band behind the words:
 * a picture, a canvas, a field — clipped to the band, out of the pointer's
 * way, under the column. */
export function PageHero(
	props: {
		eyebrow?: string
		title: JSX.Element
		lede?: JSX.Element | readonly string[]
		/** Render function (lazy slot) — hydration-safe, see Panel.action. */
		actions?: () => JSX.Element
		/** Render function (lazy slot): a full-bleed layer behind the words. */
		backdrop?: () => JSX.Element
		align?: 'center' | 'start'
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	return (
		<div
			class={['ui-hero', props.class]}
			data-align={props.align ?? 'center'}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<Show when={props.backdrop}>
				<div class="ui-hero-backdrop" aria-hidden="true">
					{props.backdrop?.()}
				</div>
			</Show>
			<div class="ui-hero-body">
				<Show when={props.eyebrow}>
					{/* The eyebrow follows the hero's family, primary by default. */}
					<Eyebrow
						colorBase={props.colorBase ?? 'primary'}
						colorLevel={props.colorLevel}
						variant={props.variant}
					>
						{props.eyebrow}
					</Eyebrow>
				</Show>
				<h1>{props.title}</h1>
				<Show when={props.lede}>
					{(lede) => (
						<Show
							when={paragraphs(lede())}
							fallback={<p class="ui-hero-lede">{lede()}</p>}
						>
							{(list) => (
								<For each={list()}>{(paragraph) => <p class="ui-hero-lede">{paragraph}</p>}</For>
							)}
						</Show>
					)}
				</Show>
				<Show when={props.actions}>
					<div class="ui-hero-actions">{props.actions?.()}</div>
				</Show>
			</div>
		</div>
	)
}
