/** @jsxImportSource @solidjs/web */
import { createSignal } from 'solid-js'
import { Segmented } from '@aicolab/ui-solid'

export function ThreeTabs() {
	const [tab, setTab] = createSignal<'overview' | 'people' | 'rooms'>('overview')
	return (
		<Segmented
			options={[
				{ id: 'overview', label: 'Overview' },
				{ id: 'people', label: 'People' },
				{ id: 'rooms', label: 'Rooms' },
			]}
			value={tab()}
			onChange={setTab}
		/>
	)
}

export function ManyTabs() {
	const [tab, setTab] = createSignal('signals')
	return (
		<div class="max-w-md">
			<Segmented
				options={[
					{ id: 'signals', label: 'Signals' },
					{ id: 'archive', label: 'Archive' },
					{ id: 'residencies', label: 'Residencies' },
					{ id: 'broadcast', label: 'Broadcast' },
					{ id: 'workshops', label: 'Workshops' },
					{ id: 'library', label: 'Library' },
				]}
				value={tab()}
				onChange={setTab}
			/>
		</div>
	)
}
