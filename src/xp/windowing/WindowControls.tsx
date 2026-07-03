import { Show } from "solid-js";
import { playSound } from "../sounds/soundEffects";
import { Button } from "../components/Button";

interface WindowControlsProps {
  showCloseButton?: boolean;
  showMaximizeButton?: boolean;
  showMinimiseButton?: boolean;
  isMaximized?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
}

export function WindowControls(props: WindowControlsProps) {
  return (
    <div class="title-bar-controls" style={{ display: "flex" }}>
      <Show when={props.showMinimiseButton && props.onMinimize}>
        <Button
          class="minimise"
          aria-label="Minimize"
          onClick={(event) => {
            event.stopPropagation();
            playSound("minimize", 0.3);
            props.onMinimize?.();
          }}
          onMouseDown={(event) => event.stopPropagation()}
          style={{ minWidth: "20px" }}
        />
      </Show>
      <Show when={props.showMaximizeButton}>
        <Button
          class={props.isMaximized ? "restore" : "maximise"}
          aria-label={props.isMaximized ? "Restore" : "Maximize"}
          onClick={(event) => {
            event.stopPropagation();
            props.onToggleMaximize?.();
          }}
          onMouseDown={(event) => event.stopPropagation()}
          style={{ minWidth: "20px" }}
        />
      </Show>
      <Show when={props.showCloseButton && props.onClose}>
        <Button
          aria-label="Close"
          onClick={(event) => {
            event.stopPropagation();
            props.onClose?.();
          }}
          onMouseDown={(event) => event.stopPropagation()}
          style={{ minWidth: "20px" }}
        />
      </Show>
    </div>
  );
}
