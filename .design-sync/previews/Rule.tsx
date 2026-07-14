/** @jsxImportSource @solidjs/web */
import { Rule } from '@aicolab/ui-solid'

export function Plain() {
	return (
		<div class="w-72">
			<Rule />
		</div>
	)
}

export function Labelled() {
	return (
		<div class="w-72">
			<Rule label="earlier today" />
		</div>
	)
}
