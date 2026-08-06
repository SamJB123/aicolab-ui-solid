/** @jsxImportSource @solidjs/web */
import { Avatar } from '@aicolab/ui-solid'

export function Basic() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
			<Avatar name="Ada Lovelace" color="#4f46e5" />
			<Avatar name="Grace Hopper" color="#16a34a" />
			<Avatar name="Alan Turing" color="#d97706" />
		</div>
	)
}

export function WithStatus() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
			<Avatar name="Ada Lovelace" color="#4f46e5" status={{ color: '#16a34a', live: true }} />
			<Avatar name="Grace Hopper" color="#16a34a" status={{ color: '#9ca3af' }} />
		</div>
	)
}

export function Sizes() {
	return (
		<div style={{ display: 'flex', 'align-items': 'flex-end', gap: '12px' }}>
			<Avatar name="Ada Lovelace" color="#4f46e5" size={24} />
			<Avatar name="Ada Lovelace" color="#4f46e5" size={36} />
			<Avatar name="Ada Lovelace" color="#4f46e5" size={56} />
		</div>
	)
}
