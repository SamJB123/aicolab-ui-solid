/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). size is the mark's
 * height; ink is what its content is drawn in. Everything else is the
 * theme's: the plate's three rings (resolver.css "Surface paint and edge",
 * their inks public as --ui-edge-*-ink) and its surface paint, which the
 * mark draws as nested hexagons because a box-shadow cannot follow a
 * hexagon's outline. */
const knobs = defineKnobs('ui-hexmark', {
	size: '<length>',
	ink: '<color>',
})

type HexMarkProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	/** `flat` — a flat top and bottom, the orientation of the hex field's
	 *  cells and the default; `pointy` — the CoLab mark's. */
	orientation?: 'flat' | 'pointy'
	/** What sits on the face: a line icon as SVG, or any content a cell
	 *  carries (an icon over a name). */
	children?: JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * A hexagonal plate: the theme's rings around the theme's surface, in the
 * orientation of the lattice it stands for, with its content on the face.
 * Decorative on its own — it carries no name — so it sits inside a labelled
 * button or link, or beside the words. A treated mark takes its family's
 * surface and rim as every plate does.
 */
export function HexMark(props: HexMarkProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'orientation',
		'colorBase',
		'colorLevel',
		'variant',
		'size',
		'ink',
	)
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			data-ui-plate=""
			data-orientation={props.orientation ?? 'flat'}
			class={['ui-hex-mark', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
		>
			<span class="ui-hex-mark-ring ui-hex-mark-outer">
				<span class="ui-hex-mark-ring ui-hex-mark-gap">
					<span class="ui-hex-mark-ring ui-hex-mark-inner">
						<span class="ui-hex-mark-face">{props.children}</span>
					</span>
				</span>
			</span>
		</span>
	)
}
