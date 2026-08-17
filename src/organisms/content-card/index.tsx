/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { children, Show } from 'solid-js'
import {
	type ClassProp,
	type ColorTreatmentProps,
	colorTreatmentData,
} from '../../shared/color-treatment'
import { defineKnobs, type KnobProps, mergeKnobStyle } from '../../shared/knobs'

/**
 * ContentCard — one item on a ShelfBoard: a doc (live text preview), a file
 * (thumbnail or type glyph), or anything card-shaped.
 *
 * Anatomy (all slots single-eval via children()):
 *   media    — thumbnail / glyph area (fixed-height band above the body)
 *   title    — required
 *   preview  — excerpt text (docs' live first lines)
 *   meta     — byline / size / freshness row
 *   presence — who's here right now (avatar dots ride the card, per the
 *              settled "presence on cards only" decision)
 *   actions  — hover/focus action cluster (menu), top-right
 *
 * The OPEN action is a stretched, visually-empty button UNDER the content
 * (content is pointer-transparent except interactive clusters), so nested
 * menus stay clickable while the whole card reads as one action. Supplying
 * `onOpen` is what renders it.
 *
 * Colour: with a colour treatment the resolver's role vars paint the card;
 * without one it defaults to the hive-native look — a restrained accent
 * tint mixed into the base surface, so per-context `--color-accent` (e.g. a
 * hive's chosen accent) tints every card by inheritance.
 */
const knobs = defineKnobs('ui-cc', {
	radius: '<length-percentage>',
	pad: '<length>',
	gap: '<length>',
	mediaHeight: '<length>',
	titleSize: '<length>',
	previewSize: '<length>',
})

export function ContentCard(
	props: {
		title: JSX.Element
		media?: JSX.Element
		preview?: JSX.Element
		meta?: JSX.Element
		presence?: JSX.Element
		actions?: JSX.Element
		/** Semantic kind hook (`data-kind`) for host styling; not a mode. */
		kind?: 'doc' | 'file'
		/** Shared-curation pin — renders the ribbon + styling hook. */
		pinned?: boolean
		muted?: boolean
		selected?: boolean
		/** Accessible name for the open action (defaults to the title text —
		 *  pass one whenever the title alone is ambiguous). */
		label?: string
		onOpen?: () => void
		/** Curated drag-arrange pass-throughs (the host owns DnD semantics). */
		draggable?: boolean
		onDragStart?: (event: DragEvent) => void
		onDragOver?: (event: DragEvent) => void
		onDragEnd?: (event: DragEvent) => void
		onDrop?: (event: DragEvent) => void
		class?: ClassProp
		style?: JSX.CSSProperties | string
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	const media = children(() => props.media)
	const preview = children(() => props.preview)
	const meta = children(() => props.meta)
	const presence = children(() => props.presence)
	const actions = children(() => props.actions)
	return (
		<article
			class={['ui-content-card', props.class]}
			data-kind={props.kind}
			data-pinned={props.pinned ? '' : undefined}
			data-muted={props.muted ? '' : undefined}
			data-selected={props.selected ? '' : undefined}
			draggable={props.draggable ? 'true' : undefined}
			onDragStart={props.onDragStart}
			onDragOver={props.onDragOver}
			onDragEnd={props.onDragEnd}
			onDrop={props.onDrop}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<Show when={props.onOpen}>
				<button
					type="button"
					class="ui-content-card-open"
					aria-label={props.label}
					onClick={() => props.onOpen?.()}
				/>
			</Show>
			<Show when={media()}>
				<div class="ui-content-card-media">{media()}</div>
			</Show>
			<div class="ui-content-card-body">
				<h3 class="ui-content-card-title">{props.title}</h3>
				<Show when={preview()}>
					<p class="ui-content-card-preview">{preview()}</p>
				</Show>
				<Show when={meta()}>
					<div class="ui-content-card-meta">{meta()}</div>
				</Show>
			</div>
			<Show when={presence()}>
				<div class="ui-content-card-presence">{presence()}</div>
			</Show>
			<Show when={actions()}>
				<div class="ui-content-card-actions">{actions()}</div>
			</Show>
			<Show when={props.pinned}>
				<span class="ui-content-card-ribbon" aria-hidden="true" />
			</Show>
		</article>
	)
}
