import { createContext, useContext } from "solid-js";

// Keyed by the consumer's process/window id (an opaque string here — the
// reference app used Convex Ids; hub uses collection row ids).
type TaskbarButtonRefs = Map<string, HTMLElement | null>;

export interface DesktopContextValue {
  // Reactive accessor for the desktop bounds.
  desktopRect: () => DOMRect | null;
  taskbarButtonRefs: { current: TaskbarButtonRefs };
}

export const DesktopContext = createContext<DesktopContextValue>();

export function useDesktop(): DesktopContextValue {
  const ctx = useContext(DesktopContext);
  if (!ctx) {
    throw new Error("useDesktop must be used inside <Desktop> (DesktopContext missing)");
  }
  return ctx;
}
