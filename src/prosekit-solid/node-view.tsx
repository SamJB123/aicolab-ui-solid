import { defineNodeSpec, defineNodeView, union, type Extension } from '@prosekit/core'
import type { Node as ProseMirrorNode, NodeSpec } from '@prosekit/pm/model'
import type { EditorView, NodeView } from '@prosekit/pm/view'
import { render } from '@solidjs/web'
import { createComponent, createSignal, type Component } from 'solid-js'

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
		constructor(initialNode, view, getPos): NodeView {
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
		},
	})
}
