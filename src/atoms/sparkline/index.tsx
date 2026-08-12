/** @jsxImportSource @solidjs/web */
import { createMemo } from 'solid-js'
import { colorTreatmentData, type ColorTreatmentProps } from '../../shared/color-treatment'

export function Sparkline(props: { data: number[]; w?: number; h?: number; strokeColor?: string } & ColorTreatmentProps) {
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
	const exactColor = () => props.colorBase ? 'var(--ui-color)' : (props.strokeColor ?? 'var(--color-primary)')
	const foregroundColor = () => props.colorBase ? 'var(--ui-color-foreground)' : exactColor()
	return (
		<svg
			{...colorTreatmentData(props)}
			viewBox={`0 0 ${geo().w} ${geo().h}`}
			width={geo().w}
			height={geo().h}
			class="ui-sparkline"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<polygon points={geo().area} fill={exactColor()} opacity="0.1" />
			<polyline
				points={geo().line}
				fill="none"
				stroke={foregroundColor()}
				stroke-width="1.5"
				stroke-linejoin="round"
				stroke-linecap="round"
			/>
			<circle cx={geo().last[0]} cy={geo().last[1]} r="2.4" fill={foregroundColor()} />
		</svg>
	)
}
