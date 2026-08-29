/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { For, omit, Show } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-list-editor', {
	gap: '<length>',
	radius: '<length-percentage>',
	pad: '<length>',
})

type ListEditorProps<T> = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'onChange'> & {
	class?: ClassProp
	label: string
	items: T[]
	onChange: (items: T[]) => void
	getKey: (item: T, index: number) => string
	/** Render one item's fields; call `update` with the replacement item. */
	renderItem: (item: T, update: (next: T) => void, index: number) => JSX.Element
	/** A fresh item for the add button; omit to hide adding. */
	createItem?: () => T
	addLabel?: string
	/** Show ↑↓ reorder controls (default true). */
	reorder?: boolean
	emptyMessage?: string
	disabled?: boolean
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * An ordered list of editable records: each row renders through `renderItem`,
 * with remove and reorder controls. Controlled — emits the whole list.
 */
export function ListEditor<T>(props: ListEditorProps<T>) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'items',
		'onChange',
		'getKey',
		'renderItem',
		'createItem',
		'addLabel',
		'reorder',
		'emptyMessage',
		'disabled',
		'colorBase',
		'colorLevel',
		'variant',
		'gap',
		'radius',
		'pad',
	)
	const replace = (index: number, next: T) => props.onChange(props.items.map((item, i) => (i === index ? next : item)))
	const remove = (index: number) => props.onChange(props.items.filter((_, i) => i !== index))
	const move = (index: number, delta: number) => {
		const target = index + delta
		if (target < 0 || target >= props.items.length) return
		const next = [...props.items]
		const a = next[index]
		const b = next[target]
		if (a === undefined || b === undefined) return
		next[index] = b
		next[target] = a
		props.onChange(next)
	}
	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-list-editor', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			role="group"
			aria-label={props.label}
		>
			<Show when={props.items.length === 0 && props.emptyMessage}>
				<p class="ui-list-editor-empty">{props.emptyMessage}</p>
			</Show>
			<ol class="ui-list-editor-list">
				<For each={props.items}>
					{(item, index) => (
						<li class="ui-list-editor-row">
							<div class="ui-list-editor-fields">{props.renderItem(item, (next) => replace(index(), next), index())}</div>
							<span class="ui-list-editor-actions">
								<Show when={props.reorder !== false}>
									<IconButton size="sm" variant="ghost" label="Move up" disabled={props.disabled || index() === 0} onClick={() => move(index(), -1)}>
										↑
									</IconButton>
									<IconButton size="sm" variant="ghost" label="Move down" disabled={props.disabled || index() === props.items.length - 1} onClick={() => move(index(), 1)}>
										↓
									</IconButton>
								</Show>
								<IconButton size="sm" variant="ghost" colorBase="error" label="Remove" disabled={props.disabled} onClick={() => remove(index())}>
									✕
								</IconButton>
							</span>
						</li>
					)}
				</For>
			</ol>
			<Show when={props.createItem}>
				<button type="button" class="ui-list-editor-add" disabled={props.disabled} onClick={() => props.onChange([...props.items, props.createItem!()])}>
					{props.addLabel ?? 'Add'}
				</button>
			</Show>
		</div>
	)
}
