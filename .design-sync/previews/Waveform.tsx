/** @jsxImportSource @solidjs/web */
import { Waveform } from '@aicolab/ui-solid'

const BARS = [0.2, 0.5, 0.9, 0.6, 0.35, 0.8, 1, 0.7, 0.45, 0.85, 0.55, 0.3, 0.65, 0.4, 0.75]

export function Live() {
	return (
		<div class="h-10 w-48">
			<Waveform bars={BARS} />
		</div>
	)
}

export function Muted() {
	return (
		<div class="h-8 w-40">
			<Waveform bars={BARS.map((v) => v * 0.5)} color="var(--c-muted)" />
		</div>
	)
}
