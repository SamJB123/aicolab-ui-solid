/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import type { ClassProp } from '../../shared/color-treatment'
import { defineKnobs, type KnobProps, mergeKnobStyle } from '../../shared/knobs'

/**
 * ShelfBoard — the masonry pinboard container (the hives Board's shelf).
 *
 * Layout is native CSS masonry where the engine has it (`display: grid-lanes`
 * / `grid-template-rows: masonry`, Tier 4→3) over a plain auto-fill grid
 * baseline — cards simply top-align in rows where masonry is absent. The
 * board owns ONLY packing; cards are the children (ContentCard /
 * PortalFolderCard or anything else grid-friendly).
 *
 * Curated-order note: the DOM order IS the board order — hosts sort their
 * items (pinned first, then position, unplaced-first-by-recency) before
 * rendering, and drag-arrange recomputes positions via
 * `positionBetween` (shared/ordering).
 */
const knobs = defineKnobs('ui-shelf', {
	gap: '<length>',
	minCell: '<length>',
})

export function ShelfBoard(
	props: {
		/** Accessible name for the board region. */
		label?: string
		class?: ClassProp
		style?: JSX.CSSProperties | string
		children?: JSX.Element
	} & KnobProps<typeof knobs.spec>,
) {
	return (
		<div
			class={['ui-shelf-board', props.class]}
			role="list"
			aria-label={props.label}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			{props.children}
		</div>
	)
}
