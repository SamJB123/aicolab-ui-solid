/** @jsxImportSource @solidjs/web */
import { AvatarStack } from '@aicolab/ui-solid'

const PEOPLE = [
	{ name: 'Ada Lovelace', color: '#4f46e5' },
	{ name: 'Grace Hopper', color: '#16a34a' },
	{ name: 'Alan Turing', color: '#d97706' },
	{ name: 'Katherine Johnson', color: '#dc2626' },
	{ name: 'Edsger Dijkstra', color: '#0891b2' },
	{ name: 'Barbara Liskov', color: '#7c3aed' },
	{ name: 'Donald Knuth', color: '#65a30d' },
]

export function Overflow() {
	return <AvatarStack people={PEOPLE} max={5} />
}

export function Small() {
	return <AvatarStack people={PEOPLE.slice(0, 3)} size={24} />
}

export function OnPanel() {
	return (
		<div
			style={{
				'border-radius': '16px',
				background: 'var(--color-base-100)',
				padding: '16px',
				'box-shadow': '0 0 0 1px var(--color-border)',
			}}
		>
			<AvatarStack people={PEOPLE.slice(0, 4)} ring="var(--color-base-100)" />
		</div>
	)
}
