import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createBaseStyle, type BaseStyleProps } from "./layoutProps";
import { s, type StyleValue } from "../style";

export const BASE_STYLE_KEYS = [
  "gap",
  "margin",
  "marginX",
  "marginY",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingX",
  "paddingY",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
  "background",
  "border",
  "borderRadius",
  "shadow",
] satisfies (keyof BaseStyleProps)[];

export type StyleObject = Record<string, StyleValue>;

export interface BoxProps
  extends BaseStyleProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "style"> {
  children?: JSX.Element;
  inline?: boolean;
  style?: StyleObject;
  ref?: (el: HTMLDivElement) => void;
}

export default function Box(props: BoxProps) {
  // Solid 2 has no `splitProps`; `omit` returns the reactive rest to spread onto
  // the element. The style-prop keys + our own props are read via `props.*`.
  // `createBaseStyle` only consumes the BaseStyleProps keys it knows and ignores
  // the rest, so it's safe to hand it the whole reactive `props`.
  const rest = omit(
    props,
    ...BASE_STYLE_KEYS,
    "children",
    "inline",
    "class",
    "style",
  );

  return (
    <div
      class={props.class}
      style={s(
        createBaseStyle(props),
        props.inline ? { display: "inline-flex" } : undefined,
        props.style,
      )}
      {...rest}
    >
      {props.children}
    </div>
  );
}
