import type { JSX } from "@solidjs/web";
import { s, type StyleValue } from "../style";
// TODO(colab-os): wallpaper is a prime reskin candidate — NOTE the bundled
// bliss.webp has the CONVEX LOGO composited into the image itself (rising
// behind the hill; inherited from the convex-os demo). Swapping in an
// aicolab wallpaper is a one-file replacement here.
import blissUrl from "../assets/bliss.webp";

interface WallpaperProps {
  children?: JSX.Element;
  fullScreen?: boolean;
  style?: Record<string, StyleValue>;
  class?: string;
}

export function Wallpaper(props: WallpaperProps) {
  const style = () =>
    s(
      {
        backgroundImage: `url(${blissUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: props.fullScreen ? "100%" : "auto",
        width: props.fullScreen ? "100%" : "auto",
        height: props.fullScreen ? "100%" : "auto",
      },
      props.style,
    );

  return (
    <div class={props.class ?? ""} style={style()}>
      {props.children}
    </div>
  );
}
