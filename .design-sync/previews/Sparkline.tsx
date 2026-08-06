/** @jsxImportSource @solidjs/web */
import { Sparkline } from '@aicolab/ui-solid'

const VISITS = [4, 6, 5, 9, 7, 11, 10, 14, 12, 16, 15, 19]
const FLAT = [8, 7, 9, 8, 8, 9, 8, 7, 8, 9]

export function Trend() {
	return <Sparkline data={VISITS} />
}

export function LiveColour() {
	return <Sparkline data={FLAT} color="var(--c-live)" />
}

export function InStatRow() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
			<div style={{ display: 'flex', 'flex-direction': 'column' }}>
				<span
					style={{
						'font-family': 'var(--font-data)',
						'font-size': '1.5rem',
						'line-height': '2rem',
						color: 'var(--c-text)',
					}}
				>
					1,204
				</span>
				<span
					style={{
						'font-family': 'var(--font-data)',
						'font-size': '10px',
						'text-transform': 'uppercase',
						'letter-spacing': '0.2em',
						color: 'var(--c-faint)',
					}}
				>
					visits this week
				</span>
			</div>
			<Sparkline data={VISITS} w={100} h={30} />
		</div>
	)
}
