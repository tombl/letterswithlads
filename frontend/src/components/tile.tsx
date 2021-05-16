import type { JSX } from "preact";
import { classes, style } from "typestyle";
import type { NestedCSSProperties } from "typestyle/lib/types";
import * as colors from "../styles/color";
import { Box } from "./box";

const LETTER_WEIGHTS: Record<string, number | string | undefined> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
  " ": "",
};

const BORDER_RADIUS = "0.5em";

function buildStyles(
  neighbours: {
    top: boolean;
    left: boolean;
    bottom: boolean;
    right: boolean;
  },
  filled: boolean,
  raised: boolean
): NestedCSSProperties {
  const offset = raised && filled ? 4 : 0;
  return {
    backgroundColor: filled ? colors.secondary : colors.primaryDarker,
    color: colors.secondaryDarker,
    fontWeight: "bold",
    userSelect: "none",
    boxShadow: filled
      ? `0 ${2 + offset}px ${colors.secondaryDark}`
      : raised
      ? `inset 0 0 0 2px ${colors.primary}`
      : undefined,
    borderTopLeftRadius: neighbours.top || neighbours.left ? 0 : BORDER_RADIUS,
    borderTopRightRadius:
      neighbours.top || neighbours.right ? 0 : BORDER_RADIUS,
    borderBottomLeftRadius:
      neighbours.bottom || neighbours.left ? 0 : BORDER_RADIUS,
    borderBottomRightRadius:
      neighbours.bottom || neighbours.right ? 0 : BORDER_RADIUS,
    zIndex: filled ? 2 : 1,
    transform: filled ? `translate(0, -${offset}px)` : undefined,
    transition: "100ms transform ease-out, 100ms box-shadow ease-out",
  };
}

export function HandTile({
  letter,
  className,
  raised,
  ...rest
}: {
  letter: string;
  raised: boolean;
  className?: string;
} & JSX.IntrinsicElements["span"]) {
  return (
    <span
      className={classes(
        className,
        style(
          buildStyles(
            { top: false, left: false, bottom: false, right: false },
            true,
            raised
          ),
          {
            width: "2em",
            height: "2em",
            padding: "0.4em",
            textAlign: "center",
          }
        )
      )}
      {...rest}
    >
      {letter}
      <span
        className={style({
          fontSize: "0.5em",
          verticalAlign: "bottom",
          fontWeight: "bolder",
          marginLeft: "0.25em",
        })}
      >
        {LETTER_WEIGHTS[letter] ?? "?"}
      </span>
    </span>
  );
}

export function BoardTile({
  letter,
  className,
  raised,
  neighbours = { top: false, left: false, bottom: false, right: false },
  ...rest
}: {
  letter?: string;
  className?: string;
  raised: boolean;
  neighbours?: { top: boolean; left: boolean; bottom: boolean; right: boolean };
} & Partial<Parameters<typeof Box>[0]>) {
  return (
    <Box
      direction="row"
      className={classes(
        className,
        style(buildStyles(neighbours, letter !== undefined, raised))
      )}
      {...rest}
    >
      {letter === undefined ? undefined : (
        <span className={style({ margin: "auto" })}>
          {letter}
          <span
            className={style({
              fontSize: "0.5em",
              verticalAlign: "bottom",
              fontWeight: "bolder",
              marginLeft: "0.1em",
            })}
          >
            {LETTER_WEIGHTS[letter] ?? "?"}
          </span>
        </span>
      )}
    </Box>
  );
}
