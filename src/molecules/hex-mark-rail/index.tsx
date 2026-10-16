/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { children, For, Show } from 'solid-js'
import { HexMark } from '../../atoms/hex-mark'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorBase,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export interface HexMarkRailItem {
	id: string
	label: string
	/** A line icon as SVG (a lazy slot, so it is made once per item). */
	icon?: () => JSX.Element
	/** The family the item's mark lights in when it is current; absent, the
	 *  rail's. */
	colorBase?: ColorBase
}

/** Per-instance styling contract (see shared/knobs.ts). The two widths are
 * the rail's in its two states; markSize is each item's mark. */
const knobs = defineKnobs('ui-hexrail', {
	openWidth: '<length>',
	closedWidth: '<length>',
	markSize: '<length>',
	gap: '<length>',
})

/**
 * A rail of hexagonal marks, one per place: closed, the marks alone (the
 * collapsed rail of Material's pattern, an icon rail); open, each mark with
 * its name beside it. The current place's mark lights in its family and its
 * row is the selected surface. A head and a foot hold what the host puts at
 * the rail's ends (a brand, a face switch, an account); the host decides when
 * the rail opens — by where the reader is, or by a toggle it renders in the
 * head.
 */
export function HexMarkRail(
	props: {
		/** The landmark's name, read by assistive tech ("Places"). */
		label: string
		items: readonly HexMarkRailItem[]
		currentId?: string | null
		/** Names beside the marks. Closed (the default) shows marks alone,
		 *  each named by its title and accessible name. */
		open?: boolean
		onSelect: (id: string) => void
		head?: JSX.Element
		foot?: JSX.Element
		class?: ClassProp
	} & ColorTreatmentProps &
		KnobProps<typeof knobs.spec>,
) {
	// Single-eval slot resolution (children()) — element-JSX props are getters;
	// double evaluation breaks hydration claiming.
	const head = children(() => props.head)
	const foot = children(() => props.foot)
	return (
		<nav
			class={['ui-hex-mark-rail', props.class]}
			aria-label={props.label}
			data-open={props.open ? '' : undefined}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
		>
			<Show when={head()}>
				<div class="ui-hex-mark-rail-head">{head()}</div>
			</Show>
			<ul class="ui-hex-mark-rail-list">
				<For each={props.items}>
					{(item) => {
						const current = () => props.currentId === item.id
						return (
							<li class="ui-hex-mark-rail-entry">
								<button
									type="button"
									class="ui-hex-mark-rail-item"
									aria-current={current() ? 'page' : undefined}
									aria-label={props.open ? undefined : item.label}
									title={props.open ? undefined : item.label}
									onClick={() => props.onSelect(item.id)}
								>
									<HexMark
										class="ui-hex-mark-rail-mark"
										colorBase={current() ? (item.colorBase ?? props.colorBase ?? 'primary') : undefined}
									>
										{item.icon?.()}
									</HexMark>
									<Show when={props.open}>
										<span class="ui-hex-mark-rail-label">{item.label}</span>
									</Show>
								</button>
							</li>
						)
					}}
				</For>
			</ul>
			<Show when={foot()}>
				<div class="ui-hex-mark-rail-foot">{foot()}</div>
			</Show>
		</nav>
	)
}
