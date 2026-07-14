/** @jsxImportSource @solidjs/web */
import { Eyebrow } from '@aicolab/ui-solid'

export function Basic() {
	return <Eyebrow>studio activity</Eyebrow>
}

export function AboveHeading() {
	return (
		<div class="flex flex-col gap-1.5">
			<Eyebrow>residency programme</Eyebrow>
			<h3 class="m-0 font-display text-2xl font-medium text-[var(--c-paper)]">
				Autumn cohort
			</h3>
		</div>
	)
}
