import { createSignal, omit, onSettled, untrack } from "solid-js";
import { Window, type WindowProps } from "./Window";
import { useDesktop } from "./DesktopContext";
import { fitWindowToDesktop } from "./useResizing";
import type { WindowViewState } from "./types";

// A window not backed by any store — geometry + view state live in local
// signals. Centered on the desktop at creation (fitted to the device, so a
// 400px dialog doesn't overflow a phone); maximize toggles locally. Used for
// auth/dialog windows.
export function LocalWindow(props: Omit<WindowProps, "x" | "y">) {
  const desktop = useDesktop();

  const [geometry, setGeometry] = createSignal(
    untrack(() => {
      const rect = desktop.desktopRect() ?? {
        width: typeof window !== "undefined" ? window.innerWidth : 1024,
        height: typeof window !== "undefined" ? window.innerHeight : 768,
      };
      return fitWindowToDesktop({ width: props.width, height: props.height }, rect);
    }),
  );

  // The setup-time geometry may be based on the SSR fallback rect (the server
  // can't know the device size, and hydration keeps the server-rendered
  // style until a signal changes). Re-fit ONCE on the client after settle,
  // when the real desktop rect exists — this is what makes the sign-in
  // dialog fit a phone. Not reactive to later resizes on purpose: dialogs
  // shouldn't jump around while open.
  onSettled(() => {
    const rect = desktop.desktopRect() ?? {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    setGeometry(fitWindowToDesktop({ width: props.width, height: props.height }, rect));
  });

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
