import { ComponentChildren, createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { AuthToken } from "../../../backend/src/auth";

export interface AuthManager {
  token: AuthToken | null;
}

export class AuthManagerImpl implements AuthManager {
  get token() {
    const token = localStorage.getItem("token");
    return token === null ? null : ({ type: "AuthToken", token } as const);
  }
  set token(token) {
    if (token === null) {
      localStorage.removeItem("token");
    } else {
      localStorage.setItem("token", token.token);
    }
    this.callbacks.forEach((callback) => {
      callback();
    });
  }

  callbacks = new Set<() => void>();
}

const authManagerContext = createContext<AuthManagerImpl | null>(null);

export function AuthProvider({ children }: { children: ComponentChildren }) {
  return (
    <authManagerContext.Provider value={new AuthManagerImpl()}>
      {children}
    </authManagerContext.Provider>
  );
}

export function useAuth(): AuthManager {
  const auth = useContext(authManagerContext);
  if (auth === null) {
    throw new Error("useAuth must be called in a descendant of AuthProvider");
  }
  const [, setState] = useState(true);
  useEffect(() => {
    function callback() {
      setState((state) => !state);
    }
    auth.callbacks.add(callback);
    return () => {
      auth.callbacks.delete(callback);
    };
  });
  return auth;
}
