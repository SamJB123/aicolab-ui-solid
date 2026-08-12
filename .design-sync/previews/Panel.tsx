/** @jsxImportSource @solidjs/web */
import { Button, Chip, Panel } from '@aicolab/ui-solid'

export function Basic() {
	return (
		<Panel title="Residency overview">
			<p style={{ margin: '0', 'font-size': '0.875rem', 'line-height': '1.25rem', color: 'var(--color-base-content-muted)' }}>
				Fourteen studios are occupied this cycle. Two applications are still in
				review, and the atrium remains reserved for the open-day install.
			</p>
		</Panel>
	)
}

export function WithIndexAndKicker() {
	return (
		<Panel index="03" title="Signal log" kicker="last 24 hours">
			<ul
				style={{
					margin: '0',
					padding: '0',
					'list-style': 'none',
					display: 'flex',
					'flex-direction': 'column',
					gap: '8px',
					'font-size': '0.875rem',
					'line-height': '1.25rem',
					color: 'var(--color-base-content-muted)',
				}}
			>
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
			<p style={{ margin: '0 0 16px', 'font-size': '0.875rem', 'line-height': '1.25rem', color: 'var(--color-base-content-muted)' }}>
				The evening programme is streaming to 312 listeners.
			</p>
			<div style={{ 'align-self': 'flex-start' }}>
				<Button variant="primary">Open studio view</Button>
			</div>
		</Panel>
	)
}
