import type { ComponentChild, ComponentChildren } from "preact";
import { style } from "typestyle";
import * as colors from "../styles/color";
import { Box } from "./box";

export function AuthLayout({
  children,
  title,
}: {
  children: ComponentChildren;
  title: ComponentChild;
}) {
  return (
    <Box
      direction="column"
      className={style({
        backgroundColor: colors.primaryDark,
      })}
    >
      <Box
        direction="column"
        grow={0.5}
        className={style({ alignSelf: "center" })}
      >
        {title}
      </Box>
      <Box
        direction="column"
        spacing="8px"
        className={style({ margin: "auto" })}
      >
        {children}
      </Box>
    </Box>
  );
}
