/** @jsxImportSource @solidjs/web */
import { For } from 'solid-js'
import { colorTreatmentData, type ClassProp, type ColorTreatmentProps } from '../../shared/color-treatment'
export type SegOption<T extends string> = { id: T; label: string }

// The tabs are content-sized and the strip scrolls when there are too many for
// the viewport (so labels never truncate or shrink the columns). The active
// indicator is a single pill anchored — via CSS anchor positioning — to whichever
// tab is active, so it always matches that tab's real box regardless of widths or
// scroll. Where anchor positioning is unsupported, the active tab carries the
// pill look itself (see styles.css `.seg*`).
export function Segmented<T extends string>(props: {
	label?: string
	options: SegOption<T>[]
	value: T
	onChange: (v: T) => void
	class?: ClassProp
} & ColorTreatmentProps) {
	return (
		<div {...colorTreatmentData(props)} class={['seg', props.class]} role="tablist" aria-label={props.label}>
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
