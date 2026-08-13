/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, Show } from 'solid-js'
import { StatusDot, type StatusVisual } from '../status-dot'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import {
	defineKnobs,
	mergeKnobStyle,
	toLength,
	type UiColor,
	type UiLength,
} from '../../shared/knobs'

const initials = (name: string) =>
	name
		.split(' ')
		.map((w) => w[0])
		.slice(0, 2)
		.join('')
		.toUpperCase()

/** Per-instance styling contract (see shared/knobs.ts). All derived values
 * (face type size, backing mixes, badge dot size) are computed in CSS from
 * these three, so the component emits no computed inline styling. */
const knobs = defineKnobs('ui-avatar', {
	size: '<length>',
	ink: '<color>',
	ring: '<color>',
})

type AvatarProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	name: string
	image?: string | null
	referrerPolicy?: JSX.ImgHTMLAttributes<HTMLImageElement>['referrerpolicy']
	status?: StatusVisual
	/** Bare number = px (legacy convention); measurements/vars also accepted. */
	size?: number | UiLength
	/** Face ink (initials / accents). */
	ink?: UiColor
	/** Backing ring/surface behind the face and badge. */
	ring?: UiColor
	/** @deprecated Use `ink`. */
	faceColor?: UiColor
} & ColorTreatmentProps

export function Avatar(props: AvatarProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'name',
		'image',
		'referrerPolicy',
		'status',
		'size',
		'ink',
		'ring',
		'faceColor',
		'colorBase',
		'colorLevel',
		'variant',
	)
	const values = () => ({
		size: toLength(props.size),
		ink: props.ink ?? props.faceColor,
		ring: props.ring,
	})
	const sizeCss = () => toLength(props.size) ?? '36px'
	return (
		<span
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(values())}
			class={['ui-avatar', props.class]}
			style={mergeKnobStyle(knobs.style(values()), props.style)}
		>
			<span class="ui-avatar-face">
				<Show when={props.image} fallback={initials(props.name)}>
					{(source) => (
						<img
							class="ui-avatar-image"
							src={source()}
							alt=""
							referrerpolicy={props.referrerPolicy}
						/>
					)}
				</Show>
			</span>
			<Show when={props.status}>
				{(s) => (
					<span class="ui-avatar-badge">
						<StatusDot status={s()} size={`max(7px, calc(${sizeCss()} * 0.2))`} />
					</span>
				)}
			</Show>
		</span>
	)
}
