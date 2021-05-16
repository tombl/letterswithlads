import { useEffect, useState } from "preact/hooks";

export const LOADING = Symbol("loading");

export function usePromise<T>(promise: Promise<T>) {
  const [state, setState] = useState<
    | { type: "loading" }
    | { type: "resolved"; value: T }
    | { type: "rejected"; error: unknown }
  >({ type: "loading" });

  useEffect(() => {
    let cancelled = false;
    promise.then(
      (value) => {
        if (!cancelled) {
          setState({ type: "resolved", value });
        }
      },
      (error: unknown) => {
        if (!cancelled) {
          setState({ type: "rejected", error });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [promise]);

  switch (state.type) {
    case "loading":
      return LOADING;
    case "resolved":
      return state.value;
    case "rejected":
      throw state.error;
  }
}
