import { createUniqueId, For, omit, Show } from "solid-js";
import type { JSX } from "@solidjs/web";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  options: DropdownOption[];
  label?: string;
}

export function Dropdown(props: DropdownProps) {
  const generatedId = createUniqueId();
  const dropdownId = () => props.id || generatedId;
  const rest = omit(props, "options", "label", "class", "id");

  const Select = () => (
    <select id={dropdownId()} class={props.class ?? ""} {...rest}>
      <For each={props.options}>
        {(option) => <option value={option.value}>{option.label}</option>}
      </For>
    </select>
  );

  return (
    <Show when={props.label} fallback={<Select />}>
      <div class="field-row">
        <label for={dropdownId()}>{props.label}</label>
        <Select />
      </div>
    </Show>
  );
}
