/** @jsxImportSource @solidjs/web */
import { Avatar } from '@aicolab/ui-solid'

export function Basic() {
	return (
		<div class="flex items-center gap-3">
			<Avatar name="Ada Lovelace" color="#4f46e5" />
			<Avatar name="Grace Hopper" color="#16a34a" />
			<Avatar name="Alan Turing" color="#d97706" />
		</div>
	)
}

export function WithStatus() {
	return (
		<div class="flex items-center gap-3">
			<Avatar name="Ada Lovelace" color="#4f46e5" status={{ color: '#16a34a', live: true }} />
			<Avatar name="Grace Hopper" color="#16a34a" status={{ color: '#9ca3af' }} />
		</div>
	)
}

export function Sizes() {
	return (
		<div class="flex items-end gap-3">
			<Avatar name="Ada Lovelace" color="#4f46e5" size={24} />
			<Avatar name="Ada Lovelace" color="#4f46e5" size={36} />
			<Avatar name="Ada Lovelace" color="#4f46e5" size={56} />
		</div>
	)
}
