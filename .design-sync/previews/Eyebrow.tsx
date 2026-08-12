/** @jsxImportSource @solidjs/web */
import { Eyebrow } from '@aicolab/ui-solid'

export function Basic() {
	return <Eyebrow>studio activity</Eyebrow>
}

export function AboveHeading() {
	return (
		<div style={{ display: 'flex', 'flex-direction': 'column', gap: '6px' }}>
			<Eyebrow>residency programme</Eyebrow>
			<h3
				style={{
					margin: '0',
					'font-family': 'var(--font-display)',
					'font-size': '1.5rem',
					'line-height': '2rem',
					'font-weight': '500',
					color: 'var(--color-base-content)',
				}}
			>
				Autumn cohort
			</h3>
		</div>
	)
}
