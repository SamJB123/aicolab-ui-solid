/** @jsxImportSource @solidjs/web */
import { Counter } from '@aicolab/ui-solid'

export function Plain() {
	return (
		<span class="font-data text-3xl text-[var(--c-paper)]">
			<Counter value={2431} />
		</span>
	)
}

export function Formatted() {
	return (
		<div class="flex flex-col gap-1">
			<span class="font-data text-3xl text-[var(--c-paper)]">
				<Counter value={87.4} format={(n) => `${n.toFixed(1)}%`} />
			</span>
			<span class="font-data text-xs uppercase tracking-[0.2em] text-[var(--c-faint)]">
				occupancy
			</span>
		</div>
	)
}
