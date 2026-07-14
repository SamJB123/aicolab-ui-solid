/** @jsxImportSource @solidjs/web */
import { Sparkline } from '@aicolab/ui-solid'

const VISITS = [4, 6, 5, 9, 7, 11, 10, 14, 12, 16, 15, 19]
const FLAT = [8, 7, 9, 8, 8, 9, 8, 7, 8, 9]

export function Trend() {
	return <Sparkline data={VISITS} />
}

export function LiveColour() {
	return <Sparkline data={FLAT} color="var(--c-live)" />
}

export function InStatRow() {
	return (
		<div class="flex items-center gap-4">
			<div class="flex flex-col">
				<span class="font-data text-2xl text-[var(--c-paper)]">1,204</span>
				<span class="font-data text-[10px] uppercase tracking-[0.2em] text-[var(--c-faint)]">
					visits this week
				</span>
			</div>
			<Sparkline data={VISITS} w={100} h={30} />
		</div>
	)
}
