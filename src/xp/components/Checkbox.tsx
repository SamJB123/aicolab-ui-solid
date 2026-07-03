import { createUniqueId, omit } from "solid-js";
import type { JSX } from "@solidjs/web";

interface CheckboxProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox(props: CheckboxProps) {
  const generatedId = createUniqueId();
  const checkboxId = () => props.id || generatedId;
  const rest = omit(props, "label", "class", "id", "type");

  return (
    <div class="field-row">
      <input
        type="checkbox"
        id={checkboxId()}
        class={props.class ?? ""}
        {...rest}
      />
      <label for={checkboxId()}>{props.label}</label>
    </div>
  );
}
