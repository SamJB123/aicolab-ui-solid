import { createSignal, Show } from "solid-js";
import { playSound } from "../sounds/soundEffects";
import { Button } from "../components/Button";
import { s } from "../style";

interface StartButtonProps {
  onClick?: () => void;
  // TODO(colab-os): the reference shipped the Convex logo here; the host
  // supplies its own brand mark (and label) for the Colab OS skin.
  logoSrc?: string;
  label?: string;
}

export function StartButton(props: StartButtonProps) {
  const [isPressed, setIsPressed] = createSignal(false);

  return (
    <Button
      class="start-button"
      onClick={() => {
        playSound("start", 0.4);
        props.onClick?.();
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        backgroundImage: isPressed()
          ? "var(--xp-start-button-pressed-gradient)"
          : "var(--xp-start-button-gradient)",
        boxShadow: "-2px -2px 10px rgba(0,0,0,0.56) inset",
        height: "100%",
        width: "100px",
        minWidth: "100px",
        flexShrink: 0,
        color: "white",
        fontWeight: "500",
        fontSize: "1.1rem",
        fontStyle: "italic",
        fontFamily: "MS Sans Serif, sans-serif",
        border: "none",
        borderRadius: "0 8px 0 0",
        cursor: "pointer",
        outline: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        transition: "all 0.1s",
      }}
    >
      <Show when={props.logoSrc}>
        <img
          src={props.logoSrc}
          alt=""
          style={s({
            width: "20px",
            height: "20px",
            filter: "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.205))",
          })}
        />
      </Show>
      <span
        style={s({
          filter: "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.685))",
          letterSpacing: "1px",
          paddingRight: "8px",
          paddingLeft: "4px",
          paddingBottom: "2px",
        })}
      >
        {props.label ?? "start"}
      </span>
    </Button>
  );
}
