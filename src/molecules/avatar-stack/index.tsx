/** @jsxImportSource @solidjs/web */
import { createMemo, For, Show } from 'solid-js'
import { Avatar } from '../../atoms/avatar'
import type { StatusVisual } from '../../atoms/status-dot'
import { colorTreatmentData, type ColorTreatmentProps } from '../../shared/color-treatment'
import {
	defineKnobs,
	mergeKnobStyle,
	toLength,
	type KnobProps,
	type UiLength,
	type UiColor,
} from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The avatars size
 * from the stack — it supplies the atom's public knob variables for the
 * subtree — and all derived geometry (overlap, +N chip, badge dot) is
 * computed in CSS from these. */
const knobs = defineKnobs('ui-avstack', {
	size: '<length>',
	overlap: '<length>',
	ring: '<color>',
	ringWidth: '<length>',
	extraSurface: '<color>',
	extraInk: '<color>',
})

export type AvatarStackPerson = {
	name: string
	/** Identity ink for the initials face; omitted → the Avatar's default. */
	color?: UiColor
	image?: string | null
	status?: StatusVisual
}

export function AvatarStack(
	props: {
		people: AvatarStackPerson[]
		max?: number
		/** Bare number = px (legacy convention); measurements/vars also accepted. */
		size?: number | UiLength
	} & Omit<KnobProps<typeof knobs.spec>, 'size'> &
		ColorTreatmentProps,
) {
	const max = () => props.max ?? 5
	const shown = createMemo(() => props.people.slice(0, max()))
	const extra = createMemo(() => props.people.length - shown().length)
	const values = () => ({
		size: toLength(props.size),
		overlap: props.overlap,
		ring: props.ring,
		ringWidth: props.ringWidth,
		extraSurface: props.extraSurface,
		extraInk: props.extraInk,
	})
	return (
		<div
			{...colorTreatmentData(props)}
			{...knobs.attributes(values())}
			class="ui-avatar-stack"
			style={mergeKnobStyle(knobs.style(values()), undefined)}
		>
			<For each={shown()}>
				{(p, i) => (
					<span
						class="ui-avatar-stack-item"
						/* Earlier avatars overlap later ones — a per-item structural
						   value, so it stays inline like a mandatory wire. */
						style={{ 'z-index': String(shown().length - i()) }}
					>
						<Avatar
							name={p.name}
							image={p.image}
							status={p.status}
							/* A treated stack reads as one unit: identity inks yield to
							   the family treatment (the Avatar's treated default). */
							ink={props.colorBase ? undefined : p.color}
							colorBase={props.colorBase}
							colorLevel={props.colorLevel}
							variant={props.variant}
						/>
					</span>
				)}
			</For>
			<Show when={extra() > 0}>
				<span class="ui-avatar-stack-extra">+{extra()}</span>
			</Show>
		</div>
	)
}
