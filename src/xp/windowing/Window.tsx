import { createEffect, createSignal, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { TitleBar } from "./TitleBar";
import { ResizeHandles } from "./ResizeHandles";
import type { WindowViewState } from "./types";
import {
  applyDesktopBounds,
  applyMinimumConstraints,
  calculateNewDimensions,
  type ResizeCorner,
  type ResizeOrigin,
} from "./useResizing";
import { useWindowStyle } from "./useWindowStyle";
import { useDesktop } from "./DesktopContext";
import Box from "../components/Box";
import type { StyleValue } from "../style";

export type { ResizeCorner };

type StyleObject = Record<string, StyleValue>;

export interface WindowProps {
  title: string;
  icon?: string;
  children: JSX.Element;
  class?: string;
  style?: StyleObject;
  statusBar?: JSX.Element;
  bodyStyle?: StyleObject;
  draggable?: boolean;
  onClose?: () => void;
  showCloseButton?: boolean;
  resizable?: boolean;
  showMaximizeButton?: boolean;
  showMinimiseButton?: boolean;
  onFocus?: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  viewState: WindowViewState;
  getTaskbarButtonRect?: () => DOMRect | null | undefined;
  x: number;
  y: number;
  width: number;
  height: number;
  onGeometryChange?: (geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

export function Window(props: WindowProps) {
  let windowEl: HTMLDivElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false);
  const [isResizing, setIsResizing] = createSignal(false);
  const desktop = useDesktop();

  // Per-gesture mutable state (no reactivity — written straight to the DOM).
  let dragOffset = { x: 0, y: 0 };
  let dragCurrent = { x: props.x, y: props.y };
  let resizeOrigin: ResizeOrigin | null = null;
  let resizeCurrent = {
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height,
  };

  const draggable = () => props.draggable ?? true;
  const resizable = () => props.resizable ?? false;
  const isMaximized = () => props.viewState.kind === "maximized";

  // --- Drag: document listeners live only while dragging. Two-arg effect
  // tracks isDragging; the apply attaches the listeners and returns the cleanup
  // (Solid's `@solid-primitives/event-listener` is Solid-1 and crashes the
  // build — it imports removed `batch`/`onMount` — so we use plain DOM).
  // Pointer events (not mouse) so the same path serves touch; pointercancel
  // (browser reclaiming the gesture) commits like a release. ---
  createEffect(
    () => isDragging(),
    (dragging) => {
      if (!dragging) return;
      const onMove = (event: PointerEvent) => {
        if (!windowEl) return;
        dragCurrent = {
          x: event.clientX - dragOffset.x,
          y: event.clientY - dragOffset.y,
        };
        windowEl.style.left = `${dragCurrent.x}px`;
        windowEl.style.top = `${dragCurrent.y}px`;
      };
      const onUp = () => {
        setIsDragging(false);
        props.onGeometryChange?.({
          x: dragCurrent.x,
          y: dragCurrent.y,
          width: props.width,
          height: props.height,
        });
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
      return () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
      };
    },
  );

  // --- Resize: same pattern, with the geometry math from useResizing ---
  createEffect(
    () => isResizing(),
    (resizing) => {
      if (!resizing) return;
      const onMove = (event: PointerEvent) => {
        if (!resizeOrigin || !windowEl) return;
        const deltaX = event.clientX - resizeOrigin.startX;
        const deltaY = event.clientY - resizeOrigin.startY;

        let dims = calculateNewDimensions(resizeOrigin, deltaX, deltaY);
        dims = applyMinimumConstraints(dims, resizeOrigin);
        const desktopRect = desktop.desktopRect();
        if (desktopRect) dims = applyDesktopBounds(dims, desktopRect);

        resizeCurrent = {
          x: dims.newLeft,
          y: dims.newTop,
          width: dims.newWidth,
          height: dims.newHeight,
        };
        windowEl.style.width = `${dims.newWidth}px`;
        windowEl.style.height = `${dims.newHeight}px`;
        windowEl.style.left = `${dims.newLeft}px`;
        windowEl.style.top = `${dims.newTop}px`;
      };
      const onUp = () => {
        setIsResizing(false);
        resizeOrigin = null;
        props.onGeometryChange?.({
          x: resizeCurrent.x,
          y: resizeCurrent.y,
          width: resizeCurrent.width,
          height: resizeCurrent.height,
        });
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
      return () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
      };
    },
  );

  // Transform-origin so minimize/restore animates toward the taskbar button.
  createEffect(
    () => ({ x: props.x, y: props.y, getRect: props.getTaskbarButtonRect }),
    (v) => {
      if (!windowEl) return;
      let origin = "center bottom";
      const rect = v.getRect?.();
      if (rect) {
        const originX = rect.left - v.x + rect.width / 2;
        const originY = rect.top - v.y + rect.height / 2;
        origin = `${originX}px ${originY}px`;
      }
      windowEl.style.transformOrigin = origin;
    },
  );

  const onTitlePointerDown = (
    event: PointerEvent & { currentTarget: HTMLElement },
  ) => {
    props.onFocus?.();
    if (!draggable()) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    dragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    dragCurrent = { x: props.x, y: props.y };
    setIsDragging(true);
  };

  const startResize = (corner: ResizeCorner, event: PointerEvent) => {
    if (!resizable() || isMaximized()) return;
    event.preventDefault();
    event.stopPropagation();
    resizeOrigin = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: props.width,
      startHeight: props.height,
      startLeft: props.x,
      startTop: props.y,
      corner,
    };
    resizeCurrent = {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
    };
    setIsResizing(true);
  };

  return (
    <Box
      ref={(el) => (windowEl = el)}
      class={`window ${props.class ?? ""}`}
      style={useWindowStyle({
        x: props.x,
        y: props.y,
        width: props.width,
        height: props.height,
        viewState: props.viewState,
        desktopRect: desktop.desktopRect(),
        style: props.style,
        isDragging: isDragging(),
        isResizing: isResizing(),
      })}
      onPointerDown={() => props.onFocus?.()}
    >
      <TitleBar
        title={props.title}
        icon={props.icon}
        draggable={draggable()}
        handlePointerDown={onTitlePointerDown}
        onToggleMaximize={props.onToggleMaximize}
        showCloseButton={props.showCloseButton}
        showMaximizeButton={props.showMaximizeButton}
        showMinimiseButton={props.showMinimiseButton ?? true}
        isMaximized={isMaximized()}
        onClose={props.onClose}
        onMinimize={props.onMinimize}
      />
      <Box
        class="window-body"
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          pointerEvents: isResizing() || isDragging() ? "none" : "auto",
          ...(props.bodyStyle ?? {}),
        }}
      >
        {props.children}
      </Box>
      <Show when={props.statusBar}>
        <Box class="status-bar">{props.statusBar}</Box>
      </Show>
      <ResizeHandles
        startResize={startResize}
        resizable={resizable()}
        isMaximized={isMaximized()}
      />
    </Box>
  );
}
