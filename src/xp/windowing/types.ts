// Window-manager data shapes, re-homed as plain TS from the reference app's
// Convex validators (convex-os `convex/windows/schema.ts`). The state itself
// lives with the consumer (hub keeps it in TanStack DB collections); these are
// only the contracts the presentational window chrome renders from.

export type WindowViewState =
  | { kind: "open"; viewStackOrder: number; isActive: boolean }
  | { kind: "minimized" }
  | { kind: "maximized" };

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}
