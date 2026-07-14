/** @jsxImportSource @solidjs/web */
import { Button, Chip, Panel } from '@aicolab/ui-solid'

export function Basic() {
	return (
		<Panel title="Residency overview">
			<p class="m-0 text-sm text-[var(--c-muted)]">
				Fourteen studios are occupied this cycle. Two applications are still in
				review, and the atrium remains reserved for the open-day install.
			</p>
		</Panel>
	)
}

export function WithIndexAndKicker() {
	return (
		<Panel index="03" title="Signal log" kicker="last 24 hours">
			<ul class="m-0 flex list-none flex-col gap-2 p-0 text-sm text-[var(--c-muted)]">
				<li>08:12 — uplink re-established after maintenance window</li>
				<li>11:47 — archive sync completed (2,431 items)</li>
				<li>16:03 — two new residency applications received</li>
			</ul>
		</Panel>
	)
}

export function WithActionAndGlow() {
	return (
		<Panel
			title="Broadcast"
			kicker="channel two"
			glow
			action={() => <Chip tone="live">on air</Chip>}
		>
			<p class="m-0 mb-4 text-sm text-[var(--c-muted)]">
				The evening programme is streaming to 312 listeners.
			</p>
			<Button variant="primary" class="self-start">
				Open studio view
			</Button>
		</Panel>
	)
}
