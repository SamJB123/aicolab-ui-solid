import { xpIconUrl } from "../icons";
import { s } from "../style";

interface StartMenuUserHeaderProps {
  userName: string;
  // TODO(colab-os): avatar is a reskin candidate; defaults to the XP users icon.
  avatarSrc?: string;
}

export function StartMenuUserHeader(props: StartMenuUserHeaderProps) {
  return (
    <>
      {/* White top border */}
      <div style={s({ height: "2px", background: "white", width: "100%" })} />

      {/* User section header */}
      <div
        style={s({
          background: "var(--xp-startmenu-header-gradient)",
          padding: "6px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          height: "48px",
        })}
      >
        <img
          src={props.avatarSrc ?? xpIconUrl("users.png")}
          alt="User"
          style={s({
            width: "40px",
            height: "40px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "3px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          })}
        />
        <span
          style={s({
            color: "white",
            fontSize: "14px",
            fontWeight: "bold",
            textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
          })}
        >
          {props.userName}
        </span>
      </div>

      {/* Orange separator */}
      <div
        style={s({
          height: "3px",
          background: "var(--xp-startmenu-accent-gradient)",
          borderBottom: "1px solid var(--xp-startmenu-accent-border)",
        })}
      />
    </>
  );
}
