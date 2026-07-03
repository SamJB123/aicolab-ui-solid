import { createUniqueId, omit, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

interface SliderProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Slider(props: SliderProps) {
  const generatedId = createUniqueId();
  const sliderId = () => props.id || generatedId;
  const rest = omit(props, "label", "class", "id", "type");

  const Input = () => (
    <input type="range" id={sliderId()} class={props.class ?? ""} {...rest} />
  );

  return (
    <Show when={props.label} fallback={<Input />}>
      <div class="field-row">
        <label for={sliderId()}>{props.label}</label>
        <Input />
      </div>
    </Show>
  );
}
