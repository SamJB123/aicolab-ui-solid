/** @jsxImportSource @solidjs/web */
import { StatusDot } from '@aicolab/ui-solid'

export function Palette() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
			<StatusDot status={{ color: 'var(--color-success)' }} />
			<StatusDot status={{ color: 'var(--color-primary)' }} />
			<StatusDot status={{ color: '#d97706' }} />
			<StatusDot status={{ color: 'var(--color-base-content-faint)' }} />
		</div>
	)
}

export function LivePing() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
			<StatusDot status={{ color: 'var(--color-success)', live: true }} />
			<span style={{ 'font-size': '0.875rem', 'line-height': '1.25rem', color: 'var(--color-base-content-muted)' }}>
				broadcasting
			</span>
		</div>
	)
}

export function Sizes() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
			<StatusDot status={{ color: 'var(--color-primary)' }} size={6} />
			<StatusDot status={{ color: 'var(--color-primary)' }} size={10} />
			<StatusDot status={{ color: 'var(--color-primary)' }} size={16} />
		</div>
	)
}
