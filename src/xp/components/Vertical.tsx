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

interface VerticalProps extends BaseStyleProps {
  children?: JSX.Element;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  reverse?: boolean;
  class?: string;
  style?: StyleObject;
  ref?: (el: HTMLDivElement) => void;
}

export default function Vertical(props: VerticalProps) {
  const style = () =>
    s(
      createBaseStyle(props),
      {
        display: "flex",
        flexDirection: props.reverse ? "column-reverse" : "column",
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
