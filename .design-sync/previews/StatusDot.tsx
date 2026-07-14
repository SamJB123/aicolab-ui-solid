/** @jsxImportSource @solidjs/web */
import { StatusDot } from '@aicolab/ui-solid'

export function Palette() {
	return (
		<div class="flex items-center gap-4">
			<StatusDot status={{ color: 'var(--c-live)' }} />
			<StatusDot status={{ color: 'var(--c-accent)' }} />
			<StatusDot status={{ color: '#d97706' }} />
			<StatusDot status={{ color: 'var(--c-faint)' }} />
		</div>
	)
}

export function LivePing() {
	return (
		<div class="flex items-center gap-2">
			<StatusDot status={{ color: 'var(--c-live)', live: true }} />
			<span class="text-sm text-[var(--c-muted)]">broadcasting</span>
		</div>
	)
}

export function Sizes() {
	return (
		<div class="flex items-center gap-4">
			<StatusDot status={{ color: 'var(--c-accent)' }} size={6} />
			<StatusDot status={{ color: 'var(--c-accent)' }} size={10} />
			<StatusDot status={{ color: 'var(--c-accent)' }} size={16} />
		</div>
	)
}
