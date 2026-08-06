/** @jsxImportSource @solidjs/web */
import { StatusDot } from '@aicolab/ui-solid'

export function Palette() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
			<StatusDot status={{ color: 'var(--c-live)' }} />
			<StatusDot status={{ color: 'var(--c-accent)' }} />
			<StatusDot status={{ color: '#d97706' }} />
			<StatusDot status={{ color: 'var(--c-faint)' }} />
		</div>
	)
}

export function LivePing() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
			<StatusDot status={{ color: 'var(--c-live)', live: true }} />
			<span style={{ 'font-size': '0.875rem', 'line-height': '1.25rem', color: 'var(--c-muted)' }}>
				broadcasting
			</span>
		</div>
	)
}

export function Sizes() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
			<StatusDot status={{ color: 'var(--c-accent)' }} size={6} />
			<StatusDot status={{ color: 'var(--c-accent)' }} size={10} />
			<StatusDot status={{ color: 'var(--c-accent)' }} size={16} />
		</div>
	)
}
