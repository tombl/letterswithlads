import type { ComponentChildren, JSX } from "preact";
import { classes, style } from "typestyle";

export function Button({
  children,
  className,
  ...rest
}: {
  children: ComponentChildren;
  className?: string;
} & JSX.IntrinsicElements["button"]) {
  return (
    <button
      className={classes(
        className,
        style({
          borderRadius: 8,
          border: "none",
          padding: 8,
          transition: "background-color 100ms, color 100ms",
        })
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
