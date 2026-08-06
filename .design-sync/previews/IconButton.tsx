/** @jsxImportSource @solidjs/web */
import { IconButton } from '@aicolab/ui-solid'

function PlusIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	)
}

function BellIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d="M8 2a4 4 0 0 0-4 4v2.5L2.8 11h10.4L12 8.5V6a4 4 0 0 0-4-4Zm-1.5 10a1.5 1.5 0 0 0 3 0"
				stroke="currentColor"
				stroke-width="1.2"
				stroke-linejoin="round"
			/>
		</svg>
	)
}

export function Pair() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
			<IconButton label="Add item">
				<PlusIcon />
			</IconButton>
			<IconButton label="Notifications">
				<BellIcon />
			</IconButton>
		</div>
	)
}
