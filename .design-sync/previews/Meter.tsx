/** @jsxImportSource @solidjs/web */
import { Meter } from '@aicolab/ui-solid'

export function Levels() {
	return (
		<div class="flex w-64 flex-col gap-3">
			<Meter value={3} max={12} />
			<Meter value={8} max={12} />
			<Meter value={12} max={12} />
		</div>
	)
}

export function AccentAndLive() {
	return (
		<div class="flex w-64 flex-col gap-3">
			<Meter value={9} max={12} color="var(--c-accent)" />
			<Meter value={5} max={12} color="var(--c-live)" />
		</div>
	)
}

export function Labelled() {
	return (
		<div class="flex w-64 flex-col gap-1.5">
			<div class="flex items-baseline justify-between">
				<span class="font-data text-[10px] uppercase tracking-[0.2em] text-[var(--c-faint)]">
					studio 4 occupancy
				</span>
				<span class="font-data text-xs text-[var(--c-muted)]">9/12</span>
			</div>
			<Meter value={9} max={12} color="var(--c-accent)" />
		</div>
	)
}
