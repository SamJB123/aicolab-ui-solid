/** @jsxImportSource @solidjs/web */
import { Waveform } from '@aicolab/ui-solid'

const BARS = [0.2, 0.5, 0.9, 0.6, 0.35, 0.8, 1, 0.7, 0.45, 0.85, 0.55, 0.3, 0.65, 0.4, 0.75]

export function Live() {
	return (
		<div style={{ height: '2.5rem', width: '12rem' }}>
			<Waveform bars={BARS} />
		</div>
	)
}

export function Muted() {
	return (
		<div style={{ height: '2rem', width: '10rem' }}>
			<Waveform bars={BARS.map((v) => v * 0.5)} color="var(--color-base-content-muted)" />
		</div>
	)
}
