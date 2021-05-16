import type { ComponentChildren } from "preact";
import { style } from "typestyle";
import * as colors from "../styles/color";
import { Box } from "./box";

export function HomeEntry({ children }: { children: ComponentChildren }) {
  return (
    <Box
      direction="row"
      grow={false}
      className={style({
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: "center",
      })}
    >
      {children}
    </Box>
  );
}
