/** @jsxImportSource @solidjs/web */
import { createMemo, createSignal, createUniqueId, For, Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

const safeId = (value: string): string => value.replace(/[^\w-]/g, '-')
const normalizeSearchText = (value: string): string =>
	value
		.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim()
		.toLocaleLowerCase()

/**
 * A searchable single-selection combobox. Consumers provide domain data and
 * its textual projections; the molecule owns filtering, focus, keyboard
 * navigation and the WAI-ARIA combobox/listbox relationship.
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
}) {
	const id = createUniqueId()
	const [query, setQuery] = createSignal('')
	const [open, setOpen] = createSignal(false)
	const [activeIndex, setActiveIndex] = createSignal(0)
	let root: HTMLDivElement | undefined
	let input: HTMLInputElement | undefined
	let list: HTMLDivElement | undefined

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
		input?.focus()
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
			<input
				ref={(element) => {
					input = element
				}}
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
			/>
			<Show when={open()}>
				<div
					id={`${id}-listbox`}
					class="ui-combobox-listbox"
					role="listbox"
					aria-label={`${props.label} results`}
					ref={(element) => {
						list = element
					}}
				>
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
				</div>
			</Show>
		</div>
	)
}
