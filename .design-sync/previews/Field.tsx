/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import { Field, Segmented } from '@aicolab/ui-solid'

export function WithInput() {
	return (
		<Field label="studio name" class="w-64">
			<input
				type="text"
				value="Atrium West"
				class="rounded-lg bg-[var(--c-panel)] px-3 py-2 text-sm text-[var(--c-paper)] ring-1 ring-[var(--c-line-strong)]"
				style={{ border: 'none', outline: 'none' }}
			/>
		</Field>
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
