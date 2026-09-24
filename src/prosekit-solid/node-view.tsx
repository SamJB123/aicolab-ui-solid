import { defineNodeSpec, defineNodeView, union, type Extension } from '@prosekit/core'
import type { Node as ProseMirrorNode, NodeSpec } from '@prosekit/pm/model'
import type { EditorView, NodeView } from '@prosekit/pm/view'
import { render } from '@solidjs/web'
import { createComponent, createSignal, runWithOwner, type Component } from 'solid-js'

export type NodeViewDOMSpec = string | HTMLElement | ((node: ProseMirrorNode) => HTMLElement)

export interface SolidNodeViewProps<Attrs extends object = Record<string, unknown>> {
	node: ProseMirrorNode
	attrs: Attrs
	selected: boolean
	view: EditorView
	getPos(): number | undefined
	setAttrs(patch: Partial<Attrs>): void
	/** ProseMirror's element for the node's children (undefined for a node without
	 *  content). The component places it where the children belong — as a JSX child —
	 *  so nothing stands between the block's own element and the content. */
	content: HTMLElement | undefined
}

export interface SolidBlockOptions<Attrs extends object> {
	name: string
	attrs?: NodeSpec['attrs']
	readAttrs(node: ProseMirrorNode): Attrs
	content?: NodeSpec['content']
	atom?: boolean
	component: Component<SolidNodeViewProps<Attrs>>
	parseDOM?: NodeSpec['parseDOM']
	toDOM?: NodeSpec['toDOM']
	as?: NodeViewDOMSpec
	contentAs?: NodeViewDOMSpec
}

function createNodeViewElement(
	spec: NodeViewDOMSpec | undefined,
	node: ProseMirrorNode,
	fallback: string,
): HTMLElement {
	if (!spec) return document.createElement(fallback)
	if (typeof spec === 'string') return document.createElement(spec)
	if (typeof spec === 'function') return spec(node)
	return spec
}

export interface SolidNodeViewOptions<Attrs extends object> {
	/** The node type this view renders; its spec is defined elsewhere. */
	name: string
	readAttrs(node: ProseMirrorNode): Attrs
	/** Whether the node has content ProseMirror renders into the `content` element. */
	hasContent: boolean
	component: Component<SolidNodeViewProps<Attrs>>
	as?: NodeViewDOMSpec
	contentAs?: NodeViewDOMSpec
}

/** Define a ProseKit schema block and owned Solid 2 node view together. */
export function defineSolidBlock<Attrs extends object>(
	options: SolidBlockOptions<Attrs>,
): Extension {
	const hasContent = options.content !== undefined
	const spec = defineNodeSpec({
		name: options.name,
		group: 'block',
		attrs: options.attrs,
		content: options.content,
		atom: options.atom ?? !hasContent,
		parseDOM: options.parseDOM ?? [{ tag: `[data-solid-block="${options.name}"]` }],
		toDOM:
			options.toDOM ??
			(() => ['div', { 'data-solid-block': options.name }, ...(hasContent ? [0] : [])]),
	})
	return union(
		spec,
		defineSolidNodeView({
			name: options.name,
			readAttrs: options.readAttrs,
			hasContent,
			component: options.component,
			as: options.as,
			contentAs: options.contentAs,
		}),
	)
}

/** A Solid 2 node view for a node whose spec is defined elsewhere (a schema shared with
 *  a server that never renders): the view half of `defineSolidBlock` on its own. */
export function defineSolidNodeView<Attrs extends object>(
	options: SolidNodeViewOptions<Attrs>,
): Extension {
	const hasContent = options.hasContent
	return defineNodeView({
		name: options.name,
		// ProseMirror builds a node view whenever it updates the view — which can be
		// inside whatever Solid scope dispatched the transaction (an `onSettled` that binds
		// a collaborative doc, an effect). The view is ProseMirror's, not that scope's: it
		// is created detached, as its own root, and disposed only by `destroy`.
		constructor: (initialNode, view, getPos): NodeView => runWithOwner(null, () => constructNodeView(initialNode, view, getPos)),
	})

	function constructNodeView(
		initialNode: ProseMirrorNode,
		view: EditorView,
		getPos: () => number | undefined,
	): NodeView {
		const dom = createNodeViewElement(
			options.as,
			initialNode,
			initialNode.isInline ? 'span' : 'div',
		)
		dom.dataset.solidBlock = options.name
		const contentDOM = hasContent
			? createNodeViewElement(options.contentAs, initialNode, 'div')
			: undefined
		const [node, setNode] = createSignal(initialNode, { equals: false })
		const [selected, setSelected] = createSignal(false)

		const dispose = render(
			() =>
				createComponent(options.component, {
					get node() {
						return node()
					},
					get attrs() {
						return options.readAttrs(node())
					},
					get selected() {
						return selected()
					},
					view,
					getPos,
					setAttrs(patch: Partial<Attrs>) {
						const pos = getPos()
						if (pos === undefined) return
						const current = node()
						view.dispatch(
							view.state.tr.setNodeMarkup(pos, undefined, { ...current.attrs, ...patch }),
						)
					},
					content: contentDOM,
				}),
			dom,
		)

		return {
			dom,
			contentDOM,
			update(nextNode) {
				if (nextNode.type !== initialNode.type) return false
				setNode(nextNode)
				return true
			},
			selectNode: () => setSelected(true),
			deselectNode: () => setSelected(false),
			// Only what happens INSIDE the content element is the document's (typed text, a
			// child block); everything else in the view is the view's own — an attribute
			// Solid sets when a signal moves, a mark the page puts on the block — and must not
			// make ProseMirror re-parse the node, which would rebuild this view and lose it.
			// Without this, ProseMirror's default re-parses on any mutation once a view has
			// a content element.
			ignoreMutation(mutation) {
				if (mutation.type === 'selection') return false
				if (!contentDOM) return true
				const inContent =
					mutation.target === contentDOM
						? mutation.type === 'childList'
						: contentDOM.contains(mutation.target)
				return !inContent
			},
			stopEvent(event) {
				const target = event.target
				return (
					target instanceof HTMLElement &&
					(target.isContentEditable ||
						target.closest(
							'button, input, select, textarea, a[href], [popover], [data-prosekit-stop-events]',
						) !== null)
				)
			},
			destroy: dispose,
		}
	}
}
