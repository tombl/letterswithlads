import { navigate, useTitle } from "hookrouter";
import { useMemo, useState } from "preact/hooks";
import { style } from "typestyle";
import { api } from "../api";
import { Button } from "../components/button";
import { ChangeNameModal } from "../components/change-name-modal";
import { ChangePasswordModal } from "../components/change-password-modal";
import { HomeLayout } from "../components/home-layout";
import { Loading } from "../components/loading";
import { APP_NAME } from "../config";
import { useAuth } from "../util/auth";
import { useEvent } from "../util/events";
import { LOADING, usePromise } from "../util/use-promise";
import { BUTTON_STYLE } from "./home";

export default function Settings() {
  useTitle(`Settings - ${APP_NAME}`);
  const auth = useAuth();
  const { token } = auth;
  if (token === null) {
    navigate("/login", true);
    return null;
  }
  const [modal, openModal] = useState<"password" | "name" | null>(null);

  const usernamePromise = useMemo(
    () => api.auth.getLoggedInUsername(token),
    []
  );
  const username = usePromise(usernamePromise);
  const name = usePromise(
    useEvent(
      "name",
      async () => api.auth.getNameFromUsername(token, await usernamePromise),
      []
    )
  );

  return (
    <HomeLayout selected="settings">
      {modal === "name" ? (
        <ChangeNameModal
          currentName={name === LOADING ? undefined : name}
          close={() => {
            openModal(null);
          }}
        />
      ) : modal === "password" ? (
        <ChangePasswordModal
          close={() => {
            openModal(null);
          }}
        />
      ) : null}
      {/* <span>Account</span> */}
      <Button className={style(BUTTON_STYLE)}>
        Username: {username === LOADING ? <Loading /> : username}
      </Button>
      <Button
        className={style(BUTTON_STYLE)}
        onClick={() => {
          openModal("name");
        }}
      >
        Name: {name === LOADING ? <Loading /> : name}
      </Button>
      <Button
        className={style(BUTTON_STYLE)}
        onClick={() => {
          openModal("password");
        }}
      >
        Password: ••••••••
      </Button>
      <Button
        className={style(BUTTON_STYLE)}
        onClick={() => {
          auth.token = null;
        }}
      >
        Log out
      </Button>
    </HomeLayout>
  );
}
