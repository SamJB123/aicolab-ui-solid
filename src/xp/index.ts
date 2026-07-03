// XP compartment of @aicolab/ui-solid: the Windows-XP-authentic desktop-shell
// component library (window chrome, taskbar, start menu, widget set), ported
// from the convex-os reference app with all state coupling removed. Pure
// presentational + gesture logic — window/process STATE lives with the host
// (hub keeps it in TanStack DB collections) and arrives via props/handles.

// Style bridge (React-style inline style objects -> Solid)
export { s, type StyleValue, type StyleInput } from "./style";
export { iife, exhaustiveCheck } from "./misc";

// Assets
export { xpIconUrl, type XpIconPath } from "./icons";
export { playSound, stopSound, type SoundEffect } from "./sounds/soundEffects";

// XP widget set
export { default as Box } from "./components/Box";
export { Button } from "./components/Button";
export { Checkbox } from "./components/Checkbox";
export { CommonWindowShell } from "./components/CommonWindowShell";
export { Dropdown } from "./components/Dropdown";
export { default as Flex } from "./components/Flex";
export { GroupBox } from "./components/GroupBox";
export { default as Horizontal } from "./components/Horizontal";
export { MenuBar } from "./components/MenuBar";
export { ProgressBar } from "./components/ProgressBar";
export { RadioButton } from "./components/RadioButton";
export { Slider } from "./components/Slider";
export { Tabs } from "./components/Tabs";
export { TextBox } from "./components/TextBox";
export { TreeView } from "./components/TreeView";
export { default as Vertical } from "./components/Vertical";
export { Wallpaper } from "./components/Wallpaper";

// Desktop + windowing
export { Desktop } from "./windowing/Desktop";
export {
  DesktopContext,
  useDesktop,
  type DesktopContextValue,
} from "./windowing/DesktopContext";
export { Window, type WindowProps, type ResizeCorner } from "./windowing/Window";
export { LocalWindow } from "./windowing/LocalWindow";
export { TitleBar } from "./windowing/TitleBar";
export { WindowControls } from "./windowing/WindowControls";
export { ResizeHandles } from "./windowing/ResizeHandles";
export { useWindowStyle } from "./windowing/useWindowStyle";
export {
  MIN_WINDOW_WIDTH,
  MIN_WINDOW_HEIGHT,
  calculateNewDimensions,
  applyDesktopBounds,
  applyMinimumConstraints,
  type ResizeOrigin,
  type Dimensions,
} from "./windowing/useResizing";
export type { WindowViewState, WindowGeometry } from "./windowing/types";
export {
  WindowHandleContext,
  useWindowHandle,
  useWindowHandleOptional,
  type WindowHandle,
} from "./windowing/WindowHandle";

// Taskbar
export { Taskbar, type TaskbarProps } from "./taskbar/Taskbar";
export { TaskbarButton, type TaskbarButtonProps } from "./taskbar/TaskbarButton";
export { StartButton } from "./taskbar/StartButton";
export { SystemTray } from "./taskbar/SystemTray";
export { Clock } from "./taskbar/Clock";

// Start menu
export { StartMenu, type StartMenuProps } from "./startmenu/StartMenu";
export { StartMenuItem } from "./startmenu/StartMenuItem";
export type { StartMenuItemData } from "./startmenu/types";
