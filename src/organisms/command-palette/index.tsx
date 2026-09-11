/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { children, createMemo, createSignal, For, Show } from 'solid-js'
import { VisuallyHidden } from '../../atoms/visually-hidden'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps } from '../../shared/knobs'

/** Per-instance styling contracts (see shared/knobs.ts). The palette's
 * treated contexts retarget the family surfaces per the organisms rule:
 * the active row is a painted family pair, the kind label and input focus
 * seam are accents, the body stays the structural base surface. */
const triggerKnobs = defineKnobs('ui-cmdtrigger', {
	hoverBorder: '<color>',
})
const knobs = defineKnobs('ui-palette', {
	width: '<length>',
	topOffset: '<length>',
	radius: '<length-percentage>',
	listMaxHeight: '<length>',
	activeSurface: '<color>',
	activeInk: '<color>',
	kindInk: '<color>',
	detailInk: '<color>',
	focusSeam: '<color>',
})

export interface CommandPaletteItem {
	id: string
	label: string
	detail?: string
	/** Short, human-readable category such as “Place” or “Action”. */
	kind?: string
	/** Additional searchable language which is not rendered. */
	keywords?: readonly string[]
}

interface CommandPaletteGroup<T extends CommandPaletteItem> {
	label?: string
	items: T[]
}

const optionId = (paletteId: string, itemId: string): string =>
	`${paletteId}-option-${itemId.replace(/[^\w-]/g, '-')}`

/** Open a CommandPalette by id as a MODAL dialog: everything behind it is
 * inert (no clicks, no wheel reaching a canvas underneath), Escape and a
 * click on the backdrop close it. The palette moved from a light-dismiss
 * popover to `<dialog>.showModal()` on 2026-09-03 for exactly that: over a
 * live stage, a popover left the scene interactive and zooming under it. */
export function openCommandPalette(id: string): void {
	const dialog = document.getElementById(id)
	if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal()
}

/** A visually consistent trigger for opening a CommandPalette. Positioning
 * remains the containing workspace's job. */
export function CommandPaletteTrigger(props: {
	target: string
	label: string
	shortcut?: JSX.Element
	children?: JSX.Element
	class?: ClassProp
} & ColorTreatmentProps &
	KnobProps<typeof triggerKnobs.spec>) {
	// Single-eval slot resolution (children()) — element-JSX props are getters;
	// double evaluation breaks hydration claiming.
	const shortcut = children(() => props.shortcut)
	return (
		<button
			type="button"
			class={['ui-command-palette-trigger', props.class]}
			onClick={() => openCommandPalette(props.target)}
			aria-haspopup="dialog"
			aria-controls={props.target}
			aria-label={props.label}
			{...colorTreatmentData(props)}
			{...triggerKnobs.attributes(props)}
			style={mergeKnobStyle(triggerKnobs.style(props), undefined)}
		>
			<Show when={shortcut()}>
				<span class="ui-command-palette-trigger-shortcut" aria-hidden="true">
					{shortcut()}
				</span>
			</Show>
			<span class="ui-command-palette-trigger-label">{props.children}</span>
		</button>
	)
}

/** Lower is better; -1 means no match. Visible labels deliberately rank
 * above descriptions and hidden keywords. */
function scoreItem(item: CommandPaletteItem, query: string, recent: boolean): number {
	const label = item.label.toLowerCase()
	const detail = item.detail?.toLowerCase() ?? ''
	const keywords = item.keywords?.join(' ').toLowerCase() ?? ''
	const boost = recent ? -0.5 : 0
	if (label.startsWith(query)) return boost
	if (label.split(/\s+/).some((word) => word.startsWith(query))) return 1 + boost
	if (label.includes(query)) return 2 + boost
	if (detail.includes(query)) return 3 + boost
	if (keywords.includes(query)) return 4 + boost
	return -1
}

/**
 * A modal-dialog command palette implementing the WAI-ARIA
 * aria-activedescendant combobox pattern. The palette owns search,
 * keyboard navigation, focus, grouping and presentation; consumers own
 * the domain items and what selecting one means. Open it with
 * `openCommandPalette(id)` or a `CommandPaletteTrigger`; while open the
 * page behind is inert.
 */
