import { createSignal, onCleanup, Show } from "solid-js";
import { Button } from "../components/Button";
import { useDesktop } from "../windowing/DesktopContext";
import { s } from "../style";

// Presentational taskbar button for one running app. The reference version
// owned the focus/minimize/close mutations and its own context menu; the host
// now decides what click/middle-click/right-click do. The button still
// registers its element in the desktop's taskbarButtonRefs (keyed by `id`) so
// windows can animate minimize/restore toward it.
export interface TaskbarButtonProps {
  id: string;
  title: string;
  icon?: string;
  isActive: boolean;
  onClick: () => void;
  onMiddleClick?: () => void;
  onContextMenu?: (position: { x: number; y: number }) => void;
}

export function TaskbarButton(props: TaskbarButtonProps) {
  const { taskbarButtonRefs } = useDesktop();
  const [isHovered, setIsHovered] = createSignal(false);

  onCleanup(() => taskbarButtonRefs.current.delete(props.id));

  return (
    <Button
      ref={(element) => taskbarButtonRefs.current.set(props.id, element)}
      onClick={() => props.onClick()}
      onMouseDown={(e) => {
        if (e.button != 1) return;
        e.preventDefault();
        props.onMiddleClick?.();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        props.onContextMenu?.({ x: e.clientX, y: e.clientY });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        border: "1px solid rgba(0,0,0,0.4)",
        borderRadius: "4px",
        background: props.isActive
          ? isHovered()
            ? "var(--xp-taskbar-button-active-hover)"
            : "var(--xp-taskbar-button-active)"
          : isHovered()
            ? "var(--xp-taskbar-button-idle-hover)"
            : "var(--xp-taskbar-button-idle)",
        color: "white",
        boxShadow: props.isActive
          ? "inset 1px 1px 1px rgba(255,255,255,0.4)"
          : "1px 1px 2px rgba(0,0,0,0.4)",
        cursor: "pointer",
        flex: 1,
        minWidth: "80px",
        maxWidth: "200px",
        outline: "none",
        transition: "background 0.15s ease",
        overflow: "hidden",
      }}
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
          minWidth: 0,
        })}
      >
        {props.title}
      </span>
    </Button>
  );
}
