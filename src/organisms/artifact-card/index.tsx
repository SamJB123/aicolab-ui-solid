/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import {
	type ClassProp,
	type ColorTreatmentProps,
	colorTreatmentData,
} from '../../shared/color-treatment'
import { defineKnobs, type KnobProps, mergeKnobStyle } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-artifact', {
	pad: '<length>',
	gap: '<length>',
	radius: '<length>',
	previewSize: '<length>',
})

type ArtifactCardProps = Omit<JSX.HTMLAttributes<HTMLElement>, 'class' | 'title'> & {
	class?: ClassProp
	/** Kind line above the title (e.g. "Document", "PDF · 2.1 MB"). */
	eyebrow?: JSX.Element
	title: JSX.Element
	/** Body slot — live doc preview, description, thumbnail. Lazy. */
	preview?: () => JSX.Element
	/** Byline/footer slot (author · time). Lazy. */
	meta?: () => JSX.Element
	/** Presence slot (AvatarStack of people on this artifact). Lazy. */
	presence?: () => JSX.Element
	/** Action cluster (Menu, pin toggle). Lazy; sits ABOVE the hit area. */
	actions?: () => JSX.Element
	/** Curated pin — renders the corner ribbon. */
	pinned?: boolean
	/** Someone is on this artifact right now — the live beacon treatment. */
	live?: boolean
	/** Navigation target: renders the hit surface as a real link. */
	href?: string
	/** Activation without navigation (ignored when `href` is set). */
	onSelect?: () => void
	/** Accessible name for the hit surface when `title` is not plain text. */
	label?: string
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * One artifact — file or document — as a card: the shelf's (and, later, the
 * village island's) unit of content. ONE tab stop per card (a stretched hit
 * surface behind the content) plus the action cluster layered above it;
 * pinned ribbon and live beacon are data-attribute treatments so app CSS can
 * extend them without new props.
 */
export function ArtifactCard(props: ArtifactCardProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'eyebrow',
		'title',
		'preview',
		'meta',
		'presence',
		'actions',
		'pinned',
		'live',
		'href',
		'onSelect',
		'label',
		'colorBase',
		'colorLevel',
		'variant',
		'pad',
		'gap',
		'radius',
		'previewSize',
	)
	const rootValues = () => ({ pad: props.pad, gap: props.gap, radius: props.radius })
	const previewValues = () => ({ previewSize: props.previewSize })
	return (
		<article
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(rootValues())}
			class={['ui-artifact-card', props.class]}
			style={mergeKnobStyle(knobs.style(rootValues()), props.style)}
			data-pinned={props.pinned ? '' : undefined}
			data-live={props.live ? '' : undefined}
		>
			<Show when={props.pinned}>
				<span class="ui-artifact-card-ribbon" aria-hidden="true" />
			</Show>
			<Show
				when={props.href !== undefined}
				fallback={
					<Show when={props.onSelect}>
						{(onSelect) => (
							<button
								type="button"
								class="ui-artifact-card-hit"
								aria-label={props.label}
								onClick={() => onSelect()()}
							/>
						)}
					</Show>
				}
			>
				<a class="ui-artifact-card-hit" href={props.href} aria-label={props.label} />
			</Show>
			<div class="ui-artifact-card-head">
				<Show when={props.eyebrow}>
					<span class="ui-artifact-card-eyebrow">{props.eyebrow}</span>
				</Show>
				<Show when={props.presence}>
					{(presence) => <span class="ui-artifact-card-presence">{presence()()}</span>}
				</Show>
			</div>
			<h3 class="ui-artifact-card-title">{props.title}</h3>
			<Show when={props.preview}>
				{(preview) => (
					<div
						class="ui-artifact-card-preview"
						{...knobs.attributes(previewValues())}
						style={mergeKnobStyle(knobs.style(previewValues()), false)}
					>
						{preview()()}
					</div>
				)}
			</Show>
			{props.children}
			<div class="ui-artifact-card-foot">
				<Show when={props.meta}>{(meta) => <span class="ui-artifact-card-meta">{meta()()}</span>}</Show>
				<Show when={props.actions}>
					{(actions) => <span class="ui-artifact-card-actions">{actions()()}</span>}
				</Show>
			</div>
		</article>
	)
}
