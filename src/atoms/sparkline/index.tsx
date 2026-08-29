/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createMemo, omit } from 'solid-js'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiColor } from '../../shared/knobs'

/** ink drives line, end dot and area fill (the fill via a CSS-side mix).
 * w/h stay plain numbers: they feed the JS path math and the viewBox, not
 * CSS. */
const knobs = defineKnobs('ui-spark', { ink: '<color>' })

type SparklineProps = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, 'class'> & {
	class?: ClassProp
	data: number[]
	w?: number
	h?: number
	/** @deprecated Use `ink`. */
	strokeColor?: UiColor
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

export function Sparkline(props: SparklineProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'data',
		'w',
		'h',
		'ink',
		'strokeColor',
		'colorBase',
		'colorLevel',
		'variant',
	)
	const geo = createMemo(() => {
		const w = props.w ?? 132
		const h = props.h ?? 36
		const d = props.data
		const max = Math.max(...d)
		const min = Math.min(...d)
		const span = max - min || 1
		const step = w / Math.max(1, d.length - 1)
		const pts = d.map((v, i) => [i * step, h - 3 - ((v - min) / span) * (h - 6)] as const)
		const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
		const area = `0,${h} ${line} ${w},${h}`
		return { w, h, line, area, last: pts[pts.length - 1] }
	})
	const values = () => ({ ink: props.ink ?? props.strokeColor })
	return (
		<svg
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(values())}
			viewBox={`0 0 ${geo().w} ${geo().h}`}
			width={geo().w}
			height={geo().h}
			class={['ui-sparkline', props.class]}
			style={mergeKnobStyle(knobs.style(values()), props.style)}
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<polygon points={geo().area} />
			<polyline
				points={geo().line}
				fill="none"
				stroke-width="1.5"
				stroke-linejoin="round"
				stroke-linecap="round"
			/>
			<circle cx={geo().last?.[0]} cy={geo().last?.[1]} r="2.4" />
		</svg>
	)
}
