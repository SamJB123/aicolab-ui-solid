import { Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { s, type StyleValue } from "../style";

interface GroupBoxProps {
  title?: string;
  children: JSX.Element;
  class?: string;
  style?: Record<string, StyleValue>;
}

export function GroupBox(props: GroupBoxProps) {
  return (
    <fieldset class={props.class ?? ""} style={s(props.style)}>
      <Show when={props.title}>{(title) => <legend>{title()}</legend>}</Show>
      {props.children}
    </fieldset>
  );
}
