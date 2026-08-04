import { Dynamic, type JSX } from '@solidjs/web'
import type { Accessor, Component } from 'solid-js'
import { For } from 'solid-js'
import { createEditorDerivedSignal, type EditorUpdateSource } from './editor-state'

export interface ToolbarDefinition {
	id: string
	label: string
	title: string
	run(): void
	style?: JSX.CSSProperties
	class?: string
	component?: Component<ToolbarItemComponentProps>
}

export interface ToolbarItem extends ToolbarDefinition {
	active: boolean
	disabled: boolean
}

export interface ToolbarItemComponentProps {
	item: ToolbarItem
}

interface ElementViewTransitionHost {
	startViewTransition(update: () => void): unknown
}

function hasElementViewTransitions(
	element: Element,
): element is Element & ElementViewTransitionHost {
	return 'startViewTransition' in element && typeof element.startViewTransition === 'function'
}

function runToolbarCommand(event: MouseEvent, command: () => void): void {
	const editor =
		event.currentTarget instanceof Element ? event.currentTarget.closest('.aic-prosekit') : null
	if (editor && hasElementViewTransitions(editor)) {
		editor.startViewTransition(command)
		return
	}
	command()
}

export interface ToolbarContribution {
	definition: ToolbarDefinition
	/** Called only after the consumer confirms that ProseKit is mounted. */
	readMountedState(): Partial<Pick<ToolbarItem, 'active' | 'disabled'>>
}

export function defineToolbarContribution(
	definition: ToolbarDefinition,
	readMountedState: ToolbarContribution['readMountedState'] = () => ({}),
): ToolbarContribution {
	return { definition, readMountedState }
}

function deriveToolbar(
	contributions: readonly ToolbarContribution[],
	mounted: boolean,
): ToolbarItem[] {
	return contributions.map(({ definition, readMountedState }) => ({
		...definition,
		active: false,
		disabled: true,
		...(mounted ? readMountedState() : {}),
	}))
}

export interface EditorUi {
	toolbar: ToolbarItem[]
	canUndo: boolean
	canRedo: boolean
}

/** One definition and render path across SSR, hydration, and editor mount. */
export function createEditorUi(options: {
	updates: EditorUpdateSource
	toolbar: readonly ToolbarContribution[]
	isMounted(): boolean
	canUndo(): boolean
	canRedo(): boolean
}): Accessor<EditorUi> {
	const initial = {
		toolbar: deriveToolbar(options.toolbar, false),
		canUndo: false,
		canRedo: false,
	}
	return createEditorDerivedSignal({
		updates: options.updates,
		initial,
		derive: () =>
			options.isMounted()
				? {
						toolbar: deriveToolbar(options.toolbar, true),
						canUndo: options.canUndo(),
						canRedo: options.canRedo(),
					}
				: initial,
	})
}

export function ToolbarButton(props: ToolbarItemComponentProps) {
	return (
		<button
			type="button"
			class={`aic-prosekit-tool ${props.item.class ?? ''}`}
			style={props.item.style}
			data-state={props.item.active ? 'on' : 'off'}
			aria-pressed={props.item.active ? 'true' : 'false'}
			title={props.item.title}
			disabled={props.item.disabled}
			onMouseDown={(event) => event.preventDefault()}
			onClick={(event) => runToolbarCommand(event, props.item.run)}
		>
			<span aria-hidden="true">{props.item.label}</span>
			<span class="aic-prosekit-sr-only">{props.item.title}</span>
		</button>
	)
}

export function ToolbarControl(props: ToolbarItemComponentProps) {
	return <Dynamic component={props.item.component ?? ToolbarButton} item={props.item} />
}

export function EditorToolbar(props: {
	items: readonly ToolbarItem[]
	class?: string
	label?: string
	children?: JSX.Element
}) {
	return (
		<div
			class={`aic-prosekit-toolbar ${props.class ?? ''}`}
			role="toolbar"
			aria-label={props.label ?? 'Formatting'}
		>
			<div class="aic-prosekit-toolbar-track">
				<For each={props.items} keyed={(item) => item.id}>
					{(item) => <ToolbarControl item={item()} />}
				</For>
				{props.children}
			</div>
		</div>
	)
}