export function CommandPalette<T extends CommandPaletteItem>(props: {
	id: string
	items: readonly T[]
	onSelect: (item: T) => void
	recentIds?: readonly string[]
	placeholder?: string
	inputLabel?: string
	listLabel?: string
	emptyMessage?: string
	recentLabel?: string
	allItemsLabel?: string
	/** Resolve live domain status without rebuilding the item collection. */
	getKind?: (item: T) => string | undefined
	class?: ClassProp
	ref?: (root: HTMLDialogElement, input: HTMLInputElement) => void
	onOpen?: () => void
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>) {
	const [query, setQuery] = createSignal('')
	const [active, setActive] = createSignal(0)
	let rootEl: HTMLDialogElement | undefined
	let inputEl: HTMLInputElement | undefined
	let listEl: HTMLDivElement | undefined

	const groups = createMemo((): CommandPaletteGroup<T>[] => {
		const normalizedQuery = query().trim().toLowerCase()
		const recentIds = props.recentIds ?? []
		if (!normalizedQuery) {
			const recent = recentIds
				.map((id) => props.items.find((item) => item.id === id))
				.filter((item): item is T => item !== undefined)
			const rest = props.items.filter((item) => !recentIds.includes(item.id))
			return recent.length
				? [
						{ label: props.recentLabel ?? 'Recent', items: recent },
						{ label: props.allItemsLabel ?? 'All', items: rest },
					]
				: [{ items: [...props.items] }]
		}

		const items = props.items
			.map((item) => ({ item, score: scoreItem(item, normalizedQuery, recentIds.includes(item.id)) }))
			.filter((entry) => entry.score >= 0)
			.sort((a, b) => a.score - b.score)
			.map((entry) => entry.item)
		return [{ items }]
	})

	const flat = createMemo(() => groups().flatMap((group) => group.items))

	const activeItem = (): T | undefined => flat()[active()]
	const activeId = createMemo(() => {
		const item = activeItem()
		return item ? optionId(props.id, item.id) : undefined
	})

	const select = (item: T): void => {
		rootEl?.close()
		props.onSelect(item)
	}

	const moveActive = (delta: number): void => {
		const count = flat().length
		if (!count) return
		const next = (active() + delta + count) % count
		setActive(next)
		const item = flat()[next]
		if (item) listEl?.querySelector(`#${optionId(props.id, item.id)}`)?.scrollIntoView({ block: 'nearest' })
	}

	const onKeyDown = (event: KeyboardEvent): void => {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				moveActive(1)
				break
			case 'ArrowUp':
				event.preventDefault()
				moveActive(-1)
				break
			case 'Home':
				event.preventDefault()
				setActive(0)
				break
			case 'End':
				event.preventDefault()
				setActive(Math.max(0, flat().length - 1))
				break
			case 'Enter': {
				event.preventDefault()
				const item = activeItem()
				if (item) select(item)
				break
			}
		}
	}

	const exposeRefs = (): void => {
		if (rootEl && inputEl) props.ref?.(rootEl, inputEl)
	}

	return (
		<dialog
			id={props.id}
			class={['ui-command-palette', props.class]}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			style={mergeKnobStyle(knobs.style(props), undefined)}
			ref={(element) => {
				rootEl = element
				exposeRefs()
			}}
			// A click that lands on the dialog element itself is a click on
			// its backdrop (the content fills the box): light dismiss.
			onClick={(event) => {
				if (event.target === rootEl) rootEl?.close()
			}}
			// Reset on close so the next open starts clean whichever way it
			// was opened; `toggle` (where the browser fires it for dialogs)
			// additionally focuses and announces the open.
			onClose={() => {
				setQuery('')
				setActive(0)
			}}
			onToggle={(event) => {
				if (event.newState !== 'open') return
				inputEl?.focus()
				props.onOpen?.()
			}}
		>
			<input
				ref={(element) => {
					inputEl = element
					exposeRefs()
				}}
				autofocus
				value={query()}
				onInput={(event) => {
					setQuery(event.currentTarget.value)
					setActive(0)
				}}
				onKeyDown={onKeyDown}
				placeholder={props.placeholder ?? 'Search…'}
				class="ui-command-palette-input"
				role="combobox"
				aria-label={props.inputLabel ?? 'Search commands'}
				aria-expanded="true"
				aria-controls={`${props.id}-list`}
				aria-activedescendant={activeId()}
				autocomplete="off"
				spellcheck={false}
			/>
			{/* A text-input combobox popup requires this listbox/group/option
			    relationship; native select cannot express filtered rich rows. */}
			<div
				id={`${props.id}-list`}
				class="ui-command-palette-list"
				role="listbox"
				aria-label={props.listLabel ?? 'Commands'}
				ref={(element) => {
					listEl = element
				}}
			>
				<For each={groups()}>
					{(group) => (
						<div role="group" aria-label={group.label}>
							<Show when={group.label}>
								{(label) => <span class="ui-command-palette-group">{label()}</span>}
							</Show>
							<For each={group.items}>
								{(item) => (
									<div
										id={optionId(props.id, item.id)}
										role="option"
										aria-selected={activeItem()?.id === item.id ? 'true' : 'false'}
										class="ui-command-palette-item"
										data-active={activeItem()?.id === item.id ? '' : undefined}
										onClick={() => select(item)}
										onMouseMove={() => setActive(flat().indexOf(item))}
									>
										<span class="ui-command-palette-label">{item.label}</span>
										<Show when={props.getKind?.(item) ?? item.kind}>
											{(kind) => <span class="ui-command-palette-kind">{kind()}</span>}
										</Show>
										<Show when={item.detail}>
											{(detail) => <span class="ui-command-palette-detail">{detail()}</span>}
										</Show>
									</div>
								)}
							</For>
						</div>
					)}
				</For>
				<Show when={!flat().length}>
					<p class="ui-command-palette-empty">{props.emptyMessage ?? 'No matching commands.'}</p>
				</Show>
			</div>
			<VisuallyHidden>
				<span role="status" aria-live="polite">
					{`${flat().length} ${flat().length === 1 ? 'result' : 'results'}`}
				</span>
			</VisuallyHidden>
		</dialog>
	)
}
