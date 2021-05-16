import { useMemo } from "preact/hooks";
import { api } from "../api";
import { useAuth } from "../util/auth";
import { LOADING, usePromise } from "../util/use-promise";
import { Loading } from "./loading";

export function NameRenderer({ username }: { username: string }) {
  const { token } = useAuth();
  if (token === null) {
    throw new Error("ChallengeModal can only be used while logged in");
  }

  const name = usePromise(
    useMemo(async () => api.auth.getNameFromUsername(token, username), [])
  );

  return name === LOADING ? <Loading /> : <>{name}</>;
}
