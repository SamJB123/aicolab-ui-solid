/** @jsxImportSource @solidjs/web */
import { Chip, StatusDot } from '@aicolab/ui-solid'

export function Tones() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
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
