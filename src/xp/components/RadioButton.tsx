import { createUniqueId, omit } from "solid-js";
import type { JSX } from "@solidjs/web";

interface RadioButtonProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function RadioButton(props: RadioButtonProps) {
  const generatedId = createUniqueId();
  const radioId = () => props.id || generatedId;
  const rest = omit(props, "label", "class", "id", "type");

  return (
    <div class="field-row">
      <input type="radio" id={radioId()} class={props.class ?? ""} {...rest} />
      <label for={radioId()}>{props.label}</label>
    </div>
  );
}
