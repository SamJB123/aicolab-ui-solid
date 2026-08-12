const PALETTE_SIZE = 6

export const attributionColor = (index: number): string =>
	`var(--ui-attribution-${(index % PALETTE_SIZE) + 1})`

const stableIndex = (identity: string): number => {
	let hash = 0
	for (const character of identity) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
	return hash % PALETTE_SIZE
}

export const presenceColor = (identity: string): string =>
	`var(--ui-presence-${stableIndex(identity) + 1})`

export const presenceSelectionColor = (identity: string): string =>
	`color-mix(in oklab, ${presenceColor(identity)} 19%, transparent)`

export const createAttributionColor = (): ((identity: string) => string) => {
	const order = new Map<string, number>()
	return (identity) => {
		let index = order.get(identity)
		if (index === undefined) {
			index = order.size
			order.set(identity, index)
		}
		return attributionColor(index)
	}
}

export const resolvePresenceRole = (host: HTMLElement, color: string): string => {
	const probe = document.createElement('span')
	probe.style.color = color
	probe.hidden = true
	host.appendChild(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	if (!resolved) throw new Error(`Presence could not resolve ${color}`)
	return resolved
}

export const resolvePresenceColor = (host: HTMLElement, identity: string): string =>
	resolvePresenceRole(host, presenceColor(identity))

export const createResolvedAttributionColor = (host: HTMLElement): ((identity: string) => string) => {
	const colorFor = createAttributionColor()
	return (identity) => resolvePresenceRole(host, colorFor(identity))
}
