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
 * PortalFolderCard — a folder ON the shelf, styled as a comb cell you travel
 * into: layered "stacked cells" behind the face sell the depth, a subtle
 * comb texture carries the hive identity, and opening one is meant to run a
 * portal view transition into the folder's own board (the HOST assigns
 * `view-transition-name` via `style` and drives the navigation — this card
 * is the doorway, not the journey).
 *
 * The whole card is ONE button (`onOpen`); it doubles as a drop target for
 * drag-arrange (`dropTarget` lights the mouth of the portal while an item
 * hovers over it).
 */
const knobs = defineKnobs('ui-pfc', {
	radius: '<length-percentage>',
	pad: '<length>',
	minHeight: '<length>',
	nameSize: '<length>',
})

export function PortalFolderCard(
	props: {
		name: JSX.Element
		/** Count / freshness line ("12 items · active today"). */
		meta?: JSX.Element
		pinned?: boolean
		/** Accessible name (defaults to the rendered name text). */
		label?: string
		onOpen: () => void
		/** True while a dragged item hovers this folder (host-driven). */
		dropTarget?: boolean
		draggable?: boolean
		onDragStart?: (event: DragEvent) => void
		onDragOver?: (event: DragEvent) => void
		onDragLeave?: (event: DragEvent) => void
		onDragEnd?: (event: DragEvent) => void
		onDrop?: (event: DragEvent) => void
		class?: ClassProp
		style?: JSX.CSSProperties | string
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	const meta = children(() => props.meta)
	return (
		<button
			type="button"
			class={['ui-portal-folder', props.class]}
			aria-label={props.label}
			data-pinned={props.pinned ? '' : undefined}
			data-drop-over={props.dropTarget ? '' : undefined}
			draggable={props.draggable ? 'true' : undefined}
			onClick={() => props.onOpen()}
			onDragStart={props.onDragStart}
			onDragOver={props.onDragOver}
			onDragLeave={props.onDragLeave}
			onDragEnd={props.onDragEnd}
			onDrop={props.onDrop}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<span class="ui-portal-folder-face">
				<span class="ui-portal-folder-glyph" aria-hidden="true">
					⬡
				</span>
				<span class="ui-portal-folder-name">{props.name}</span>
				<Show when={meta()}>
					<span class="ui-portal-folder-meta">{meta()}</span>
				</Show>
			</span>
			<Show when={props.pinned}>
				<span class="ui-portal-folder-ribbon" aria-hidden="true" />
			</Show>
		</button>
	)
}
