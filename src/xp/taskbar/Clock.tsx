import { createSignal, onSettled } from "solid-js";
import { s } from "../style";

export function Clock() {
  const [time, setTime] = createSignal(new Date());

  onSettled(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div
      style={s({
        color: "white",
        fontSize: "12px",
        fontFamily: "MS Sans Serif, sans-serif",
        padding: "2px 4px",
        minWidth: "60px",
        textAlign: "center",
        cursor: "default",
        userSelect: "none",
        fontWeight: "400",
        lineHeight: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      {formatTime(time())}
    </div>
  );
}
