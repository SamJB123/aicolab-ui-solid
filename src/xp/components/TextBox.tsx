import { createUniqueId, omit, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { s, type StyleValue } from "../style";

type StyleObject = Record<string, StyleValue>;

interface TextBoxProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "style"> {
  label?: string;
  stacked?: boolean;
  containerStyle?: StyleObject;
  labelStyle?: StyleObject;
  style?: StyleObject;
}

export function TextBox(props: TextBoxProps) {
  const generatedId = createUniqueId();
  const inputId = () => props.id || generatedId;
  const rest = omit(
    props,
    "label",
    "stacked",
    "class",
    "id",
    "containerStyle",
    "labelStyle",
    "style",
  );

  const Input = () => (
    <input
      id={inputId()}
      class={props.class ?? ""}
      style={s(props.style)}
      {...rest}
    />
  );

  return (
    <Show when={props.label} fallback={<Input />}>
      <div
        class={props.stacked ? "field-row-stacked" : "field-row"}
        style={s(props.containerStyle)}
      >
        <label for={inputId()} style={s(props.labelStyle)}>
          {props.label}
        </label>
        <Input />
      </div>
    </Show>
  );
}
