import type { JSX } from "@solidjs/web";
import {
  type Align,
  type BaseStyleProps,
  type Justify,
  createBaseStyle,
  mapAlignToCss,
  mapJustifyToCss,
} from "./layoutProps";
import { type StyleObject } from "./Box";
import { s } from "../style";

interface HorizontalProps extends BaseStyleProps {
  children?: JSX.Element;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  reverse?: boolean;
  class?: string;
  style?: StyleObject;
  ref?: (el: HTMLDivElement) => void;
}

export default function Horizontal(props: HorizontalProps) {
  const style = () =>
    s(
      createBaseStyle(props),
      {
        display: "flex",
        flexDirection: props.reverse ? "row-reverse" : "row",
        flexWrap: props.wrap ? "wrap" : undefined,
        alignItems: mapAlignToCss(props.align),
        justifyContent: mapJustifyToCss(props.justify),
      },
      props.style,
    );

  return (
    <div ref={props.ref} class={props.class} style={style()}>
      {props.children}
    </div>
  );
}
