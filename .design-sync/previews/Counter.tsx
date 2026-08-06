/** @jsxImportSource @solidjs/web */
import { Counter } from '@aicolab/ui-solid'

const BIG_NUM = {
	'font-family': 'var(--font-data)',
	'font-size': '1.875rem',
	'line-height': '2.25rem',
	color: 'var(--c-text)',
}

export function Plain() {
	return (
		<span style={BIG_NUM}>
			<Counter value={2431} />
		</span>
	)
}

export function Formatted() {
	return (
		<div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
			<span style={BIG_NUM}>
				<Counter value={87.4} format={(n) => `${n.toFixed(1)}%`} />
			</span>
			<span
				style={{
					'font-family': 'var(--font-data)',
					'font-size': '0.75rem',
					'line-height': '1rem',
					'text-transform': 'uppercase',
					'letter-spacing': '0.2em',
					color: 'var(--c-faint)',
				}}
			>
				occupancy
			</span>
		</div>
	)
}
