import type { ComponentChildren, JSX } from "preact";
import { classes, style } from "typestyle";

export function Box({
  children,
  className,
  direction,
  grow = true,
  wrap = false,
  shrink = false,
  spacing,
  ...rest
}: {
  children?: ComponentChildren;
  className?: string;
  direction: "row" | "column";
  grow?: number | boolean;
  wrap?: boolean;
  shrink?: number | boolean;
  spacing?: number | string;
} & Omit<JSX.IntrinsicElements["div"], "wrap">) {
  return (
    <div
      className={classes(
        style({
          display: "flex",
          flex: `${Number(grow)} ${Number(shrink)}`,
          flexDirection: direction,
          flexWrap: wrap ? "wrap" : undefined,
          gap: spacing,
        }),
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
