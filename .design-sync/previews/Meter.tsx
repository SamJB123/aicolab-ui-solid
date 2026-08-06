/** @jsxImportSource @solidjs/web */
import { Meter } from '@aicolab/ui-solid'

const COL_64 = { display: 'flex', width: '16rem', 'flex-direction': 'column', gap: '12px' }

export function Levels() {
	return (
		<div style={COL_64}>
			<Meter value={3} max={12} />
			<Meter value={8} max={12} />
			<Meter value={12} max={12} />
		</div>
	)
}

export function AccentAndLive() {
	return (
		<div style={COL_64}>
			<Meter value={9} max={12} color="var(--c-accent)" />
			<Meter value={5} max={12} color="var(--c-live)" />
		</div>
	)
}

export function Labelled() {
	return (
		<div style={{ display: 'flex', width: '16rem', 'flex-direction': 'column', gap: '6px' }}>
			<div style={{ display: 'flex', 'align-items': 'baseline', 'justify-content': 'space-between' }}>
				<span
					style={{
						'font-family': 'var(--font-data)',
						'font-size': '10px',
						'text-transform': 'uppercase',
						'letter-spacing': '0.2em',
						color: 'var(--c-faint)',
					}}
				>
					studio 4 occupancy
				</span>
				<span
					style={{
						'font-family': 'var(--font-data)',
						'font-size': '0.75rem',
						'line-height': '1rem',
						color: 'var(--c-muted)',
					}}
				>
					9/12
				</span>
			</div>
			<Meter value={9} max={12} color="var(--c-accent)" />
		</div>
	)
}
