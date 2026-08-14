/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { For, omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

export type SegOption<T extends string> = { id: T; label: string }

/** Per-instance styling contract (see shared/knobs.ts). Tab-consumed knobs
 * ride inheriting adapters assigned on the root. */
const knobs = defineKnobs('ui-seg', {
	radius: '<length-percentage>',
	trackPad: '<length>',
	tabPadBlock: '<length>',
	tabPadInline: '<length>',
	gap: '<length>',
	fontSize: '<length>',
	trackSurface: '<color>',
	activeSurface: '<color>',
	activeInk: '<color>',
	inactiveInk: '<color>',
})

type SegmentedProps<T extends string> = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'onChange'> & {
	class?: ClassProp
	label?: string
	options: SegOption<T>[]
	value: T
	onChange: (v: T) => void
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

// The tabs are content-sized and the strip scrolls when there are too many for
// the viewport (so labels never truncate or shrink the columns). The active
// indicator is a single pill anchored — via CSS anchor positioning — to whichever
// tab is active, so it always matches that tab's real box regardless of widths or
// scroll. Where anchor positioning is unsupported, the active tab carries the
// pill look itself (see styles.css `.seg*`).
export function Segmented<T extends string>(props: SegmentedProps<T>) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'options',
		'value',
		'onChange',
		'colorBase',
		'colorLevel',
		'variant',
		'radius',
		'trackPad',
		'tabPadBlock',
		'tabPadInline',
		'gap',
		'fontSize',
		'trackSurface',
		'activeSurface',
		'activeInk',
		'inactiveInk',
	)
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['seg', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			role="tablist"
			aria-label={props.label}
		>
			<For each={props.options}>
				{(o) => (
					<button
						type="button"
						role="tab"
						aria-selected={props.value === o.id ? 'true' : 'false'}
						onClick={(e) => {
							props.onChange(o.id)
							// One-shot side effect: keep the clicked tab visible when the
							// strip scrolls. Called directly in the handler (per the Solid
							// cheatsheet) — no reactive effect needed.
							e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
						}}
						class={['seg-btn', { 'seg-btn-active': props.value === o.id }]}
					>
						{o.label}
					</button>
				)}
			</For>
			<span class="seg-pill" aria-hidden="true" />
		</div>
	)
}
