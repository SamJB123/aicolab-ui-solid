// Window-manager data shapes, re-homed as plain TS from the reference app's
// Convex validators (convex-os `convex/windows/schema.ts`). The state itself
// lives with the consumer (hub keeps it in TanStack DB collections); these are
// only the contracts the presentational window chrome renders from.

export type WindowViewState =
  | { kind: "open"; viewStackOrder: number; isActive: boolean }
  // wasMaximized: real XP restores a minimized-while-maximized window back
  // to maximized, so the minimized state remembers where it came from.
  | { kind: "minimized"; wasMaximized?: boolean }
  // Maximized windows participate in the normal stacking order (unlike the
  // reference, which pinned them above everything at z 9999): focusing
  // another window brings it OVER a maximized one, like real XP. Rows
  // persisted before this change lack the two fields — consumers default
  // them (viewStackOrder ?? 0, isActive falsy).
  | { kind: "maximized"; viewStackOrder: number; isActive: boolean };

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}
