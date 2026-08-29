/** @jsxImportSource @solidjs/web */
import type { JSX } from '@solidjs/web'
import { createSignal, For, omit, Show } from 'solid-js'
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

function findNode(nodes: TreeEditorNode[], id: string): TreeEditorNode | undefined {
	for (const node of nodes) {
		if (node.id === id) return node
		const child = findNode(node.children ?? [], id)
		if (child) return child
	}
}

function findDepth(nodes: TreeEditorNode[], id: string, depth = 0): number | undefined {
	for (const node of nodes) {
		if (node.id === id) return depth
		const childDepth = findDepth(node.children ?? [], id, depth + 1)
		if (childDepth !== undefined) return childDepth
	}
}

function findParentId(nodes: TreeEditorNode[], id: string, parentId?: string): string | undefined {
	for (const node of nodes) {
		if (node.id === id) return parentId
		const parent = findParentId(node.children ?? [], id, node.id)
		if (parent !== undefined) return parent
	}
}

function containsNode(node: TreeEditorNode, id: string): boolean {
	return node.id === id || (node.children ?? []).some((child) => containsNode(child, id))
}

function subtreeDepth(node: TreeEditorNode): number {
	return node.children?.length ? 1 + Math.max(...node.children.map(subtreeDepth)) : 0
}

function extractNode(nodes: TreeEditorNode[], id: string): { nodes: TreeEditorNode[]; node?: TreeEditorNode } {
	let extracted: TreeEditorNode | undefined
	const next = nodes.flatMap((node) => {
		if (node.id === id) {
			extracted = node
			return []
		}
		const result = extractNode(node.children ?? [], id)
		if (!result.node) return [node]
		extracted = result.node
		return [{ ...node, children: result.nodes }]
	})
	return { nodes: next, node: extracted }
}

function appendNode(nodes: TreeEditorNode[], parentId: string | undefined, child: TreeEditorNode): TreeEditorNode[] {
	if (parentId === undefined) return [...nodes, child]
	return nodes.map((node) =>
		node.id === parentId
			? { ...node, children: [...(node.children ?? []), child] }
			: { ...node, children: appendNode(node.children ?? [], parentId, child) },
	)
}

function insertAfter(nodes: TreeEditorNode[], siblingId: string, child: TreeEditorNode): TreeEditorNode[] {
	const index = nodes.findIndex((node) => node.id === siblingId)
	if (index >= 0) return [...nodes.slice(0, index + 1), child, ...nodes.slice(index + 1)]
	return nodes.map((node) => ({ ...node, children: insertAfter(node.children ?? [], siblingId, child) }))
}

function insertBefore(nodes: TreeEditorNode[], siblingId: string, child: TreeEditorNode): TreeEditorNode[] {
	const index = nodes.findIndex((node) => node.id === siblingId)
	if (index >= 0) return [...nodes.slice(0, index), child, ...nodes.slice(index)]
	return nodes.map((node) => ({ ...node, children: insertBefore(node.children ?? [], siblingId, child) }))
}

/**
 * A nested vocabulary editor: rename in place, add a child (down to the
 * level cap), remove, reorder, and move nodes between levels. Pointer users
 * can drag before, after, or into another node; the arrow controls provide
 * the equivalent keyboard-accessible operations. Controlled — emits the
 * whole tree on every change.
 */
