import { onSettled } from 'solid-js'

/** Close a disclosure on outside mousedown / Escape. Call from component setup. */
export function dismissOnOutside(getRoot: () => HTMLElement | undefined, close: () => void): void {
	onSettled(() => {
		const onDoc = (e: MouseEvent) => {
			const root = getRoot()
			if (root && e.target instanceof Node && !root.contains(e.target)) close()
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close()
		}
		document.addEventListener('mousedown', onDoc)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDoc)
			document.removeEventListener('keydown', onKey)
		}
	})
}
