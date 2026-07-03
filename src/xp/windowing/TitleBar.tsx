import { Show } from "solid-js";
import { WindowControls } from "./WindowControls";
import { s } from "../style";

interface TitleBarProps {
  title: string;
  icon?: string;
  draggable: boolean;
  handlePointerDown: (event: PointerEvent & { currentTarget: HTMLElement }) => void;
  onToggleMaximize?: () => void;
  showCloseButton?: boolean;
  showMaximizeButton?: boolean;
  showMinimiseButton?: boolean;
  isMaximized?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
}

export function TitleBar(props: TitleBarProps) {
  return (
    <div
      class="title-bar"
      style={s({
        userSelect: "none",
        cursor: props.draggable ? "move" : "default",
        // Touch drags must reach our pointermove handlers instead of being
        // claimed by the browser as a pan/zoom gesture.
        touchAction: "none",
      })}
      onPointerDown={props.handlePointerDown}
      onDblClick={() => props.onToggleMaximize?.()}
    >
      <div
        class="title-bar-text"
        style={s({
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          minWidth: 0,
        })}
      >
        <Show when={props.icon}>
          <img
            src={props.icon}
            alt=""
            style={s({ width: "16px", height: "16px", flexShrink: 0 })}
          />
        </Show>
        <span
          style={s({
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          })}
        >
          {props.title}
        </span>
      </div>
      <WindowControls
        showCloseButton={props.showCloseButton}
        showMaximizeButton={props.showMaximizeButton}
        showMinimiseButton={props.showMinimiseButton}
        isMaximized={props.isMaximized}
        onClose={props.onClose}
        onMinimize={props.onMinimize}
        onToggleMaximize={props.onToggleMaximize}
      />
    </div>
  );
}
