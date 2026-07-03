import { createContext, useContext } from "solid-js";
import type { WindowGeometry, WindowViewState } from "./types";
import type { StyleValue } from "../style";

type StyleObject = Record<string, StyleValue>;

// The capability surface a window's CONTENT gets from the shell hosting it —
// the contract between "an app" and "the window manager", adapted from the
// reference app's (scaffolded but never wired) WindowContext.
//
// The package owns only the CONTRACT + hook, so app windows can be written
// against `useWindowHandle()` without importing the host's state layer. The
// host (hub's ConnectedWindow) constructs the handle from its window/process
// store and provides it around the window body.
//
// Design notes:
// - Reads are reactive accessors; mutations go through the host's ops so
//   they hit the same persistence/z-order logic as chrome interactions.
// - `updateProps` persists app-specific state onto the process row — apps
//   keep their own props durable without knowing about collections.
// - `launch` lets one app spawn another (file browser → preview) without a
//   direct dependency on the host's registry module.
// - For iframe-hosted apps the same interface can later be implemented as a
//   postMessage bridge, keeping one contract for native + embedded apps.
export interface WindowHandle {
  windowId: string;
  processId: string;
  appId: string;

  // Reactive reads
  title: () => string;
  isActive: () => boolean;
  viewState: () => WindowViewState;
  geometry: () => WindowGeometry;

  // Self-management (backed by the host's window-manager ops)
  setTitle: (title: string) => void;
  setIcon: (iconUrl: string | undefined) => void;
  close: () => void;
  minimize: () => void;
  toggleMaximize: () => void;
  focus: () => void;
  updateGeometry: (geometry: WindowGeometry) => void;
  center: () => void;

  // Chrome negotiation (per-app-state chrome: hide maximize for fixed
  // dialogs, disable resize during playback, ...)
  setChrome: (chrome: {
    showCloseButton?: boolean;
    showMaximizeButton?: boolean;
    showMinimiseButton?: boolean;
    resizable?: boolean;
    draggable?: boolean;
  }) => void;
  setBodyStyle: (style: StyleObject | undefined) => void;

  // App-facing platform hooks
  updateProps: (patch: Record<string, unknown>) => void;
  launch: (appId: string, props?: Record<string, unknown>) => void;
}

export const WindowHandleContext = createContext<WindowHandle>();

// Nullable variant for components that render both inside and outside windows.
export function useWindowHandleOptional(): WindowHandle | undefined {
  return useContext(WindowHandleContext);
}

export function useWindowHandle(): WindowHandle {
  const handle = useContext(WindowHandleContext);
  if (!handle) {
    throw new Error(
      "useWindowHandle must be used inside a hosted window (WindowHandleContext missing)",
    );
  }
  return handle;
}
