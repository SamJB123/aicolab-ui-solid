/**
 * Curated-order helpers for drag-arranged boards (ShelfBoard et al).
 *
 * Items carry a fractional `position` (REAL in storage); dropping between
 * two neighbours takes their midpoint, so a move writes ONE row. `null`
 * positions mean "unplaced" — hosts float those to the FRONT by recency
 * (the settled Board rule: new items land at the front until placed).
 */

/** The position for an item dropped between `prev` and `next` (either side
 *  null at the board's edges). Callers pass the PLACED neighbours' positions
 *  only — never null-position items. */
export function positionBetween(
	prev: number | null | undefined,
	next: number | null | undefined,
): number {
	const a = prev ?? null
	const b = next ?? null
	if (a !== null && b !== null) return (a + b) / 2
	if (a !== null) return a + 1
	if (b !== null) return b - 1
	return 0
}

/** Comparator for board order: pinned first, then placed items by position,
 *  then unplaced items newest-first. Hosts sort with this before rendering —
 *  DOM order IS board order. */
export function compareBoardItems(
	a: { pinned: boolean; position: number | null; createdAt: number },
	b: { pinned: boolean; position: number | null; createdAt: number },
): number {
	if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
	const aPos = a.position
	const bPos = b.position
	if (aPos !== null && bPos !== null) return aPos - bPos
	if (aPos === null && bPos === null) return b.createdAt - a.createdAt
	/* Unplaced floats to the front of its pin group. */
	return aPos === null ? -1 : 1
}
