/** @jsxImportSource @solidjs/web */
import { Button } from '@aicolab/ui-solid'

export function Primary() {
	return <Button variant="primary">Start session</Button>
}

export function Ghost() {
	return <Button>View archive</Button>
}

export function Pair() {
	return (
		<div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
			<Button variant="primary">Publish changes</Button>
			<Button>Discard</Button>
		</div>
	)
}
