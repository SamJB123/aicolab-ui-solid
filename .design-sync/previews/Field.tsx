/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import { Field, Segmented } from '@aicolab/ui-solid'

export function WithInput() {
	return (
		<div style={{ width: '16rem' }}>
			<Field label="studio name">
				<input
					type="text"
					value="Atrium West"
					style={{
						'border-radius': '8px',
						background: 'var(--color-base-100)',
						padding: '8px 12px',
						'font-size': '0.875rem',
						'line-height': '1.25rem',
						color: 'var(--color-base-content)',
						'box-shadow': '0 0 0 1px var(--color-border-strong)',
						border: 'none',
						outline: 'none',
					}}
				/>
			</Field>
		</div>
	)
}

export function WithSegmented() {
	const [v, setV] = createSignal('public')
	return (
		<Field label="visibility">
			<Segmented
				options={[
					{ id: 'public', label: 'Public' },
					{ id: 'members', label: 'Members' },
					{ id: 'private', label: 'Private' },
				]}
				value={v()}
				onChange={setV}
			/>
		</Field>
	)
}
