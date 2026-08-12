/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { For, Show } from 'solid-js'
import type { ClassProp } from '../../shared/color-treatment'

export interface BottomNavigationItem<Id extends string = string> {
	id: Id
	label: string
	icon: JSX.Element
}

export function BottomNavigation<Id extends string>(props: {
	label?: string
	items: readonly BottomNavigationItem<Id>[]
	activeId?: Id | null
	onSelect: (id: Id) => void
	/** Elevated action occupies the centre slot between the two item halves. */
	centre: JSX.Element
	trailing?: JSX.Element
	accessoryClass?: ClassProp
	class?: ClassProp
}) {
	const split = (): number => Math.ceil(props.items.length / 2)
	const renderItems = (items: readonly BottomNavigationItem<Id>[]) => (
		<For each={items}>
			{(item) => (
				<button
					type="button"
					class="ui-bottom-navigation-item"
					aria-label={item.label}
					data-active={props.activeId === item.id ? '' : undefined}
					onClick={() => props.onSelect(item.id)}
				>
					<span class="ui-bottom-navigation-item-icon">{item.icon}</span>
					<span class="ui-bottom-navigation-item-label">{item.label}</span>
				</button>
			)}
		</For>
	)

	return (
		<nav class={['ui-bottom-navigation', props.class]} aria-label={props.label ?? 'Main'}>
			{renderItems(props.items.slice(0, split()))}
			<span class="ui-bottom-navigation-centre-slot" aria-hidden="true" />
			<div class="ui-bottom-navigation-centre">{props.centre}</div>
			{renderItems(props.items.slice(split()))}
			<Show when={props.trailing}>
				{(trailing) => (
					<div class={['ui-bottom-navigation-accessory', props.accessoryClass]}>{trailing()}</div>
				)}
			</Show>
		</nav>
	)
}
