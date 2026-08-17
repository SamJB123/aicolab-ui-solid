/** @jsxImportSource @solidjs/web */
// TEMPORARY hydration-bisect twin of the app-side M9 probe: identical code,
// compiled inside the package, to isolate compilation-context differences.
// Delete with the probe route.
import type { JSX } from '@solidjs/web'
import { children, Show } from 'solid-js'

export function M9UI(props: {
	title: JSX.Element
	leading?: JSX.Element
	description?: JSX.Element
	trailing?: JSX.Element
}) {
	const leading = children(() => props.leading)
	const description = children(() => props.description)
	const trailing = children(() => props.trailing)
	const content = () => (
		<>
			<Show when={leading()}>
				<span class="m9ui-leading">{leading()}</span>
			</Show>
			<span class="m9ui-main">
				<span class="m9ui-title">{props.title}</span>
				<Show when={description()}>
					<span class="m9ui-desc">{description()}</span>
				</Show>
			</span>
			<Show when={trailing()}>
				<span class="m9ui-trailing">{trailing()}</span>
			</Show>
		</>
	)
	return <span class="m9ui">{content()}</span>
}

/** M13: SPREAD-ONLY attributes (no static attrs) + call-hole children, in a
 *  nested Show fallback — the exact failing RichListItem static-row shape. */
export function M13UI(props: { title: JSX.Element; href?: string; onSelect?: () => void }) {
	const attrs = () => ({ class: 'm13-item' })
	const description = children(() => undefined)
	const content = () => (
		<>
			<span class="m13-main">
				<span class="m13-title">{props.title}</span>
				<Show when={description()}>
					<span class="m13-desc">{description()}</span>
				</Show>
			</span>
		</>
	)
	return (
		<li class="m13-entry">
			<Show
				when={props.href}
				fallback={
					<Show when={props.onSelect} fallback={<div {...attrs()}>{content()}</div>}>
						<button type="button">{content()}</button>
					</Show>
				}
			>
				<a href="/">{content()}</a>
			</Show>
		</li>
	)
}

/** M14: as M13 but a STATIC attribute precedes the spread. */
export function M14UI(props: { title: JSX.Element; href?: string }) {
	const attrs = () => ({ 'data-x': 'y' })
	const description = children(() => undefined)
	const content = () => (
		<>
			<span class="m14-main">
				<span class="m14-title">{props.title}</span>
				<Show when={description()}>
					<span class="m14-desc">{description()}</span>
				</Show>
			</span>
		</>
	)
	return (
		<li class="m14-entry">
			<Show when={props.href} fallback={<div class="m14-item" {...attrs()}>{content()}</div>}>
				<a href="/">{content()}</a>
			</Show>
		</li>
	)
}

/** M15: spread-only + call-hole content WITHOUT the inner Show, single fallback. */
export function M15UI(props: { title: JSX.Element; href?: string }) {
	const attrs = () => ({ class: 'm15-item' })
	const content = () => (
		<>
			<span class="m15-main">
				<span class="m15-title">{props.title}</span>
			</span>
		</>
	)
	return (
		<li class="m15-entry">
			<Show when={props.href} fallback={<div {...attrs()}>{content()}</div>}>
				<a href="/">{content()}</a>
			</Show>
		</li>
	)
}

/** M16: spread FIRST, dynamic class AFTER (the Chip/SelectControl shape),
 *  dynamic children, in a Show fallback. */
export function M16UI(props: { title: JSX.Element; href?: string }) {
	const attrs = () => ({ 'data-x': 'y' })
	return (
		<li class="m16-entry">
			<Show
				when={props.href}
				fallback={
					<div {...attrs()} class={['m16-item', undefined]}>
						<span class="m16-main">{props.title}</span>
					</div>
				}
			>
				<a href="/">never</a>
			</Show>
		</li>
	)
}

/** M17: spread FIRST, dynamic class AFTER, CALL-HOLE children, in a Show
 *  fallback — decides whether the class-after component family is safe. */
export function M17UI(props: { title: JSX.Element; href?: string }) {
	const attrs = () => ({ 'data-x': 'y' })
	const content = () => (
		<>
			<span class="m17-main">{props.title}</span>
		</>
	)
	return (
		<li class="m17-entry">
			<Show
				when={props.href}
				fallback={
					<div {...attrs()} class={['m17-item', undefined]}>
						{content()}
					</div>
				}
			>
				<a href="/">never</a>
			</Show>
		</li>
	)
}

/** M12: the real RichListItem branch shape — nested CALLBACK-child Shows over
 *  absent props, content in the double fallback. */
export function M12UI(props: {
	title: JSX.Element
	href?: string
	onSelect?: () => void
}) {
	const description = children(() => undefined)
	const content = () => (
		<>
			<span class="m12-main">
				<span class="m12-title">{props.title}</span>
				<Show when={description()}>
					<span class="m12-desc">{description()}</span>
				</Show>
			</span>
		</>
	)
	return (
		<li class="m12-entry">
			<Show
				when={props.href}
				fallback={
					<Show when={props.onSelect} fallback={<div class="m12-item">{content()}</div>}>
						{(onSelect) => (
							<button type="button" class="m12-item" onClick={() => onSelect()()}>
								{content()}
							</button>
						)}
					</Show>
				}
			>
				{(href) => (
					<a class="m12-item" href={href()}>
						{content()}
					</a>
				)}
			</Show>
		</li>
	)
}
