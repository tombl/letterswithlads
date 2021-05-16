import { navigate, useTitle } from "hookrouter";
import { useMemo } from "preact/hooks";
import { style } from "typestyle";
import { api } from "../api";
import { AuthLayout } from "../components/auth-layout";
import { Input } from "../components/input";
import { LoadingButton } from "../components/loading-button";
import { APP_NAME } from "../config";
import { useAuth } from "../util/auth";
import { useErrorText } from "../util/use-error-text";
import { BUTTON_STYLE, INPUT_STYLE } from "./login";

export default function Signup() {
  useTitle(`Sign up - ${APP_NAME}`);
  const form = useMemo(
    () => ({ username: "", name: "", password: "", confirmPassword: "" }),
    []
  );
  const [error, setError] = useErrorText();
  const auth = useAuth();

  return (
    <AuthLayout title={<h2 className={style({ margin: "auto" })}>Sign Up</h2>}>
      <Input
        type="text"
        placeholder="Username"
        className={style(INPUT_STYLE)}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.username = value;
        }}
      />
      <Input
        type="text"
        placeholder="Name"
        className={style(INPUT_STYLE)}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.name = value;
        }}
      />
      <Input
        type="password"
        placeholder="Password"
        className={style(INPUT_STYLE, { marginTop: "4px" })}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.password = value;
        }}
      />
      <Input
        type="password"
        placeholder="Confirm password"
        className={style(INPUT_STYLE)}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.confirmPassword = value;
        }}
      />
      {error}
      <LoadingButton
        className={style(BUTTON_STYLE, { marginTop: "4px", flex: "0" })}
        onClick={async () => {
          setError(null);
          const { username, name, password, confirmPassword } = form;

          try {
            if (username === "") {
              throw new Error("Please enter a username");
            }
            if (name === "") {
              throw new Error("Please enter a name");
            }
            if (password === "") {
              throw new Error("Please enter a password");
            }
            if (password !== confirmPassword) {
              throw new Error("The passwords don't match");
            }
            await api.auth.signup({ username, name, password });
            auth.token = await api.auth.login({ username, password });
            navigate("/");
          } catch (error: unknown) {
            if (error instanceof Error) {
              setError(error.message);
            }
          }
        }}
      >
        Sign up
      </LoadingButton>
    </AuthLayout>
  );
}
