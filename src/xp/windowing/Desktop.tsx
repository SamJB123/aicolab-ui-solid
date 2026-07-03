import { createEffect, createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Wallpaper } from "../components/Wallpaper";
import { DesktopContext } from "./DesktopContext";
import Box from "../components/Box";

type TaskbarButtonRefs = Map<string, HTMLElement | null>;

// The full-viewport desktop surface: wallpaper + the bounds/taskbar-refs
// context every window reads. Port of the reference OperatingSystem.tsx (its
// app-level ErrorsRenderer is not part of the package — consumers layer their
// own overlays as children).
export function Desktop(props: { children: JSX.Element }) {
  // The desktop element as a SIGNAL so the resize observer attaches once the
  // ref is set (a plain `let` wouldn't re-trigger the reactive target).
  const [desktopEl, setDesktopEl] = createSignal<HTMLDivElement>();
  const [desktopRect, setDesktopRect] = createSignal<DOMRect | null>(null);
  const taskbarButtonRefs: { current: TaskbarButtonRefs } = {
    current: new Map(),
  };

  // ResizeObserver fires on initial observe and on every resize; we read
  // getBoundingClientRect (viewport coords) since window transform-origins are
  // computed against the taskbar button's viewport rect. Two-arg effect tracks
  // the desktop element signal; the apply observes it and returns the cleanup.
  createEffect(
    () => desktopEl(),
    (el) => {
      if (!el) return;
      const update = () => setDesktopRect(el.getBoundingClientRect());
      update();
      const observer = new ResizeObserver(update);
      observer.observe(el);
      return () => observer.disconnect();
    },
  );

  return (
    <DesktopContext value={{ desktopRect, taskbarButtonRefs }}>
      <Box
        class="xp-theme"
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          top: 0,
          left: 0,
        }}
      >
        <Wallpaper fullScreen>
          <Box
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              ref={(el) => setDesktopEl(el)}
              style={{ flex: 1, position: "relative" }}
            >
              {props.children}
            </Box>
          </Box>
        </Wallpaper>
      </Box>
    </DesktopContext>
  );
}
