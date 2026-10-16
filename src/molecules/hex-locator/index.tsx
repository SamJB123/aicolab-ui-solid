/** @jsxImportSource @solidjs/web */
import { For, Show } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export interface HexLocatorCell {
	id: string
	label: string
}

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-hexloc', {
	size: '<length>',
})

/* The seven cells of a level on a flat-topped lattice, in units of one cell's
   height: the centre, then its six neighbours from the north clockwise. A
   cell's centre is ((√3/2)·q, q/2 + r); its corners lie at R = 1/√3 from
   it. The drawing is inset by a hair so the plates stand apart. */
const SQRT3 = Math.sqrt(3)
const RING: readonly (readonly [number, number])[] = [
	[0, -1],
	[1, -1],
	[1, 0],
	[0, 1],
	[-1, 1],
	[-1, 0],
]
const UNIT = 40
const RADIUS = UNIT / SQRT3
const INSET = 1.5
const centre = (q: number, r: number): [number, number] => [
	(SQRT3 / 2) * q * UNIT,
	(q / 2 + r) * UNIT,
]
const corners = (cx: number, cy: number): string =>
	Array.from({ length: 6 }, (_, k) => {
		const a = (Math.PI / 3) * k
		const radius = RADIUS - INSET / (SQRT3 / 2)
		return `${(cx + radius * Math.cos(a)).toFixed(2)},${(cy + radius * Math.sin(a)).toFixed(2)}`
	}).join(' ')
/* The drawing's extent: the ring's cells reach 1.5 units out sideways and
   two cells' heights down; a margin of one radius round them. */
const HALF_WIDTH = (SQRT3 / 2) * UNIT + RADIUS + 2
const HALF_HEIGHT = 1.5 * UNIT + 2
const VIEW_BOX = `${-HALF_WIDTH} ${-HALF_HEIGHT} ${2 * HALF_WIDTH} ${2 * HALF_HEIGHT}`

/**
 * The seven-cell locator: the level the reader is at, small — the place
 * itself in the middle and the places it leads to around it, each a
 * button. A you-are-here map in miniature, drawn on the same lattice as the
 * map it stands for, so the six directions match.
 */
export function HexLocator(
	props: {
		/** The drawing's accessible name ("Where you are"). */
		label: string
		/** The place in the middle. */
		centre: HexLocatorCell
		/** The places around it, from the north clockwise; at most six. */
		ring: readonly HexLocatorCell[]
		onPick: (id: string) => void
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	const cell = (item: HexLocatorCell, q: number, r: number, here: boolean) => {
		const [cx, cy] = centre(q, r)
		return (
			// biome-ignore lint/a11y/useSemanticElements: a cell of an SVG drawing; SVG has no button element
			<g
				class="ui-hex-locator-cell"
				data-here={here ? '' : undefined}
				role="button"
				tabindex={0}
				aria-label={item.label}
				onClick={() => props.onPick(item.id)}
				onKeyDown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault()
						props.onPick(item.id)
					}
				}}
			>
				<polygon points={corners(cx, cy)} />
				{/* The name in HTML, so it wraps and ellipsizes as text does. */}
				<foreignObject
					x={cx - RADIUS}
					y={cy - UNIT / 2}
					width={2 * RADIUS}
					height={UNIT}
				>
					<span class="ui-hex-locator-name">{item.label}</span>
				</foreignObject>
			</g>
		)
	}
	return (
		<svg
			class={['ui-hex-locator', props.class]}
			viewBox={VIEW_BOX}
			role="group"
			aria-label={props.label}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<For each={props.ring.slice(0, RING.length)}>
				{(item, index) => {
					const at = () => RING[index()] ?? RING[0]
					return (
						<Show when={at()}>{(point) => cell(item, point()[0], point()[1], false)}</Show>
					)
				}}
			</For>
			{cell(props.centre, 0, 0, true)}
		</svg>
	)
}
