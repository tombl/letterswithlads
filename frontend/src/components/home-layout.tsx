import { navigate } from "hookrouter";
import type { ComponentChildren } from "preact";
import { style } from "typestyle";
import type { NestedCSSProperties } from "typestyle/lib/types";
import { APP_NAME } from "../config";
import * as colors from "../styles/color";
import { Box } from "./box";
import { Button } from "./button";

const NAV_BUTTON_STYLE: NestedCSSProperties = {
  flex: 1,
  backgroundColor: "transparent",
  color: "white",
};
const NAV_BUTTON_SELECTED_STYLE: NestedCSSProperties = {
  fontWeight: "bold",
};

export function HomeLayout({
  children,
  selected,
}: {
  children: ComponentChildren;
  selected: "home" | "friends" | "settings";
}) {
  return (
    <Box
      direction="column"
      className={style({
        margin: "0 auto",
        backgroundColor: colors.primaryDark,
      })}
    >
      <Box
        direction="row"
        className={style({
          backgroundColor: colors.primary,
          fontWeight: "bold",
          fontSize: "min(10vw, 2em)",
          padding: "32px 0",
        })}
        grow={false}
      >
        <span className={style({ margin: "auto" })}>{APP_NAME}</span>
      </Box>
      <Box
        direction="column"
        spacing="4px"
        className={style({
          margin: "8px",
          marginBottom: 0,
          overflow: "auto",
        })}
      >
        {children}
      </Box>
      <Box
        direction="row"
        grow={false}
        className={style({ backgroundColor: colors.primary, padding: "8px 0" })}
      >
        <Button
          className={style(
            NAV_BUTTON_STYLE,
            selected === "home" ? NAV_BUTTON_SELECTED_STYLE : undefined
          )}
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </Button>
        <Button
          className={style(
            NAV_BUTTON_STYLE,
            selected === "friends" ? NAV_BUTTON_SELECTED_STYLE : undefined
          )}
          onClick={() => {
            navigate("/friends");
          }}
        >
          Friends
        </Button>
        <Button
          className={style(
            NAV_BUTTON_STYLE,
            selected === "settings" ? NAV_BUTTON_SELECTED_STYLE : undefined
          )}
          onClick={() => {
            navigate("/settings");
          }}
        >
          Settings
        </Button>
      </Box>
    </Box>
  );
}
