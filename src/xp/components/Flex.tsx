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

interface FlexProps extends BaseStyleProps {
  children?: JSX.Element;
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  inline?: boolean;
  class?: string;
  style?: StyleObject;
}

export default function Flex(props: FlexProps) {
  const style = () =>
    s(
      createBaseStyle(props),
      {
        display: props.inline ? "inline-flex" : "flex",
        flexDirection: props.direction ?? "row",
        flexWrap: props.wrap ? "wrap" : undefined,
        alignItems: mapAlignToCss(props.align),
        justifyContent: mapJustifyToCss(props.justify),
      },
      props.style,
    );

  return (
    <div class={props.class} style={style()}>
      {props.children}
    </div>
  );
}
