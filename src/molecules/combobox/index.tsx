/** @jsxImportSource @solidjs/web */
import { createEffect, createMemo, createSignal, createUniqueId, For, Show } from 'solid-js'
import { TextInput, textInputKnobs } from '../../atoms/form-control'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

const safeId = (value: string): string => value.replace(/[^\w-]/g, '-')
const normalizeSearchText = (value: string): string =>
	value
		.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim()
		.toLocaleLowerCase()

/** Per-instance styling contract (see shared/knobs.ts), emitted on the pop.
 * The input side needs no contract of its own: the composed TextInput's
 * knobs are drilled straight through under their own names. */
const knobs = defineKnobs('ui-cb', {
	listMaxHeight: '<length>',
	gap: '<length>',
	optionRadius: '<length-percentage>',
	optionPadBlock: '<length>',
	optionPadInline: '<length>',
	activeSurface: '<color>',
	activeInk: '<color>',
	selectedSurface: '<color>',
	selectedInk: '<color>',
})

/**
 * A searchable single-selection combobox. Consumers provide domain data and
 * its textual projections; the molecule owns filtering, focus, keyboard
 * navigation and the WAI-ARIA combobox/listbox relationship. The field is a
 * composed TextInput; the results list is a top-layer `.ui-anchored` popover
 * anchored to it (manual, since the combobox owns open/close from focus and
 * typing), matching the input's width via anchor-size().
 */
export function Combobox<T>(props: {
	items: readonly T[]
	value?: string
	onChange: (value: string, item: T) => void
	getKey: (item: T) => string
	getLabel: (item: T) => string
	getDescription?: (item: T) => string | undefined
	getSearchText?: (item: T) => string
	label: string
	placeholder?: string
	emptyMessage?: string
	maxResults?: number
	disabled?: boolean
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec> &
	KnobProps<typeof textInputKnobs.spec>) {
	const id = createUniqueId()
	const anchor = `--cb-${createUniqueId()}`
	const [query, setQuery] = createSignal('')
	const [open, setOpen] = createSignal(false)
	const [activeIndex, setActiveIndex] = createSignal(0)
	let root: HTMLDivElement | undefined
	let list: HTMLDivElement | undefined
	const input = (): HTMLInputElement | null => root?.querySelector('input') ?? null

	const selectedItem = createMemo(() =>
		props.items.find((item) => props.getKey(item) === props.value),
	)
	const filteredItems = createMemo(() => {
		const terms = normalizeSearchText(query()).split(' ').filter(Boolean)
		const matches = terms.length
			? props.items.filter((item) =>
					terms.every((term) =>
						normalizeSearchText(
							props.getSearchText?.(item) ?? props.getLabel(item),
						).includes(term),
					),
				)
			: [...props.items]
		return matches.slice(0, props.maxResults ?? 100)
	})
	const activeItem = (): T | undefined => filteredItems()[activeIndex()]
	const optionId = (item: T): string => `${id}-option-${safeId(props.getKey(item))}`

	// The popover element is always mounted; open/close drives its top-layer
	// presence so @starting-style entry animation and anchor tracking apply.
	createEffect(open, (isOpen) => {
		const element = list
		if (!element) return
		if (isOpen) {
			if (!element.matches(':popover-open')) element.showPopover()
		} else if (element.matches(':popover-open')) {
			element.hidePopover()
		}
	})

	const revealActive = (index: number): void => {
		const count = filteredItems().length
		if (!count) return
		const next = (index + count) % count
		setActiveIndex(next)
		const item = filteredItems()[next]
		if (item) list?.querySelector(`#${optionId(item)}`)?.scrollIntoView({ block: 'nearest' })
	}

	const choose = (item: T): void => {
		setQuery(props.getLabel(item))
		setOpen(false)
		props.onChange(props.getKey(item), item)
		input()?.focus()
	}

	const onKeyDown = (event: KeyboardEvent): void => {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				if (!open()) setOpen(true)
				revealActive(activeIndex() + 1)
				break
			case 'ArrowUp':
				event.preventDefault()
				if (!open()) setOpen(true)
				revealActive(activeIndex() - 1)
				break
			case 'Enter': {
				if (!open()) return
				event.preventDefault()
				const item = activeItem()
				if (item) choose(item)
				break
			}
			case 'Escape':
				event.preventDefault()
				setOpen(false)
				setQuery(selectedItem() ? props.getLabel(selectedItem() as T) : '')
				break
		}
	}

	return (
		<div
			class={['ui-combobox', props.class]}
			data-open={open() ? '' : undefined}
			ref={(element) => {
				root = element
			}}
			onFocusOut={(event) => {
				if (!root?.contains(event.relatedTarget as Node | null)) setOpen(false)
			}}
		>
			<TextInput
				class="ui-combobox-input"
				type="search"
				role="combobox"
				aria-label={props.label}
				aria-expanded={open() ? 'true' : 'false'}
				aria-controls={`${id}-listbox`}
				aria-activedescendant={
					open() && activeItem() ? optionId(activeItem() as T) : undefined
				}
				aria-autocomplete="list"
				autocomplete="off"
				spellcheck={false}
				disabled={props.disabled}
				placeholder={props.placeholder ?? 'Search…'}
				value={open() ? query() : selectedItem() ? props.getLabel(selectedItem() as T) : query()}
				onFocus={() => {
					setQuery(selectedItem() ? props.getLabel(selectedItem() as T) : '')
					setActiveIndex(0)
					setOpen(true)
				}}
				onInput={(event) => {
					setQuery(event.currentTarget.value)
					setActiveIndex(0)
					setOpen(true)
				}}
				onKeyDown={onKeyDown}
				style={{ 'anchor-name': anchor }}
				colorBase={props.colorBase}
				colorLevel={props.colorLevel}
				variant={props.variant}
				radius={props.radius}
				minHeight={props.minHeight}
				padBlock={props.padBlock}
				padInline={props.padInline}
				hoverBorder={props.hoverBorder}
				focusBorder={props.focusBorder}
				focusRing={props.focusRing}
				placeholderInk={props.placeholderInk}
				selectionSurface={props.selectionSurface}
				selectionInk={props.selectionInk}
				caret={props.caret}
			/>
			<div
				id={`${id}-listbox`}
				popover="manual"
				class="ui-anchored ui-combobox-pop"
				role="listbox"
				aria-label={`${props.label} results`}
				ref={(element) => {
					list = element
				}}
				{...colorTreatmentData(props)}
				{...knobs.attributes(props)}
				style={mergeKnobStyle(knobs.style(props), { 'position-anchor': anchor })}
			>
				<Show when={open()}>
					<For each={filteredItems()}>
						{(item, index) => (
							<div
								id={optionId(item)}
								class="ui-combobox-option"
								role="option"
								aria-selected={props.getKey(item) === props.value ? 'true' : 'false'}
								data-active={index() === activeIndex() ? '' : undefined}
								onPointerDown={(event) => event.preventDefault()}
								onPointerMove={() => setActiveIndex(index())}
								onClick={() => choose(item)}
							>
								<span class="ui-combobox-option-label">{props.getLabel(item)}</span>
								<Show when={props.getDescription?.(item)}>
									{(description) => (
										<span class="ui-combobox-option-description">{description()}</span>
									)}
								</Show>
							</div>
						)}
					</For>
					<Show when={!filteredItems().length}>
						<p class="ui-combobox-empty">{props.emptyMessage ?? 'No matching results.'}</p>
					</Show>
				</Show>
			</div>
		</div>
	)
}
