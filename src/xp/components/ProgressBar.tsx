import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";

interface ProgressBarProps
  extends JSX.ProgressHTMLAttributes<HTMLProgressElement> {
  indeterminate?: boolean;
}

export function ProgressBar(props: ProgressBarProps) {
  const rest = omit(props, "indeterminate", "class", "max", "value");
  // An indeterminate <progress> has neither `value` nor `max` attribute.
  return (
    <progress
      class={props.class ?? ""}
      max={props.indeterminate ? undefined : (props.max ?? 100)}
      value={props.indeterminate ? undefined : props.value}
      {...rest}
    />
  );
}
