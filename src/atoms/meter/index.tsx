/** @jsxImportSource @solidjs/web */
import { createSignal, onSettled } from 'solid-js'
import { colorTreatmentData, type ColorTreatmentProps } from '../../shared/color-treatment'

// The fill publishes its percentage as `data-pct`. Where typed attr() is
// supported, the CSS rule `width: attr(data-pct type(<percentage>), 0%)`
// owns the width and the inline fallback is dropped AFTER settle (SSR and
// hydration always carry the inline width, so markup stays stable); the
// 0.5s width transition makes the ownership handoff invisible.

const supportsTypedAttr = (): boolean =>
	typeof CSS !== 'undefined' && CSS.supports('width', 'attr(data-pct type(<percentage>), 0%)')

export function Meter(props: { value: number; max: number; fillColor?: string } & ColorTreatmentProps) {
	const pct = () => Math.min(100, Math.round((props.value / props.max) * 100))
	const [cssOwnsWidth, setCssOwnsWidth] = createSignal(false)
	onSettled(() => {
		if (supportsTypedAttr()) setCssOwnsWidth(true)
	})
	return (
		<div {...colorTreatmentData(props)} class="ui-meter">
			<div
				class="ui-meter-fill"
				data-pct={`${pct()}%`}
				style={{
					width: cssOwnsWidth() ? undefined : `${pct()}%`,
					background: props.colorBase ? 'var(--ui-color-foreground)' : (props.fillColor ?? 'var(--color-base-content)'),
				}}
			/>
		</div>
	)
}
