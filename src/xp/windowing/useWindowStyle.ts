import type { WindowViewState } from "./types";
import { iife } from "../misc";
import type { StyleValue } from "../style";

type StyleObject = Record<string, StyleValue>;

interface UseWindowStyleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  viewState: WindowViewState;
  style?: StyleObject;
  isDragging?: boolean;
  isResizing?: boolean;
}

// Returns a camelCase style object; the caller hands it to a component/element
// whose `style` runs through `s()` (numbers get `px`, keys get kebab-cased).
// No memo needed — it's invoked inside a reactive style binding.
export function useWindowStyle({
  x,
  y,
  width,
  height,
  viewState,
  style,
  isDragging = false,
  isResizing = false,
}: UseWindowStyleProps): StyleObject {
  const isMaximized = viewState.kind === "maximized";
  const baseStyle: StyleObject = {
    position: "absolute",
    // Maximized: pin all four edges to the desktop and let the layout engine
    // derive width/height — the bottom edge stops at the taskbar via the
    // --xp-taskbar-height inset, so no viewport measuring or height
    // subtraction is involved (the window can never slide under the taskbar).
    left: isMaximized ? 0 : x,
    top: isMaximized ? 0 : y,
    ...(isMaximized
      ? { right: 0, bottom: "var(--xp-taskbar-height, 0px)" }
      : { width, height }),
    zIndex: iife(() => {
      // Maximized stacks like open (`?? 0` tolerates rows persisted before
      // maximized carried a viewStackOrder).
      if (viewState.kind === "open" || viewState.kind === "maximized")
        return 1000 + (viewState.viewStackOrder ?? 0);
      return undefined;
    }),
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    ...(isDragging || isResizing
      ? {}
      : {
          transition: "all 0.2s ease-in-out, opacity 0.3s ease-in-out",
        }),
    ...(style || {}),
  };

  if (viewState.kind === "minimized") {
    baseStyle.transform = "scale(0)";
    baseStyle.opacity = 0;
    baseStyle.pointerEvents = "none";
  }

  baseStyle.filter = iife(() => {
    if (viewState.kind === "open" && viewState.isActive) return true;
    if (viewState.kind === "maximized") return true;
    return false;
  })
    ? "none"
    : "grayscale(100%)";

  return baseStyle;
}
