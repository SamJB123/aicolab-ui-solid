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

export interface TreeEditorNode {
	id: string
	name: string
	children?: TreeEditorNode[]
}

/** Per-instance styling contract (see shared/knobs.ts). */
const knobs = defineKnobs('ui-tree', {
	gap: '<length>',
	indent: '<length>',
	radius: '<length-percentage>',
})

type TreeEditorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'onChange'> & {
	class?: ClassProp
	label: string
	nodes: TreeEditorNode[]
	onChange: (nodes: TreeEditorNode[]) => void
	/** Names for each depth (e.g. Tier 1 / Tier 2 / Tier 3); also caps depth. */
	levels?: string[]
	/** Depth cap when `levels` is not given (default 3). */
	maxDepth?: number
	/** Mint an id for a new node. */
	createId?: () => string
	addLabel?: string
	disabled?: boolean
} & ColorTreatmentProps &
	KnobProps<typeof knobs.spec>

const defaultId = () => `n-${Math.random().toString(36).slice(2, 10)}`

function updateAt(nodes: TreeEditorNode[], path: number[], fn: (node: TreeEditorNode) => TreeEditorNode | null): TreeEditorNode[] {
	const [head, ...rest] = path
	return nodes.flatMap((node, index) => {
		if (index !== head) return [node]
		if (rest.length === 0) {
			const next = fn(node)
			return next ? [next] : []
		}
		return [{ ...node, children: updateAt(node.children ?? [], rest, fn) }]
	})
}

function moveAt(nodes: TreeEditorNode[], path: number[], delta: number): TreeEditorNode[] {
	const [head, ...rest] = path
	if (head === undefined) return nodes
	if (rest.length === 0) {
		const target = head + delta
		if (target < 0 || target >= nodes.length) return nodes
		const next = [...nodes]
		const a = next[head]
		const b = next[target]
		if (a === undefined || b === undefined) return nodes
		next[head] = b
		next[target] = a
		return next
	}
	return nodes.map((node, index) => (index === head ? { ...node, children: moveAt(node.children ?? [], rest, delta) } : node))
}

/**
 * A nested vocabulary editor: rename in place, add a child (down to the
 * level cap), remove, and reorder among siblings. Controlled — emits the
 * whole tree on every change.
 */
export function TreeEditor(props: TreeEditorProps) {
	const attributes = omit(
		props,
		'class',
		'style',
		'label',
		'nodes',
		'onChange',
		'levels',
		'maxDepth',
		'createId',
		'addLabel',
		'disabled',
		'colorBase',
		'colorLevel',
		'variant',
		'gap',
		'indent',
		'radius',
	)
	const depthCap = () => props.levels?.length ?? props.maxDepth ?? 3
	const levelName = (depth: number) => props.levels?.[depth] ?? `Level ${depth + 1}`
	const mint = () => (props.createId ?? defaultId)()
	const addRoot = () => props.onChange([...props.nodes, { id: mint(), name: '' }])

	const Branch = (branch: { nodes: TreeEditorNode[]; path: number[]; depth: number }) => (
		<ul class="ui-tree-list" data-depth={branch.depth}>
			<For each={branch.nodes}>
				{(node, index) => {
					const path = () => [...branch.path, index()]
					return (
						<li class="ui-tree-node">
							<div class="ui-tree-row">
								<span class="ui-tree-level" aria-hidden="true">
									{levelName(branch.depth)}
								</span>
								<input
									class="ui-tree-input"
									value={node.name}
									placeholder={`${levelName(branch.depth)} name`}
									aria-label={`${levelName(branch.depth)} name`}
									disabled={props.disabled}
									onChange={(event) => props.onChange(updateAt(props.nodes, path(), (n) => ({ ...n, name: event.currentTarget.value })))}
								/>
								<span class="ui-tree-actions">
									<Show when={branch.depth + 1 < depthCap()}>
										<IconButton size="sm" variant="ghost" label={`Add ${levelName(branch.depth + 1)} under ${node.name || 'this item'}`} disabled={props.disabled} onClick={() => props.onChange(updateAt(props.nodes, path(), (n) => ({ ...n, children: [...(n.children ?? []), { id: mint(), name: '' }] })))}>
											＋
										</IconButton>
									</Show>
									<IconButton size="sm" variant="ghost" label="Move up" disabled={props.disabled || index() === 0} onClick={() => props.onChange(moveAt(props.nodes, path(), -1))}>
										↑
									</IconButton>
									<IconButton size="sm" variant="ghost" label="Move down" disabled={props.disabled || index() === branch.nodes.length - 1} onClick={() => props.onChange(moveAt(props.nodes, path(), 1))}>
										↓
									</IconButton>
									<IconButton size="sm" variant="ghost" colorBase="error" label={`Remove ${node.name || 'this item'}`} disabled={props.disabled} onClick={() => props.onChange(updateAt(props.nodes, path(), () => null))}>
										✕
									</IconButton>
								</span>
							</div>
							<Show when={node.children?.length}>
								<Branch nodes={node.children!} path={path()} depth={branch.depth + 1} />
							</Show>
						</li>
					)
				}}
			</For>
		</ul>
	)

	return (
		<div
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-tree', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			role="group"
			aria-label={props.label}
		>
			<Branch nodes={props.nodes} path={[]} depth={0} />
			<button type="button" class="ui-tree-add" disabled={props.disabled} onClick={addRoot}>
				{props.addLabel ?? `Add ${levelName(0)}`}
			</button>
		</div>
	)
}
