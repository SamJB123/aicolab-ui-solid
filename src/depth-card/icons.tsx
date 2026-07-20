/** @jsxImportSource @solidjs/web */
// The card icon set — the ten tabler outline glyphs the legacy card pages
// used, inline-ported (MIT, tabler.io/icons) so ui-solid takes no icon
// dependency. Stroke inherits currentColor; size via the `size` prop or CSS.
//
// Legacy sources: innovation-ecosystem + join/participate cards (flame /
// tools / door-enter / compass) and charter strategy.json (building-community
// / users-group / heart-handshake / bulb / chart-arrows / arrows-join).

import type { JSX } from '@solidjs/web'
import { For } from 'solid-js'

export type CardIconName =
	| 'flame'
	| 'tools'
	| 'door-enter'
	| 'compass'
	| 'building-community'
	| 'users-group'
	| 'heart-handshake'
	| 'bulb'
	| 'chart-arrows'
	| 'arrows-join'

const PATHS: Record<CardIconName, string[]> = {
	flame: [
		'M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.294 -2.333 5.588c0 3.704 3.134 6.706 7 6.706c3.866 0 7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235',
	],
	tools: [
		'M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4',
		'M14.5 5.5l4 4',
		'M12 8l-5 -5l-4 4l5 5',
		'M7 8l-1.5 1.5',
		'M16 12l5 5l-4 4l-5 -5',
		'M16 17l-1.5 1.5',
	],
	'door-enter': [
		'M13 12v.01',
		'M3 21h18',
		'M5 21v-16a2 2 0 0 1 2 -2h6m4 10.5v7.5',
		'M21 7h-7m3 -3l-3 3l3 3',
	],
	compass: [
		'M8 16l2 -6l6 -2l-2 6l-6 2',
		'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
		'M12 3l0 2',
		'M12 19l0 2',
		'M3 12l2 0',
		'M19 12l2 0',
	],
	'building-community': [
		'M8 9l5 5v7h-5v-4m0 4h-5v-7l5 -5m1 1v-6a1 1 0 0 1 1 -1h10a1 1 0 0 1 1 1v17h-8',
		'M13 7l0 .01',
		'M17 7l0 .01',
		'M17 11l0 .01',
		'M17 15l0 .01',
	],
	'users-group': [
		'M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
		'M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1',
		'M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
		'M17 10h2a2 2 0 0 1 2 2v1',
		'M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
		'M3 13v-1a2 2 0 0 1 2 -2h2',
	],
	'heart-handshake': [
		'M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572',
		'M12 6l-3.293 3.293a1 1 0 0 0 0 1.414l.543 .543c.69 .69 1.81 .69 2.5 0l1 -1a3.182 3.182 0 0 1 4.5 0l2.25 2.25',
		'M12.5 15.5l2 2',
		'M15 13l2 2',
	],
	bulb: [
		'M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7',
		'M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3',
		'M9.7 17l4.6 0',
	],
	'chart-arrows': [
		'M3 18l14 0',
		'M9 9l3 3l-3 3',
		'M14 15l3 3l-3 3',
		'M3 3l0 18',
		'M3 12l9 0',
		'M18 3l3 3l-3 3',
		'M3 6l18 0',
	],
	'arrows-join': ['M3 7h5l3.5 5h9.5', 'M3 17h5l3.495 -5', 'M18 15l3 -3l-3 -3'],
}

/** One tabler outline glyph, by name. */
export function CardIcon(props: {
	name: CardIconName
	size?: number
	class?: string
}): JSX.Element {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.size ?? 24}
			height={props.size ?? 24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class={props.class}
			aria-hidden="true"
		>
			<For each={PATHS[props.name]}>{(d) => <path d={d} />}</For>
		</svg>
	)
}
