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
  desktopRect: DOMRect | null;
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
  desktopRect,
  style,
  isDragging = false,
  isResizing = false,
}: UseWindowStyleProps): StyleObject {
  const baseStyle: StyleObject = {
    position: "absolute",
    left: viewState.kind === "maximized" ? 0 : x,
    top: viewState.kind === "maximized" ? 0 : y,
    width:
      viewState.kind === "maximized" && desktopRect ? desktopRect.width : width,
    height:
      viewState.kind === "maximized" && desktopRect
        ? desktopRect.height
        : height,
    zIndex: iife(() => {
      if (viewState.kind === "maximized") return 9999;
      if (viewState.kind === "open") return 1000 + viewState.viewStackOrder;
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
