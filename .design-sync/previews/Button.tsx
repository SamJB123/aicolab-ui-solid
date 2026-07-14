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
		<div class="flex items-center gap-3">
			<Button variant="primary">Publish changes</Button>
			<Button>Discard</Button>
		</div>
	)
}
