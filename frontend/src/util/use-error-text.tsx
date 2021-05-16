import { useState } from "preact/hooks";
import { style } from "typestyle";
import * as colors from "../styles/color";

export function useErrorText() {
  const [error, setError] = useState<string | null>(null);

  return [
    error === null ? null : (
      <span className={style({ color: colors.red, userSelect: "none" })}>
        {error}
      </span>
    ),
    setError,
  ] as const;
}
