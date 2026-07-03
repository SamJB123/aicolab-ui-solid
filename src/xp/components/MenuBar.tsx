import { createEffect, createSignal, For, Show } from "solid-js";
import { Button } from "./Button";
import { s } from "../style";

export type MenuItem = {
  label: string;
  onClick?: () => void;
  items?: MenuItem[];
};

export type MenuBarProps = {
  items: MenuItem[];
};

export function MenuBar(props: MenuBarProps) {
  const [openMenuIndex, setOpenMenuIndex] = createSignal<number | null>(null);
  let menuBarRef: HTMLDivElement | undefined;

  // Close the open menu on an outside click. Two-arg effect: track the open
  // index; (re)bind the listener and return its cleanup.
  createEffect(
    () => openMenuIndex(),
    (index) => {
      if (index === null) return;
      const handleClickOutside = (event: MouseEvent) => {
        if (menuBarRef && !menuBarRef.contains(event.target as Node))
          setOpenMenuIndex(null);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    },
  );

  return (
    <div
      ref={(el) => (menuBarRef = el)}
      style={s({
        display: "flex",
        backgroundColor: "#ECE9D8",
        borderBottom: "1px solid #919B9C",
        padding: "2px 0",
        position: "relative",
        userSelect: "none",
      })}
    >
      <For each={props.items}>
        {(item, index) => (
          <div style={s({ position: "relative" })}>
            <Button
              onClick={() =>
                setOpenMenuIndex(
                  openMenuIndex() === index() ? null : index(),
                )
              }
              style={s({
                padding: "4px 12px",
                border: "none",
                background:
                  openMenuIndex() === index() ? "#fff" : "transparent",
                cursor: "pointer",
                fontSize: "11px",
                fontFamily: "Tahoma, sans-serif",
                minWidth: "30px",
              })}
              onMouseEnter={(e) => {
                if (openMenuIndex() === null)
                  e.currentTarget.style.background = "#D1E9FF";
              }}
              onMouseLeave={(e) => {
                if (openMenuIndex() !== index())
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {item.label}
            </Button>
            <Show when={openMenuIndex() === index() && item.items}>
              <div
                style={s({
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  minWidth: "100px",
                  backgroundColor: "#fff",
                  border: "1px solid #0054E3",
                  boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                  zIndex: 10000,
                  whiteSpace: "nowrap",
                })}
              >
                <For each={item.items}>
                  {(subItem) => (
                    <button
                      onClick={() => {
                        subItem.onClick?.();
                        setOpenMenuIndex(null);
                      }}
                      style={s({
                        display: "block",
                        width: "100%",
                        padding: "4px 12px",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontFamily: "Tahoma, sans-serif",
                      })}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#316AC5";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#000";
                      }}
                    >
                      {subItem.label}
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
