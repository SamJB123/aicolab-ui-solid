import { Show } from "solid-js";
import type { StartMenuItemData } from "./types";
import { StartMenuUserHeader } from "./StartMenuUserHeader";
import { StartMenuLeftColumn } from "./StartMenuLeftColumn";
import { StartMenuRightColumn } from "./StartMenuRightColumn";
import { StartMenuBottomButtons } from "./StartMenuBottomButtons";
import Box from "../components/Box";

// Presentational start menu. The reference version owned auth, error toasts,
// process launching and its item lists; the host now supplies the items
// (typically derived from its app registry), the user identity, and every
// behaviour. Selecting an item calls its own onSelect, else onItemFallback
// (e.g. an "unimplemented" toast). The host closes the menu itself from
// whichever handler it wires — the menu only auto-closes on backdrop clicks.
export interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  avatarSrc?: string;
  leftItems: StartMenuItemData[];
  rightItems: StartMenuItemData[];
  onItemFallback?: (item: StartMenuItemData) => void;
  onAllProgramsClick?: () => void;
  onLogOff: () => void;
  onTurnOff: () => void;
}

export function StartMenu(props: StartMenuProps) {
  const handleMenuItemClick = (item: StartMenuItemData) => {
    if (item.onSelect && !item.disabled) {
      item.onSelect();
      props.onClose();
      return;
    }
    props.onItemFallback?.(item);
    props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      {/* Backdrop to close menu when clicked outside */}
      <Box
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10001,
        }}
        onClick={props.onClose}
      />

      {/* Start Menu */}
      <Box
        style={{
          position: "fixed",
          bottom: "38px",
          left: "2px",
          width: "385px",
          height: "425px",
          background: "var(--xp-startmenu-bg)",
          border: "3px ridge #C0C0C0",
          borderBottomColor: "#404040",
          borderRightColor: "#404040",
          borderRadius: "8px 8px 0 0",
          boxShadow: "4px 0 10px rgba(0, 0, 0, 0.5)",
          zIndex: 10002,
          overflow: "hidden",
          fontFamily: "MS Sans Serif, Arial, sans-serif",
          // No double-tap zoom / tap delay on menu items (iOS).
          touchAction: "manipulation",
        }}
      >
        <StartMenuUserHeader
          userName={props.userName}
          avatarSrc={props.avatarSrc}
        />

        {/* Main menu content */}
        <Box style={{ display: "flex", height: "325px", overflow: "hidden" }}>
          <StartMenuLeftColumn
            items={props.leftItems}
            onItemClick={handleMenuItemClick}
            onAllProgramsClick={() => props.onAllProgramsClick?.()}
          />
          <StartMenuRightColumn
            items={props.rightItems}
            onItemClick={handleMenuItemClick}
          />
        </Box>

        <StartMenuBottomButtons
          onLogOff={props.onLogOff}
          onTurnOff={props.onTurnOff}
        />
      </Box>
    </Show>
  );
}
