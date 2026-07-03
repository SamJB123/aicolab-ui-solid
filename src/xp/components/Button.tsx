import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { s, type StyleValue } from "../style";

interface ButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children?: JSX.Element;
  style?: Record<string, StyleValue>;
}

export function Button(props: ButtonProps) {
  const rest = omit(props, "children", "class", "style");
  return (
    <button
      class={props.class ?? ""}
      style={s({ minWidth: "30px" }, props.style)}
      {...rest}
    >
      {props.children}
    </button>
  );
}
