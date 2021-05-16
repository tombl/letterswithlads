import { ComponentChildren, createContext } from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "preact/hooks";
import type { Broadcasts } from "../../../backend/src/api";
import { BACKEND } from "../api";
import { useAuth } from "./auth";

const eventSourceContext = createContext<EventSource | null>(null);

export function EventProvider({ children }: { children: ComponentChildren }) {
  const { token } = useAuth();
  const source = useMemo(() => {
    if (token === null) {
      return null;
    }
    return new EventSource(
      `${BACKEND}/events&${encodeURIComponent(token.token)}`
    );
  }, [token?.token]);
  return (
    <eventSourceContext.Provider value={source}>
      {children}
    </eventSourceContext.Provider>
  );
}

export function useEvent<T>(
  name: Broadcasts,
  callback: () => T,
  deps: unknown[]
): T {
  const source = useContext(eventSourceContext);
  const [state, setState] = useState<T>(() => callback());
  const realCallback = useCallback(callback, deps);
  useEffect(() => {
    if (source === null) {
      return;
    }
    function listener() {
      setState(realCallback());
    }
    source.addEventListener(name, listener);
    return () => {
      source.removeEventListener(name, listener);
    };
  }, [name, realCallback, source]);
  return state;
}
