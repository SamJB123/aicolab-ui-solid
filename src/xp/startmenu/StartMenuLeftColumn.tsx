import { For, Show } from "solid-js";
import type { StartMenuItemData } from "./types";
import { StartMenuItem } from "./StartMenuItem";
import { xpIconUrl } from "../icons";
import { s } from "../style";

interface StartMenuLeftColumnProps {
  items: StartMenuItemData[];
  onItemClick: (item: StartMenuItemData) => void;
  onAllProgramsClick: () => void;
}

export function StartMenuLeftColumn(props: StartMenuLeftColumnProps) {
  return (
    <div
      style={s({
        width: "195px",
        background: "white",
        borderRight: "1px solid var(--xp-startmenu-column-border)",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <div style={s({ flex: 1, padding: "1px 0", overflow: "hidden" })}>
        <For each={props.items}>
          {(item) => (
            <div>
              <Show when={item.separatorBefore}>
                <div
                  style={s({
                    height: "1px",
                    background: "var(--xp-startmenu-left-separator)",
                    margin: "3px 8px",
                  })}
                />
              </Show>
              <StartMenuItem item={item} onItemClick={props.onItemClick} />
            </div>
          )}
        </For>
      </div>

      {/* All Programs section */}
      <div
        style={s({
          borderTop: "1px solid var(--xp-startmenu-left-separator)",
          background: "white",
        })}
      >
        <div
          style={s({
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 8px",
            cursor: "not-allowed",
            fontSize: "11px",
            fontWeight: "bold",
          })}
          onClick={props.onAllProgramsClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--xp-startmenu-hover)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.color = "black";
          }}
        >
          <span>All Programs</span>
          <img
            src={xpIconUrl("all-programs.ico")}
            alt="All Programs"
            style={s({ width: "15px", height: "15px", marginLeft: "auto" })}
          />
        </div>
      </div>
    </div>
  );
}
