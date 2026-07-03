import { Button } from "../components/Button";
import { xpIconUrl } from "../icons";
import { s } from "../style";

interface StartMenuBottomButtonsProps {
  onLogOff: () => void;
  onTurnOff: () => void;
}

export function StartMenuBottomButtons(props: StartMenuBottomButtonsProps) {
  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    cursor: "pointer",
    background: "none",
    border: "none",
    borderRadius: "2px",
    fontSize: "11px",
    fontFamily: "MS Sans Serif, Arial, sans-serif",
    color: "white",
  };

  return (
    <div
      style={s({
        height: "35px",
        background: "var(--xp-startmenu-footer-gradient)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 8px",
        borderTop: "1px solid rgba(255,255,255,0.3)",
        gap: "4px",
        position: "relative",
        zIndex: 10,
      })}
    >
      <Button
        style={buttonStyle}
        onClick={props.onLogOff}
        onMouseDown={(e) => (e.currentTarget.style.border = "none")}
        onMouseUp={(e) => (e.currentTarget.style.border = "none")}
        onMouseLeave={(e) => (e.currentTarget.style.border = "none")}
      >
        <img
          src={xpIconUrl("logoff.png")}
          alt="Log Off"
          style={s({ width: "16px", height: "16px" })}
        />
        <span>Log Off</span>
      </Button>

      <Button
        style={buttonStyle}
        onClick={props.onTurnOff}
        onMouseDown={(e) => (e.currentTarget.style.border = "none")}
        onMouseUp={(e) => (e.currentTarget.style.border = "none")}
        onMouseLeave={(e) => (e.currentTarget.style.border = "none")}
      >
        <img
          src={xpIconUrl("shutdown.png")}
          alt="Turn Off"
          style={s({ width: "16px", height: "16px" })}
        />
        <span>Turn Off Computer</span>
      </Button>
    </div>
  );
}
