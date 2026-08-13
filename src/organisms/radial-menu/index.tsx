/** @jsxImportSource @solidjs/web */
// RadialMenu — a fan of actions around a trigger, on the 2026 platform
// stack (see web-platform-2026-innovations.md): Popover API for the top
// layer + light dismiss, ANCHOR POSITIONING tethered to the TRIGGER (the
// overlay standard — never a wrapper), `@starting-style` entrances, and
// CSS-DERIVED geometry: the stylesheet turns item count into pitch and
// angle, CSS trigonometry places each chip, and the fan RADIUS has an
// ANALYTIC FLOOR — labels live in a fixed-width lane under their chips
// (wrapping, never resizing), and the stylesheet solves
// R ≥ max(lane, cardHeight) / (2·sin(pitch/2)) so adjacent cards clear
// each other at ANY token values. The component contributes only its
// public props and the structural item index/count as custom properties
// (tree-counting functions would remove those two, but as of 2026-08
// they crash Chromium inside this chain — Tier 4, as the doc warns).
//
// The fan opens UPWARD by default (made for bottom bars); `direction:
// 'down'` flips it for top-anchored triggers. Selection closes the menu.

import type { JSX } from '@solidjs/web'
import { For } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The chip is a
 * painted pair; the hover ring is the accent (family when treated). The
 * label ink stays deliberately mode-invariant — contrast is against the
 * ::backdrop veil, never the page. */
const knobs = defineKnobs('ui-radial', {
	chipSize: '<length>',
	chipSurface: '<color>',
	chipInk: '<color>',
	hoverRing: '<color>',
})

export interface RadialMenuItem {
	id: string
	label: string
	/** Rendered inside the item's circular chip (an icon, a mark…). */
	icon?: JSX.Element
	onSelect: () => void
}

/**
 * A trigger button + a radial fan of item chips around it. The consumer
 * styles the trigger via `triggerClass` (and its children); the fan's
 * look rides the token contract. `sweep` degrees of arc are centred
 * straight above (or below) the trigger.
 */
export function RadialMenu(props: {
	/** Unique id — becomes the popover id and the anchor name. */
	id: string
	items: readonly RadialMenuItem[]
	/** Accessible name for the menu. Default "Radial menu". */
	label?: string
	/** MINIMUM fan radius (rem) — the stylesheet's analytic floor grows it
	 *  whenever the label lane needs more room. Default 6.4. */
	radius?: number
	/** Arc sweep in degrees. Default 150. */
	sweep?: number
	/** Fan opening direction. Default 'up'. */
	direction?: 'up' | 'down'
	triggerClass?: ClassProp
	class?: ClassProp
	/** Trigger content. */
	children?: JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>) {
	let menuEl: HTMLDivElement | undefined
	return (
		<>
			<button
				type="button"
				class={['ui-radial-trigger', props.triggerClass]}
				popovertarget={props.id}
				style={{ 'anchor-name': `--${props.id}` }}
			>
				{props.children}
			</button>
			{/* Geometry (count → pitch → angle → analytic radius floor) is
			    derived in the stylesheet; the component supplies only the
			    structural integers (item index/count) and its public props
			    as tokens. (sibling-index()/count() would remove even those,
			    but currently crash Chromium in this chain — see styles.) */}
			<div
				id={props.id}
				popover="auto"
				class={['ui-radial', props.class]}
				role="menu"
				aria-label={props.label ?? 'Radial menu'}
				{...colorTreatmentData(props)}
				{...knobs.attributes(props)}
				style={mergeKnobStyle(knobs.style(props), {
					'position-anchor': `--${props.id}`,
					'--radial-radius': `${props.radius ?? 6.4}rem`,
					'--radial-sweep': `${props.sweep ?? 150}deg`,
					'--radial-down': props.direction === 'down' ? '1' : '0',
					'--radial-count': String(props.items.length),
				})}
				ref={(el) => {
					menuEl = el
				}}
			>
				<For each={props.items}>
					{(item, index) => (
						<button
							type="button"
							role="menuitem"
							class="ui-radial-item"
							style={{ '--radial-i': String(index()) }}
							onClick={() => {
								menuEl?.hidePopover()
								item.onSelect()
							}}
						>
							<span class="ui-radial-chip">{item.icon}</span>
							<span class="ui-radial-label">{item.label}</span>
						</button>
					)}
				</For>
			</div>
		</>
	)
}
