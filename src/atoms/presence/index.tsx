/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { omit, type ParentProps } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'
import { createAttributionColor, presenceColor } from './contract'

/* Presence is deliberately OUTSIDE the three-axis colour treatment: each
 * swatch's paint IS the identity system, delivered as a registered
 * mandatory wire (--ui-presence-color). Geometry, however, is ordinary
 * knob territory — per-context defaults distinguish the two swatch kinds. */
const knobs = defineKnobs('ui-presence', {
	size: '<length>',
	radius: '<length-percentage>',
})

export function Presence(props: ParentProps<{ class?: ClassProp }>) {
	return <div class={['ui-presence', props.class]}>{props.children}</div>
}

type SwatchKnobProps = KnobProps<typeof knobs.spec>

type PresenceSwatchProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	identity: string
} & SwatchKnobProps

export function PresenceSwatch(props: PresenceSwatchProps) {
	const attributes = omit(props, 'class', 'style', 'identity', 'size', 'radius')
	return (
		<span
			{...attributes}
			{...knobs.attributes(props)}
			class={['ui-attribution-swatch', props.class]}
			style={mergeKnobStyle(
				{ ...knobs.style(props), '--ui-presence-color': presenceColor(props.identity) },
				props.style,
			)}
			aria-hidden="true"
		/>
	)
}

type AttributionSwatchProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	identity: string
	colorFor: ReturnType<typeof createAttributionColor>
} & SwatchKnobProps

export function AttributionSwatch(props: AttributionSwatchProps) {
	const attributes = omit(props, 'class', 'style', 'identity', 'colorFor', 'size', 'radius')
	return (
		<span
			{...attributes}
			{...knobs.attributes(props)}
			class={['ui-presence-swatch', props.class]}
			style={mergeKnobStyle(
				{ ...knobs.style(props), '--ui-presence-color': props.colorFor(props.identity) },
				props.style,
			)}
			aria-hidden="true"
		/>
	)
}

type AttributionMarkProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'class'> & {
	class?: ClassProp
	identity?: string
	colorFor: ReturnType<typeof createAttributionColor>
	deleted?: boolean
}

export function AttributionMark(props: ParentProps<AttributionMarkProps>) {
	const attributes = omit(props, 'class', 'style', 'children', 'identity', 'colorFor', 'deleted')
	return (
		<span
			{...attributes}
			class={['ui-attribution-mark', props.class]}
			data-attributed={props.identity ? '' : undefined}
			data-deleted={props.deleted ? '' : undefined}
			style={mergeKnobStyle(
				{
					...(props.identity
						? { '--ui-attribution-color': props.colorFor(props.identity) }
						: undefined),
				},
				props.style,
			)}
		>
			{props.children}
		</span>
	)
}

export {
	attributionColor,
	createAttributionColor,
	createResolvedAttributionColor,
	presenceColor,
	presenceSelectionColor,
	resolvePresenceColor,
	resolvePresenceRole,
} from './contract'
