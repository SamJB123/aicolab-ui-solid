/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import type { ParentProps } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'
import { createAttributionColor, presenceColor } from './contract'

export function Presence(props: ParentProps<{ class?: ClassProp }>) {
	return <div class={['ui-presence', props.class]}>{props.children}</div>
}

export function PresenceSwatch(props: { identity: string; class?: ClassProp }) {
	return (
		<span
			class={['ui-attribution-swatch', props.class]}
			style={{ '--ui-presence-color': presenceColor(props.identity) }}
			aria-hidden="true"
		/>
	)
}

export function AttributionSwatch(props: {
	identity: string
	colorFor: ReturnType<typeof createAttributionColor>
	class?: ClassProp
}) {
	return (
		<span
			class={['ui-presence-swatch', props.class]}
			style={{ '--ui-presence-color': props.colorFor(props.identity) }}
			aria-hidden="true"
		/>
	)
}

export function AttributionMark(
	props: ParentProps<{
		identity?: string
		colorFor: ReturnType<typeof createAttributionColor>
		deleted?: boolean
		title?: string
		class?: ClassProp
		style?: JSX.CSSProperties
	}>,
) {
	return (
		<span
			class={['ui-attribution-mark', props.class]}
			data-attributed={props.identity ? '' : undefined}
			data-deleted={props.deleted ? '' : undefined}
			title={props.title}
			style={{
				...props.style,
				'--ui-attribution-color': props.identity ? props.colorFor(props.identity) : undefined,
			}}
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
