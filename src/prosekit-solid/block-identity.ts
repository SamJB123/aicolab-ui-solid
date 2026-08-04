import { defineNodeAttr, definePlugin, type Extension, union } from '@prosekit/core'
import type { Node as ProseMirrorNode } from '@prosekit/pm/model'
import { Plugin, PluginKey, type Transaction } from '@prosekit/pm/state'
import { Mapping } from '@prosekit/pm/transform'

export const BLOCK_ID_ATTR = 'blockId'
export const BLOCK_ID_DOM_ATTR = 'data-block-id'

export interface BlockIdentityOptions {
	/** ProseMirror node type names that should have stable block identity. */
	types: readonly string[]
	/** Injectable for tests or applications with an established ID service. */
	createId?: () => string
}

function createBlockId(): string {
	return `blk_${globalThis.crypto.randomUUID().replaceAll('-', '')}`
}

function readBlockId(node: ProseMirrorNode): string | null {
	const value: unknown = node.attrs[BLOCK_ID_ATTR]
	return typeof value === 'string' && /^blk_[A-Za-z0-9_-]+$/.test(value) ? value : null
}

interface IdentifiedBlock {
	pos: number
	id: string | null
	text: string
}

function identifiedBlocks(doc: ProseMirrorNode, types: ReadonlySet<string>): IdentifiedBlock[] {
	const blocks: IdentifiedBlock[] = []
	doc.descendants((node, pos) => {
		if (types.has(node.type.name)) {
			blocks.push({ pos, id: readBlockId(node), text: node.textContent })
		}
	})
	return blocks
}

function transactionMapping(transactions: readonly Transaction[]): Mapping {
	const mapping = new Mapping()
	for (const transaction of transactions) mapping.appendMapping(transaction.mapping)
	return mapping
}

function isPristineDefaultParagraph(doc: ProseMirrorNode): boolean {
	if (doc.childCount !== 1) return false
	const child = doc.firstChild
	return child?.type.name === 'paragraph' && child.content.size === 0 && readBlockId(child) === null
}

/**
 * Reconcile identity after arbitrary ProseMirror transactions.
 *
 * Old IDs are privileged at their mapped positions. This preserves identity
 * through node-type changes and moves, while copied/split duplicates receive
 * fresh IDs instead of stealing identity from the original block.
 */
function reconcileBlockIds(
	transactions: readonly Transaction[],
	oldDoc: ProseMirrorNode,
	newDoc: ProseMirrorNode,
	types: ReadonlySet<string>,
	makeId: () => string,
): Array<{ pos: number; id: string }> {
	const mapping = transactionMapping(transactions)
	const oldBlocks = identifiedBlocks(oldDoc, types)
	const oldIds = new Set(oldBlocks.flatMap((block) => (block.id ? [block.id] : [])))
	const preservedAt = new Map<number, Array<{ id: string; text: string; deleted: boolean }>>()
	for (const block of oldBlocks) {
		if (!block.id) continue
		const mapped = mapping.mapResult(block.pos, 1)
		const candidates = preservedAt.get(mapped.pos) ?? []
		candidates.push({ id: block.id, text: block.text, deleted: mapped.deleted })
		preservedAt.set(mapped.pos, candidates)
	}

	const used = new Set<string>()
	const patches: Array<{ pos: number; id: string }> = []
	for (const block of identifiedBlocks(newDoc, types)) {
		const preserved = preservedAt
			.get(block.pos)
			?.find(
				(candidate) =>
					!used.has(candidate.id) &&
					(block.id === null || block.id === candidate.id) &&
					(!candidate.deleted ||
						candidate.text === block.text ||
						candidate.text.startsWith(block.text) ||
						block.text.startsWith(candidate.text)),
			)
		let id: string
		if (preserved) id = preserved.id
		else if (block.id && !oldIds.has(block.id) && !used.has(block.id)) id = block.id
		else {
			do id = makeId()
			while (used.has(id) || oldIds.has(id))
		}
		used.add(id)
		if (block.id !== id) patches.push({ pos: block.pos, id })
	}
	return patches
}

/**
 * Add durable IDs to existing ProseKit block types without replacing their
 * specs or commands. HTML uses `data-block-id`, enabling typed `attr()` CSS.
 */
export function defineBlockIdentity(options: BlockIdentityOptions): Extension {
	const makeId = options.createId ?? createBlockId
	const types = new Set(options.types)
	const attrs = options.types.map((type) =>
		defineNodeAttr({
			type,
			attr: BLOCK_ID_ATTR,
			default: null,
			splittable: false,
			toDOM: (value: unknown) => (typeof value === 'string' ? [BLOCK_ID_DOM_ATTR, value] : null),
			parseDOM: (element) => element.getAttribute(BLOCK_ID_DOM_ATTR),
		}),
	)
	const key = new PluginKey('aic-prosekit-block-identity')
	const plugin = new Plugin({
		key,
		appendTransaction(transactions, oldState, newState) {
			if (transactions.some((transaction) => transaction.getMeta(key))) return null
			// ProseMirror materialises one empty paragraph as its schema-default
			// local view. It is not shared content yet: mutating it here would make
			// collaboration bindings publish a placeholder before hydration.
			if (isPristineDefaultParagraph(newState.doc)) return null
			const patches = reconcileBlockIds(transactions, oldState.doc, newState.doc, types, makeId)
			if (patches.length === 0) return null
			const transaction = newState.tr.setMeta(key, true)
			for (const patch of patches) {
				const node = transaction.doc.nodeAt(patch.pos)
				if (!node) continue
				transaction.setNodeMarkup(patch.pos, undefined, {
					...node.attrs,
					[BLOCK_ID_ATTR]: patch.id,
				})
			}
			return transaction.docChanged ? transaction : null
		},
	})

	return union(...attrs, definePlugin(plugin))
}
