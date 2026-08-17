/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createUniqueId, omit, Show } from 'solid-js'
import { IconButton } from '../../atoms/icon-button'
import {
	colorTreatmentData,
	type ClassProp,
	type ColorTreatmentProps,
} from '../../shared/color-treatment'
import { defineKnobs, mergeKnobStyle, type KnobProps, type UiLength } from '../../shared/knobs'

/** Per-instance styling contract (see shared/knobs.ts). The panel shell
 * itself (width, pad, radius, surface) is the shared `.ui-anchored` contract
 * — restyle it with `--ui-anchored-*`; `width` below is a convenience prop
 * that rides that wire. */
const knobs = defineKnobs('ui-menu', {
	pad: '<length>',
	itemPad: '<length>',
	itemRadius: '<length-percentage>',
	itemHoverSurface: '<color>',
})

/** What a custom trigger must wire up: point the popover at the menu and
 * carry the anchor so the panel positions off the trigger (the house rule:
 * anchor the TRIGGER). */
export interface MenuTriggerWiring {
	popoverTarget: string
	style: JSX.CSSProperties
}

type MenuProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class'> & {
	class?: ClassProp
	/** Accessible name for the menu (and the default trigger). */
	label: string
	/** Custom trigger slot; defaults to a "⋯" IconButton. Lazy. */
	trigger?: (wiring: MenuTriggerWiring) => JSX.Element
	/** Panel width — rides the shared `--ui-anchored-width` wire. */
	width?: UiLength
	children?: JSX.Element
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

/**
 * An anchored action menu on the house overlay standard: Popover API +
 * CSS anchor positioning with `position-try` flip (the `.ui-anchored`
 * shell), the trigger carrying the anchor. Light dismiss and Esc come from
 * `popover="auto"`; ArrowUp/Down/Home/End rove focus across the items.
 */
export function Menu(props: MenuProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'label',
		'trigger',
		'width',
		'colorBase',
		'colorLevel',
		'variant',
		'pad',
		'itemPad',
		'itemRadius',
		'itemHoverSurface',
	)
	const popId = `ui-menu-${createUniqueId()}`
	const anchor = `--ui-menu-${createUniqueId()}`
	const wiring: MenuTriggerWiring = {
		popoverTarget: popId,
		style: { 'anchor-name': anchor },
	}

	const items = (root: HTMLElement): HTMLElement[] =>
		[...root.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)')]

	const onKeyDown = (event: KeyboardEvent & { currentTarget: HTMLDivElement }): void => {
		const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
		if (!keys.includes(event.key)) return
		const list = items(event.currentTarget)
		if (list.length === 0) return
		event.preventDefault()
		const active = document.activeElement as HTMLElement | null
		const index = active ? list.indexOf(active) : -1
		const next =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? list.length - 1
					: event.key === 'ArrowDown'
						? (index + 1) % list.length
						: (index - 1 + list.length) % list.length
		list[next]?.focus()
	}

	return (
		<>
			<Show
				when={props.trigger}
				fallback={
					<IconButton
						label={props.label}
						popovertarget={popId}
						variant="ghost"
						colorBase={props.colorBase ?? 'neutral'}
						style={wiring.style}
					>
						⋯
					</IconButton>
				}
			>
				{(trigger) => trigger()(wiring)}
			</Show>
			<div
				{...attributes}
				{...colorTreatmentData(props)}
				{...knobs.attributes(props)}
				ref={(el) => {
					el.addEventListener('toggle', (event) => {
						if ('newState' in event && event.newState === 'open') {
							items(el)[0]?.focus()
						}
					})
				}}
				id={popId}
				popover="auto"
				role="menu"
				aria-label={props.label}
				class={['ui-anchored', 'ui-menu', props.class]}
				style={mergeKnobStyle(knobs.style(props), {
					'position-anchor': anchor,
					...(props.width ? { '--ui-anchored-width': props.width } : {}),
				})}
				onKeyDown={onKeyDown}
			>
				{props.children}
			</div>
		</>
	)
}

/** Per-item styling contract, dual-wired ON the item; each knob's default
 * chains through the Menu-level carrier (`--ui-menu-item-*`) — the
 * accordion-item "mode carrier between public knob and context default"
 * pattern, so the collection re-defaults and the item stays overridable. */
const itemKnobs = defineKnobs('ui-menuitem', {
	pad: '<length>',
	radius: '<length-percentage>',
	hoverSurface: '<color>',
})

type MenuItemProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'class'> & {
	class?: ClassProp
	onSelect?: () => void
	/** Destructive action styling (error family). */
	danger?: boolean
	/** Leading glyph slot. Lazy. */
	glyph?: () => JSX.Element
} & KnobProps<typeof itemKnobs.spec>

export function MenuItem(props: MenuItemProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'children',
		'onSelect',
		'danger',
		'glyph',
		'pad',
		'radius',
		'hoverSurface',
	)
	return (
		<button
			{...attributes}
			{...itemKnobs.attributes(props)}
			type="button"
			role="menuitem"
			tabindex={-1}
			class={['ui-menu-item', props.class]}
			style={mergeKnobStyle(itemKnobs.style(props), props.style)}
			data-danger={props.danger ? '' : undefined}
			onClick={(event) => {
				event.currentTarget.closest<HTMLElement & { hidePopover(): void }>('[popover]')?.hidePopover()
				props.onSelect?.()
			}}
		>
			<Show when={props.glyph}>
				{(glyph) => (
					<span class="ui-menu-item-glyph" aria-hidden="true">
						{glyph()()}
					</span>
				)}
			</Show>
			<span class="ui-menu-item-label">{props.children}</span>
		</button>
	)
}

/** Visual group divider between menu items. */
export function MenuSeparator() {
	return <hr class="ui-menu-separator" aria-orientation="horizontal" />
}
