// DepthCard core — the representation-independent state ("common core,
// multiple representations"): a card's state lives here so any number of
// representation components can share one instance via the `core` prop.
// Today there is one representation (the CSS card in dom.tsx); a future
// alternative (e.g. a 3D card) would be its own component chosen at the
// call site, taking the same core.

import { createSignal } from 'solid-js'

export class DepthCardCore {
	readonly flipped: () => boolean
	private readonly setFlipped: (v: boolean) => void

	constructor() {
		const [flipped, setFlipped] = createSignal(false)
		this.flipped = flipped
		this.setFlipped = setFlipped
	}

	flip(): void {
		this.setFlipped(!this.flipped())
	}
}
