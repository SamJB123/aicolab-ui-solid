import type { JSX } from "@solidjs/web";
import { Clock } from "./Clock";
import { s } from "../style";

// The notched tray at the taskbar's right edge. Children render as tray icons
// to the left of the clock.
export function SystemTray(props: { children?: JSX.Element }) {
  return (
    <div
      style={s({
        marginLeft: "auto",
        height: "38px",
        width: "fit-content",
        flexShrink: 0,
        color: "white",
        borderTop: "1px solid var(--xp-tray-border-top)",
        borderBottom: "1px solid var(--xp-tray-border-bottom)",
        borderRight: "1px solid transparent",
        borderLeft: "1px solid black",
        backgroundImage: "var(--xp-tray-gradient)",
        boxShadow: "2px 0px 3px var(--xp-tray-glow) inset",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "0px",
        paddingBottom: "0px",
        fontSize: "14px",
        gap: "4px",
      })}
    >
      {props.children}
      <Clock />
    </div>
  );
}
