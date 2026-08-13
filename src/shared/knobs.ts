import type { JSX } from '@solidjs/web'

/* Per-instance customisation knobs. A component declares its knob contract
   once; instances supply values as typed props, which may be reactive. The
   component emits every provided knob on BOTH wire formats so the two
   stylesheet paths stay equivalent:
   - custom properties (`--ui-select-radius`) — the Baseline compatibility
     path, consumed via `var(…, default)`;
   - data attributes (`data-ui-select-radius`) — the typed-attr() frontier
     path, consumed via `attr(… type(<syntax>), default)` behind the same
     probe gate as resolver.css. Delete the custom-property wire together
     with the compatibility reads once typed attr() reaches the supported
     Baseline floor.
   CSS-side house pattern (see select-control/styles.css for the exemplar):
   the PUBLIC knob stays unregistered — its "value" may be absent, which is
   what lets the fallback carry a token-live default, lets defaults differ
   per context, and lets containers or app CSS supply values by inheritance.
   The stylesheet resolves each knob ONCE per default-context into a
   registered private adapter (`--_<prefix>-<knob>`, @property with the
   knob's syntax, inherits: false, dummy literal initial that is never
   visible because the same stylesheet always assigns it). All consuming
   declarations read the adapter; the frontier block swaps only the adapter
   assignments. Assign an adapter inside the pseudo-element rule that
   consumes it (public knobs inherit into pseudo-elements; private adapters
   deliberately do not). Registering the PUBLIC knob instead is always
   wrong: @property initial-values must be computationally independent
   (frozen literals — no var()), which would detach defaults from the token
   system. Transition consuming properties as usual; transition an adapter
   itself only when its destination cannot interpolate (gradients, masks)
   — never both, or the eases compound. */

export type UiLength =
	| `${number}px`
	| `${number}rem`
	| `${number}em`
	| `${number}ch`
	| `${number}vw`
	| `${number}vh`
	| '0'
	| `var(--${string})`
	| `calc(${string})`
	| `clamp(${string})`
	| `min(${string})`
	| `max(${string})`
export type UiLengthPercentage = UiLength | `${number}%`
export type UiColor =
	| `var(--${string})`
	| `oklch(${string})`
	| `color-mix(${string})`
	| `light-dark(${string})`
	| `rgb(${string})`
	| `hsl(${string})`
	| `#${string}`
	| 'currentColor'
	| 'transparent'

interface KnobValueTypes {
	'<length>': UiLength
	'<length-percentage>': UiLengthPercentage
	'<color>': UiColor
	'<number>': number | `${number}`
}
export type KnobSyntax = keyof KnobValueTypes
export type KnobSpec = Record<string, KnobSyntax>
export type KnobProps<Spec extends KnobSpec> = {
	[Name in keyof Spec]?: KnobValueTypes[Spec[Name]]
}

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

export function defineKnobs<Spec extends KnobSpec>(prefix: string, spec: Spec) {
	const names: Array<Extract<keyof Spec, string>> = []
	for (const name in spec) names.push(name)
	const attributeName = (name: string): `data-${string}` => `data-${prefix}-${kebab(name)}`
	const propertyName = (name: string): `--${string}` => `--${prefix}-${kebab(name)}`
	const provided = (props: KnobProps<Spec>) =>
		names.flatMap((name) => {
			const value = props[name]
			if (value === undefined) return []
			return [{ name, value: String(value) }]
		})
	return {
		spec,
		attributes: (props: KnobProps<Spec>) => {
			const out: Record<`data-${string}`, string> = {}
			for (const { name, value } of provided(props)) out[attributeName(name)] = value
			return out
		},
		style: (props: KnobProps<Spec>) => {
			const out: JSX.CSSProperties = {}
			for (const { name, value } of provided(props)) out[propertyName(name)] = value
			return out
		},
	}
}

/** Merge a component's knob variables under any instance-authored style, so
 * an explicit `style` declaration of the same custom property wins. */
export const mergeKnobStyle = (
	knobs: JSX.CSSProperties,
	style: JSX.CSSProperties | string | undefined | false,
): JSX.CSSProperties | string => {
	if (style === undefined || style === false) return knobs
	if (typeof style === 'string') {
		const declarations = Object.entries(knobs).map(([property, value]) => `${property}: ${value}`)
		return [...declarations, style].join('; ')
	}
	return { ...knobs, ...style }
}
