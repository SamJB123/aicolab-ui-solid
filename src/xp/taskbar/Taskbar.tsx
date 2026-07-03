import type { JSX } from "@solidjs/web";
import { StartButton } from "./StartButton";
import { SystemTray } from "./SystemTray";
import Box from "../components/Box";

// Presentational taskbar frame: start button + button strip + tray. The
// reference queried its process list here; the host now supplies the buttons
// as children (typically a <For> of <TaskbarButton>s).
export interface TaskbarProps {
  onStartClick?: () => void;
  // Custom start-button branding; defaults inside StartButton.
  startLogoSrc?: string;
  startLabel?: string;
  children?: JSX.Element;
  // Custom tray content; defaults to a bare SystemTray (clock only).
  tray?: JSX.Element;
}

export function Taskbar(props: TaskbarProps) {
  return (
    <Box
      class="taskbar"
      style={{
        width: "100%",
        height: "38px",
        backgroundImage: "var(--xp-taskbar-gradient)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        userSelect: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
      }}
    >
      <StartButton
        onClick={props.onStartClick}
        logoSrc={props.startLogoSrc}
        label={props.startLabel}
      />
      <Box
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingLeft: "8px",
          paddingRight: "8px",
          overflow: "hidden",
        }}
      >
        {props.children}
      </Box>
      {props.tray ?? <SystemTray />}
    </Box>
  );
}
