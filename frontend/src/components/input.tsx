import type { JSX } from "preact";
import { classes, style } from "typestyle";

export function Input({
  className,
  ...rest
}: {
  className?: string;
} & JSX.IntrinsicElements["input"]) {
  return (
    <input
      className={classes(
        className,
        style({
          borderRadius: 8,
          border: "none",
          padding: 8,
        })
      )}
      {...rest}
    />
  );
}