export function TreeEditor(props: TreeEditorProps) {
	let root!: HTMLDivElement & { startViewTransition?: (update: () => void) => unknown }
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
	const [draggingId, setDraggingId] = createSignal<string>()
	const [dropTargetId, setDropTargetId] = createSignal<string | null>()
	const [dropPosition, setDropPosition] = createSignal<'before' | 'inside' | 'after'>()
	const changeStructure = (nodes: TreeEditorNode[]) => {
		const update = () => props.onChange(nodes)
		const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
		if (!reduceMotion && root.startViewTransition) root.startViewTransition(update)
		else update()
	}
	const addRoot = () => changeStructure([...props.nodes, { id: mint(), name: '' }])
	const canNest = (nodeId: string, parentId: string): boolean => {
		const node = findNode(props.nodes, nodeId)
		const parentDepth = findDepth(props.nodes, parentId)
		return !!node && parentDepth !== undefined && !containsNode(node, parentId) && parentDepth + 1 + subtreeDepth(node) < depthCap()
	}
	const canPlaceBeside = (nodeId: string, siblingId: string): boolean => {
		const node = findNode(props.nodes, nodeId)
		const siblingDepth = findDepth(props.nodes, siblingId)
		return !!node && siblingDepth !== undefined && !containsNode(node, siblingId) && siblingDepth + subtreeDepth(node) < depthCap()
	}
	const reparent = (nodeId: string, parentId?: string) => {
		const node = findNode(props.nodes, nodeId)
		if (!node || (parentId && !canNest(nodeId, parentId))) return
		const result = extractNode(props.nodes, nodeId)
		if (result.node) changeStructure(appendNode(result.nodes, parentId, result.node))
	}
	const placeBeside = (nodeId: string, siblingId: string, position: 'before' | 'after') => {
		if (!canPlaceBeside(nodeId, siblingId)) return
		const result = extractNode(props.nodes, nodeId)
		if (!result.node) return
		changeStructure(position === 'before' ? insertBefore(result.nodes, siblingId, result.node) : insertAfter(result.nodes, siblingId, result.node))
	}
	const outdent = (nodeId: string) => {
		const parentId = findParentId(props.nodes, nodeId)
		if (!parentId) return
		const result = extractNode(props.nodes, nodeId)
		if (result.node) changeStructure(insertAfter(result.nodes, parentId, result.node))
	}
	const finishDrag = () => {
		setDraggingId(undefined)
		setDropTargetId(undefined)
		setDropPosition(undefined)
	}

	const Branch = (branch: { nodes: TreeEditorNode[]; path: number[]; depth: number }) => (
		<ul class="ui-tree-list" data-depth={branch.depth}>
			<For each={branch.nodes}>
				{(node, index) => {
					const path = () => [...branch.path, index()]
					return (
						<li class="ui-tree-node" data-dragging={draggingId() === node.id ? '' : undefined} data-drop-position={dropTargetId() === node.id ? dropPosition() : undefined}>
							<div
								class="ui-tree-row"
								onDragOver={(event) => {
									const dragged = draggingId()
									if (!dragged || dragged === node.id) return
									const bounds = event.currentTarget.getBoundingClientRect()
									const fraction = (event.clientY - bounds.top) / bounds.height
									const position = fraction < 0.25 ? 'before' : fraction > 0.75 ? 'after' : 'inside'
									if (position === 'inside' ? !canNest(dragged, node.id) : !canPlaceBeside(dragged, node.id)) return
									event.preventDefault()
									event.dataTransfer!.dropEffect = 'move'
									setDropTargetId(node.id)
									setDropPosition(position)
								}}
								onDragLeave={(event) => {
									if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
										setDropTargetId(undefined)
										setDropPosition(undefined)
									}
								}}
								onDrop={(event) => {
									event.preventDefault()
									const dragged = draggingId()
									const position = dropPosition()
									if (dragged && position === 'inside') reparent(dragged, node.id)
									else if (dragged && (position === 'before' || position === 'after')) placeBeside(dragged, node.id, position)
									finishDrag()
								}}
							>
								<span
									class="ui-tree-drag-handle"
									draggable={props.disabled ? 'false' : 'true'}
									aria-hidden="true"
									title="Drag to reorder or change level"
									onDragStart={(event) => {
										setDraggingId(node.id)
										event.dataTransfer!.effectAllowed = 'move'
										event.dataTransfer!.setData('text/plain', node.id)
									}}
									onDragEnd={finishDrag}
								>
									⋮⋮
								</span>
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
									<IconButton size="sm" variant="ghost" label="Move out one level" disabled={props.disabled || branch.depth === 0} onClick={() => outdent(node.id)}>
										←
									</IconButton>
									<IconButton size="sm" variant="ghost" label="Move under previous item" disabled={props.disabled || index() === 0 || !canNest(node.id, branch.nodes[index() - 1]!.id)} onClick={() => reparent(node.id, branch.nodes[index() - 1]!.id)}>
										→
									</IconButton>
									<IconButton size="sm" variant="ghost" label="Move up" disabled={props.disabled || index() === 0} onClick={() => changeStructure(moveAt(props.nodes, path(), -1))}>
										↑
									</IconButton>
									<IconButton size="sm" variant="ghost" label="Move down" disabled={props.disabled || index() === branch.nodes.length - 1} onClick={() => changeStructure(moveAt(props.nodes, path(), 1))}>
										↓
									</IconButton>
									<Show when={branch.depth + 1 < depthCap()}>
										<IconButton size="sm" variant="ghost" label={`Add ${levelName(branch.depth + 1)} under ${node.name || 'this item'}`} disabled={props.disabled} onClick={() => changeStructure(updateAt(props.nodes, path(), (n) => ({ ...n, children: [...(n.children ?? []), { id: mint(), name: '' }] })))}>
											＋
										</IconButton>
									</Show>
									<IconButton size="sm" variant="ghost" colorBase="error" label={`Remove ${node.name || 'this item'}`} disabled={props.disabled} onClick={() => changeStructure(updateAt(props.nodes, path(), () => null))}>
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
			ref={root}
			{...attributes}
			{...colorTreatmentData(props)}
			{...knobs.attributes(props)}
			class={['ui-tree', props.class]}
			style={mergeKnobStyle(knobs.style(props), props.style)}
			role="group"
			aria-label={props.label}
		>
			<Branch nodes={props.nodes} path={[]} depth={0} />
			<button
				type="button"
				class="ui-tree-add"
				data-drop-target={dropTargetId() === null ? '' : undefined}
				disabled={props.disabled}
				onClick={addRoot}
				onDragOver={(event) => {
					if (!draggingId()) return
					event.preventDefault()
					event.dataTransfer!.dropEffect = 'move'
					setDropTargetId(null)
					setDropPosition('inside')
				}}
				onDrop={(event) => {
					event.preventDefault()
					const dragged = draggingId()
					if (dragged) reparent(dragged)
					finishDrag()
				}}
			>
				{draggingId() ? 'Move to top level' : (props.addLabel ?? `Add ${levelName(0)}`)}
			</button>
		</div>
	)
}
