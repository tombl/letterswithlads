import { navigate, useTitle } from "hookrouter";
import { useMemo } from "preact/hooks";
import { style } from "typestyle";
import type { NestedCSSProperties } from "typestyle/lib/types";
import { api } from "../api";
import { AuthLayout } from "../components/auth-layout";
import { Box } from "../components/box";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { LoadingButton } from "../components/loading-button";
import { APP_NAME } from "../config";
import * as colors from "../styles/color";
import { useAuth } from "../util/auth";
import { useErrorText } from "../util/use-error-text";

export const BUTTON_STYLE: NestedCSSProperties = {
  backgroundColor: colors.primary,
  color: "white",
  flex: 1,
  fontSize: "1.2em",
  fontWeight: "bold",
  $nest: {
    "&:active": {
      backgroundColor: colors.primaryDarker,
      color: colors.secondary,
    },
  },
};
export const INPUT_STYLE: NestedCSSProperties = {
  backgroundColor: "white",
  $nest: {
    "&::placeholder": {
      color: "#555",
    },
  },
};

export default function Login() {
  useTitle(`Log in - ${APP_NAME}`);
  const form = useMemo(() => ({ username: "", password: "" }), []);
  const [error, setError] = useErrorText();
  const auth = useAuth();

  return (
    <AuthLayout
      title={
        <h1
          className={style({
            margin: "auto",
            fontSize: "min(10vw, 2em)",
          })}
        >
          {APP_NAME}
        </h1>
      }
    >
      <Input
        type="text"
        className={style(INPUT_STYLE)}
        placeholder="Username"
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.username = value;
        }}
      />
      <Input
        type="password"
        className={style(INPUT_STYLE)}
        placeholder="Password"
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.password = value;
        }}
      />
      {error}
      <Box direction="row" grow={false} spacing="8px">
        <Button
          className={style(BUTTON_STYLE)}
          onClick={() => {
            navigate("/signup");
          }}
        >
          Sign up
        </Button>
        <LoadingButton
          className={style(BUTTON_STYLE)}
          onClick={async () => {
            setError(null);
            const { username, password } = form;

            try {
              if (username === "") {
                throw new Error("Please enter a username");
              }
              if (password === "") {
                throw new Error("Please enter a password");
              }
              auth.token = await api.auth.login({ username, password });
              navigate("/");
            } catch (error: unknown) {
              if (error instanceof Error) {
                setError(error.message);
              }
            }
          }}
        >
          Login
        </LoadingButton>
      </Box>
    </AuthLayout>
  );
}
