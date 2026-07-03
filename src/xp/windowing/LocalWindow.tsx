import { createSignal, omit, untrack } from "solid-js";
import { Window, type WindowProps } from "./Window";
import { useDesktop } from "./DesktopContext";
import type { WindowViewState } from "./types";

// A window not backed by any store — geometry + view state live in local
// signals. Centered on the desktop at creation; maximize toggles locally.
// Used for auth/dialog windows.
export function LocalWindow(props: Omit<WindowProps, "x" | "y">) {
  const desktop = useDesktop();

  const [geometry, setGeometry] = createSignal(
    untrack(() => {
      const rect = desktop.desktopRect() ?? {
        width: typeof window !== "undefined" ? window.innerWidth : 1024,
        height: typeof window !== "undefined" ? window.innerHeight : 768,
      };
      return {
        x: (rect.width - props.width) / 2,
        y: (rect.height - props.height) / 2,
        width: props.width,
        height: props.height,
      };
    }),
  );

  const [viewState, setViewState] = createSignal<WindowViewState>(
    untrack(() => props.viewState),
  );

  const toggleMaximize = () => {
    setViewState((vs) =>
      vs.kind === "maximized"
        ? { kind: "open", viewStackOrder: 0, isActive: true }
        : { kind: "maximized" },
    );
    props.onToggleMaximize?.();
  };

  const rest = omit(
    props,
    "children",
    "width",
    "height",
    "viewState",
    "onToggleMaximize",
  );

  return (
    <Window
      {...rest}
      x={geometry().x}
      y={geometry().y}
      width={geometry().width}
      height={geometry().height}
      viewState={viewState()}
      onToggleMaximize={toggleMaximize}
      onGeometryChange={setGeometry}
    >
      {props.children}
    </Window>
  );
}
