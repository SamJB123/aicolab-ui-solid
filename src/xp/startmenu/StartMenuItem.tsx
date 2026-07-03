import { createSignal, Show } from "solid-js";
import type { StartMenuItemData } from "./types";
import { s } from "../style";

interface StartMenuItemProps {
  item: StartMenuItemData;
  onItemClick: (item: StartMenuItemData) => void;
  background?: string;
  hoverBackground?: string;
}

export function StartMenuItem(props: StartMenuItemProps) {
  const [isHovered, setIsHovered] = createSignal(false);
  const background = () => props.background ?? "transparent";
  const hoverBackground = () =>
    props.hoverBackground ?? "var(--xp-startmenu-hover)";

  return (
    <div
      style={s({
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: props.item.subtitle ? "2px 8px 1px 8px" : "3px 8px",
        cursor: props.item.disabled ? "not-allowed" : "pointer",
        minHeight: props.item.subtitle ? "30px" : "22px",
        fontSize: "11px",
        background: isHovered() ? hoverBackground() : background(),
        color: isHovered() ? "white" : "black",
      })}
      onClick={() => props.onItemClick(props.item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={props.item.icon}
        alt={props.item.label}
        style={s({
          width: props.item.subtitle ? "24px" : "16px",
          height: props.item.subtitle ? "24px" : "16px",
          flexShrink: 0,
        })}
      />
      <div style={s({ display: "flex", flexDirection: "column", flex: 1 })}>
        <span
          style={s({
            fontSize: "11px",
            fontWeight: props.item.subtitle ? "bold" : "normal",
            lineHeight: "1.2",
          })}
        >
          {props.item.label}
        </span>
        <Show when={props.item.subtitle}>
          <span
            style={s({
              fontSize: "10px",
              color: isHovered() ? "#E0E0E0" : "#666",
              lineHeight: "1.1",
            })}
          >
            {props.item.subtitle}
          </span>
        </Show>
      </div>
      <Show when={props.item.expanded}>
        <span
          style={s({ fontSize: "8px", color: isHovered() ? "#E0E0E0" : "#666" })}
        >
          ▶
        </span>
      </Show>
    </div>
  );
}
