import { createExternalSignal } from '@aicolab/solid'
import type { Accessor } from 'solid-js'

/** Semantic update source installed with the editor's initial extension union. */
export interface EditorUpdateSource {
	notify(): void
	subscribe(listener: () => void): () => void
}

export function createEditorUpdateSource(): EditorUpdateSource {
	const listeners = new Set<() => void>()
	return {
		notify() {
			for (const listener of [...listeners]) listener()
		},
		subscribe(listener) {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
	}
}

/** Solid 2 external-store bridge for values derived from a ProseKit editor. */
export function createEditorDerivedSignal<T>(options: {
	updates: EditorUpdateSource
	initial: T
	derive(): T
}): Accessor<T> {
	return createExternalSignal({
		ssr: options.initial,
		snapshot: options.derive,
		subscribe: (notify) => options.updates.subscribe(notify),
	})
}
