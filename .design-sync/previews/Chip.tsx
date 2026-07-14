/** @jsxImportSource @solidjs/web */
import { Chip, StatusDot } from '@aicolab/ui-solid'

export function Tones() {
	return (
		<div class="flex items-center gap-2">
			<Chip>archive</Chip>
			<Chip tone="accent">featured</Chip>
			<Chip tone="live">on air</Chip>
		</div>
	)
}

export function WithDot() {
	return (
		<Chip tone="live">
			<StatusDot status={{ color: 'var(--c-live)', live: true }} size={6} />
			recording
		</Chip>
	)
}
