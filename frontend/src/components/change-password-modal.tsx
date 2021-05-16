import { useMemo } from "preact/hooks";
import { style } from "typestyle";
import { api } from "../api";
import { useAuth } from "../util/auth";
import { useErrorText } from "../util/use-error-text";
import { Input } from "./input";
import { Modal, MODAL_INPUT_STYLE } from "./modal";

export function ChangePasswordModal({ close }: { close(): void }) {
  const { token } = useAuth();
  if (token === null) {
    throw new Error("ChangePasswordModal can only be used while logged in");
  }

  const form = useMemo(() => ({ current: "", new: "", confirm: "" }), []);
  const [error, setError] = useErrorText();

  return (
    <Modal
      title="Change your password"
      onCancel={close}
      onConfirm={async () => {
        setError(null);
        try {
          if (form.new !== form.confirm) {
            throw new Error("The passwords don't match");
          }
          if (form.new === "") {
            throw new Error("Please enter a password");
          }
          await api.auth.changePassword(token, form.current, form.new);
          close();
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
          }
        }
      }}
    >
      <Input
        type="password"
        placeholder="Current password"
        className={style(MODAL_INPUT_STYLE)}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.current = value;
        }}
      />
      <Input
        type="password"
        placeholder="New password"
        className={style(MODAL_INPUT_STYLE)}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.new = value;
        }}
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        className={style(MODAL_INPUT_STYLE)}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          form.confirm = value;
        }}
      />
      {error}
    </Modal>
  );
}
