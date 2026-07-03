// Pure resize geometry — framework-agnostic. The Solid `Window` calls these
// from its resize mousemove handler (the React `useResizing` effect is folded
// into the component, gated via `createEventListener` on `isResizing`).

export type ResizeCorner =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "top"
  | "bottom"
  | "left"
  | "right";

export const MIN_WINDOW_WIDTH = 250;
export const MIN_WINDOW_HEIGHT = 250;

export interface ResizeOrigin {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  corner: ResizeCorner;
}

export interface Dimensions {
  newWidth: number;
  newHeight: number;
  newLeft: number;
  newTop: number;
}

export function calculateNewDimensions(
  origin: ResizeOrigin,
  deltaX: number,
  deltaY: number,
): Dimensions {
  let newWidth = origin.startWidth;
  let newHeight = origin.startHeight;
  let newLeft = origin.startLeft;
  let newTop = origin.startTop;

  if (origin.corner === "bottom-right") {
    newWidth = origin.startWidth + deltaX;
    newHeight = origin.startHeight + deltaY;
    return { newWidth, newHeight, newLeft, newTop };
  }

  if (origin.corner === "bottom-left") {
    newWidth = origin.startWidth - deltaX;
    newLeft = origin.startLeft + deltaX;
    newHeight = origin.startHeight + deltaY;
    return { newWidth, newHeight, newLeft, newTop };
  }

  if (origin.corner === "top-right") {
    newWidth = origin.startWidth + deltaX;
    newHeight = origin.startHeight - deltaY;
    newTop = origin.startTop + deltaY;
    return { newWidth, newHeight, newLeft, newTop };
  }

  if (origin.corner === "top-left") {
    newWidth = origin.startWidth - deltaX;
    newLeft = origin.startLeft + deltaX;
    newHeight = origin.startHeight - deltaY;
    newTop = origin.startTop + deltaY;
    return { newWidth, newHeight, newLeft, newTop };
  }

  if (origin.corner === "top") {
    newHeight = origin.startHeight - deltaY;
    newTop = origin.startTop + deltaY;
    return { newWidth, newHeight, newLeft, newTop };
  }

  if (origin.corner === "bottom") {
    newHeight = origin.startHeight + deltaY;
    return { newWidth, newHeight, newLeft, newTop };
  }

  if (origin.corner === "left") {
    newWidth = origin.startWidth - deltaX;
    newLeft = origin.startLeft + deltaX;
    return { newWidth, newHeight, newLeft, newTop };
  }

  if (origin.corner === "right") {
    newWidth = origin.startWidth + deltaX;
    return { newWidth, newHeight, newLeft, newTop };
  }

  return { newWidth, newHeight, newLeft, newTop };
}

export function applyDesktopBounds(
  dimensions: Dimensions,
  desktopRect: DOMRect,
): Dimensions {
  let { newWidth, newHeight, newLeft, newTop } = dimensions;

  if (newLeft < 0) {
    newWidth += newLeft;
    newLeft = 0;
  }
  if (newTop < 0) {
    newHeight += newTop;
    newTop = 0;
  }
  if (newLeft + newWidth > desktopRect.width)
    newWidth = desktopRect.width - newLeft;
  if (newTop + newHeight > desktopRect.height)
    newHeight = desktopRect.height - newTop;

  return { newWidth, newHeight, newLeft, newTop };
}

export function applyMinimumConstraints(
  dimensions: Dimensions,
  origin: ResizeOrigin,
): Dimensions {
  let { newWidth, newHeight, newLeft, newTop } = dimensions;

  if (newWidth < MIN_WINDOW_WIDTH) {
    if (
      origin.corner === "left" ||
      origin.corner === "top-left" ||
      origin.corner === "bottom-left"
    )
      newLeft = origin.startLeft + origin.startWidth - MIN_WINDOW_WIDTH;
    newWidth = MIN_WINDOW_WIDTH;
  }

  if (newHeight < MIN_WINDOW_HEIGHT) {
    if (
      origin.corner === "top" ||
      origin.corner === "top-left" ||
      origin.corner === "top-right"
    )
      newTop = origin.startTop + origin.startHeight - MIN_WINDOW_HEIGHT;
    newHeight = MIN_WINDOW_HEIGHT;
  }

  return { newWidth, newHeight, newLeft, newTop };
}

/**
 * Fit a requested window geometry to the desktop it will open on. Sizes are
 * capped to the available area (viewport minus a margin and any reserved
 * bottom strip, e.g. the taskbar) and positions are clamped so the window
 * opens fully on-screen — on a phone an 800x600 default becomes "as big as
 * fits", centered. Registry/default sizes stay aspirational; this is the
 * device-reality pass every launch path goes through.
 */
export const WINDOW_FIT_MARGIN = 8;

export function fitWindowToDesktop(
  requested: { width: number; height: number; x?: number; y?: number },
  desktop: { width: number; height: number } | null | undefined,
  options?: { reservedBottom?: number },
): { x: number; y: number; width: number; height: number } {
  if (!desktop) {
    return {
      width: requested.width,
      height: requested.height,
      x: requested.x ?? 60,
      y: requested.y ?? 40,
    };
  }
  const margin = WINDOW_FIT_MARGIN;
  const reserved = options?.reservedBottom ?? 0;
  const clamp = (value: number, lo: number, hi: number) =>
    Math.min(Math.max(value, lo), Math.max(lo, hi));

  const width = Math.min(requested.width, Math.max(120, desktop.width - margin * 2));
  const height = Math.min(
    requested.height,
    Math.max(120, desktop.height - reserved - margin * 2),
  );
  const x = clamp(
    requested.x ?? (desktop.width - width) / 2,
    margin,
    desktop.width - width - margin,
  );
  const y = clamp(
    requested.y ?? (desktop.height - reserved - height) / 2,
    margin,
    desktop.height - reserved - height - margin,
  );
  return { x, y, width, height };
}
