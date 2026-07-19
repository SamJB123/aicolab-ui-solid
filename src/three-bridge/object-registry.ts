// Self-maintaining id→Object3D index for O(1) lookup by `Object3D.id`.
//
// Engine infrastructure, not pick-specific: any system that resolves a
// GPU-side id back to a scene object (picking, selection, hover highlight,
// debug overlays) needs this. `scene.getObjectById` is an O(N) depth-first
// search of the whole graph (Object3D.getObjectByProperty) — fine once,
// but a per-frame resolve pays that O(N) every frame and scales with scene
// size. This keeps a `Map<id, Object3D>` instead: lookup is O(1); the only
// cost is a subtree traversal on structural change (rare vs per-frame).
//
// How it stays in sync (three's event model, verified against source):
//   - `add()`/`attach()`/`remove()` dispatch `childadded`/`childremoved`
//     ON THE PARENT, with `event.child` = the (un)added object.
//   - three's EventDispatcher does NOT bubble, and only the DIRECT child
//     fires — a subtree's existing descendants don't re-fire when their
//     root joins the scene.
// So a single root listener can't see nested or deep mutations. Instead we
// PROPAGATE: every tracked node carries the listeners, and each newly-added
// subtree is traversed once to (a) index every descendant and (b) wire its
// nodes for their own future mutations. Net: an add/remove anywhere in the
// tree is always heard by its parent, at any depth, with no knowledge of
// where objects are mounted — it just works as the graph grows.
//
// `Object3D.id` is a process-global monotonic counter (never reused), so
// map keys never collide and a stale entry can't resolve to a wrong object.

import type * as THREE from 'three/webgpu'

/** A childadded/childremoved event as three delivers it (the listener also
 *  receives `type`/`target`, but `child` is all we need). */
interface ChildEvent {
	child: THREE.Object3D
}

export interface ObjectRegistry {
	/** O(1) id→object. `null` if no live object currently has that id. */
	get: (id: number) => THREE.Object3D | null
	/** Index an ADDITIONAL root (and keep its subtree live) — e.g. a scene
	 *  that loads after install. Multi-world apps (the portals routes) index
	 *  every world's scene so a GPU id resolves no matter which world it
	 *  came from (post-traversal picks, pick-through-portal passthrough).
	 *  Idempotent: re-adding an indexed root is a no-op. */
	addRoot: (root: THREE.Object3D) => void
	/** Indexed object count (diagnostics / tests). */
	readonly size: number
	dispose: () => void
}

/**
 * Index `root` and everything under it, and keep the index live as the
 * subtree mutates. Further roots can join via `addRoot`. Call `dispose()`
 * to detach all listeners and clear the index (e.g. on scene teardown).
 */
export function installObjectRegistry(root: THREE.Object3D): ObjectRegistry {
	const byId = new Map<number, THREE.Object3D>()
	const roots = new Set<THREE.Object3D>()

	// Shared handler refs (not per-node closures) so every node registers
	// the SAME functions — cheap, and removable on untrack/dispose.
	const onChildAdded = (e: ChildEvent): void => track(e.child)
	const onChildRemoved = (e: ChildEvent): void => untrack(e.child)

	const track = (node: THREE.Object3D): void => {
		node.traverse((o) => {
			byId.set(o.id, o)
			// addEventListener de-dups (no-op if already present), so
			// re-tracking an overlapping subtree is safe.
			o.addEventListener('childadded', onChildAdded)
			o.addEventListener('childremoved', onChildRemoved)
		})
	}

	const untrack = (node: THREE.Object3D): void => {
		node.traverse((o) => {
			byId.delete(o.id)
			o.removeEventListener('childadded', onChildAdded)
			o.removeEventListener('childremoved', onChildRemoved)
		})
	}

	const addRoot = (r: THREE.Object3D): void => {
		if (roots.has(r)) return
		roots.add(r)
		track(r)
	}

	addRoot(root)

	return {
		get: (id) => byId.get(id) ?? null,
		addRoot,
		get size() {
			return byId.size
		},
		dispose: () => {
			for (const r of roots) untrack(r)
			roots.clear()
			byId.clear()
		},
	}
}
