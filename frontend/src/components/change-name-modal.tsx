import { useRef } from "preact/hooks";
import { style } from "typestyle";
import { api } from "../api";
import { useAuth } from "../util/auth";
import { useErrorText } from "../util/use-error-text";
import { Input } from "./input";
import { Modal, MODAL_INPUT_STYLE } from "./modal";

export function ChangeNameModal({
  close,
  currentName,
}: {
  close(): void;
  currentName?: string;
}) {
  const { token } = useAuth();
  if (token === null) {
    throw new Error("ChangePasswordModal can only be used while logged in");
  }

  const name = useRef("");
  const [error, setError] = useErrorText();

  return (
    <Modal
      title="Change your name"
      onCancel={close}
      onConfirm={async () => {
        setError(null);
        try {
          if (name.current === "") {
            throw new Error("Please enter a name");
          }
          await api.auth.changeName(token, name.current);
          close();
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
          }
        }
      }}
    >
      <Input
        placeholder="Name"
        value={currentName}
        className={style(MODAL_INPUT_STYLE)}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          name.current = value;
        }}
      />
      {error}
    </Modal>
  );
}
