// View Transitions helper. Wraps a Solid state mutation so the browser captures
// before/after snapshots and tweens any elements carrying a `view-transition-name`
// between their old and new boxes. `flush()` drains Solid's queued updates
// synchronously inside the callback so the DOM is in its final state before the
// transition snapshots it. Degrades to a plain update where unsupported.

import { flush } from 'solid-js'

// Element-scoped view transitions (Chrome 147+) live on the element, not just
// `document`. The lib DOM types only declare it on Document, so we widen
// HTMLElement here (cast-free, via declaration merging). We also merge an
// object-form overload onto Document so we can pass view-transition `types`
// (Chrome 125+) without a cast.
declare global {
	interface Document {
		startViewTransition(options: { update: () => void; types?: string[] }): {
			finished: Promise<unknown>
		}
	}
	interface HTMLElement {
		startViewTransition?: (callback: () => void) => { finished: Promise<unknown> }
	}
}

// `:active-view-transition-type()` and the `types` option shipped together, so
// detecting the selector tells us whether passing types is meaningful. Where it
// isn't, we fall back to the plain callback form (which always runs the update).
const supportsViewTransitionTypes =
	typeof CSS !== 'undefined' &&
	typeof CSS.supports === 'function' &&
	CSS.supports('selector(:active-view-transition-type(x))')

function run(update: () => void): void {
	update()
	flush() // drain Solid's queued updates so the DOM is final before snapshotting
}

// Optional `types` drive `:active-view-transition-type()` so a single transition
// can branch its animation (e.g. forward vs back). Types are passed only where
// supported; otherwise we use the plain callback form, then no transition.
export function withViewTransition(update: () => void, types?: string[]): void {
	if (typeof document === 'undefined' || typeof document.startViewTransition !== 'function') {
		update()
		return
	}
	if (types && types.length > 0 && supportsViewTransitionTypes) {
		document.startViewTransition({ update: () => run(update), types })
		return
	}
	document.startViewTransition(() => run(update))
}

// Scope a transition to a subtree so it runs concurrently without disturbing
// the rest of the page. Falls back to a document-level transition (still
// animates any `view-transition-name`d elements), then to a plain update.
export function withScopedViewTransition(el: HTMLElement | undefined, update: () => void): void {
	if (el && typeof el.startViewTransition === 'function') {
		el.startViewTransition(() => run(update))
		return
	}
	withViewTransition(update)
}
