import { For, Show } from "solid-js";
import type { StartMenuItemData } from "./types";
import { StartMenuItem } from "./StartMenuItem";
import { s } from "../style";

interface StartMenuRightColumnProps {
  items: StartMenuItemData[];
  onItemClick: (item: StartMenuItemData) => void;
}

export function StartMenuRightColumn(props: StartMenuRightColumnProps) {
  return (
    <div
      style={s({
        width: "190px",
        background: "var(--xp-startmenu-right-gradient)",
        padding: "1px 0",
        overflow: "hidden",
      })}
    >
      <For each={props.items}>
        {(item) => (
          <div>
            <Show when={item.separatorBefore}>
              <div
                style={s({
                  height: "1px",
                  background: "var(--xp-startmenu-right-separator)",
                  margin: "3px 8px",
                })}
              />
            </Show>
            <StartMenuItem
              item={item}
              onItemClick={props.onItemClick}
              background="transparent"
            />
          </div>
        )}
      </For>
    </div>
  );
}
