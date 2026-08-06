/** @jsxImportSource @solidjs/web */
import { Rule } from '@aicolab/ui-solid'

export function Plain() {
	return (
		<div style={{ width: '18rem' }}>
			<Rule />
		</div>
	)
}

export function Labelled() {
	return (
		<div style={{ width: '18rem' }}>
			<Rule label="earlier today" />
		</div>
	)
}
