import type { JSX } from "@solidjs/web";
import Box from "./Box";

interface CommonWindowShellProps {
  menubar: JSX.Element;
  children: JSX.Element;
}

export function CommonWindowShell(props: CommonWindowShellProps) {
  return (
    <Box
      height="100%"
      style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {props.menubar}
      <Box style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        {props.children}
      </Box>
    </Box>
  );
}
