import { Show } from "solid-js";
import { s } from "../style";
import type { ResizeCorner } from "./useResizing";

const handleStyle = {
  position: "absolute",
  background: "transparent",
} as const;

const cornerHandleStyle = {
  ...handleStyle,
  width: "12px",
  height: "12px",
};

interface ResizeHandlesProps {
  startResize: (corner: ResizeCorner, event: MouseEvent) => void;
  resizable?: boolean;
  isMaximized?: boolean;
}

export function ResizeHandles(props: ResizeHandlesProps) {
  return (
    <Show when={props.resizable && !props.isMaximized}>
      {/* Edges */}
      <div
        onMouseDown={(event) => props.startResize("top", event)}
        style={s(handleStyle, {
          top: 0,
          left: "6px",
          right: "6px",
          height: "8px",
          cursor: "ns-resize",
        })}
      />
      <div
        onMouseDown={(event) => props.startResize("bottom", event)}
        style={s(handleStyle, {
          bottom: 0,
          left: "6px",
          right: "6px",
          height: "8px",
          cursor: "ns-resize",
        })}
      />
      <div
        onMouseDown={(event) => props.startResize("left", event)}
        style={s(handleStyle, {
          left: 0,
          top: "6px",
          bottom: "6px",
          width: "8px",
          cursor: "ew-resize",
        })}
      />
      <div
        onMouseDown={(event) => props.startResize("right", event)}
        style={s(handleStyle, {
          right: 0,
          top: "6px",
          bottom: "6px",
          width: "8px",
          cursor: "ew-resize",
        })}
      />
      {/* Corners */}
      <div
        onMouseDown={(event) => props.startResize("bottom-right", event)}
        style={s(cornerHandleStyle, {
          right: 0,
          bottom: 0,
          cursor: "nwse-resize",
        })}
      />
      <div
        onMouseDown={(event) => props.startResize("bottom-left", event)}
        style={s(cornerHandleStyle, {
          left: 0,
          bottom: 0,
          cursor: "nesw-resize",
        })}
      />
      <div
        onMouseDown={(event) => props.startResize("top-right", event)}
        style={s(cornerHandleStyle, { right: 0, top: 0, cursor: "nesw-resize" })}
      />
      <div
        onMouseDown={(event) => props.startResize("top-left", event)}
        style={s(cornerHandleStyle, { left: 0, top: 0, cursor: "nwse-resize" })}
      />
    </Show>
  );
}
