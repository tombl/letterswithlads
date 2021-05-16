import { useRef } from "preact/hooks";
import { style } from "typestyle";
import { api } from "../api";
import { useAuth } from "../util/auth";
import { useErrorText } from "../util/use-error-text";
import { Input } from "./input";
import { Modal, MODAL_INPUT_STYLE } from "./modal";

export function AddFriendModal({ close }: { close(): void }) {
  const username = useRef("");
  const [error, setError] = useErrorText();
  const { token } = useAuth();
  if (token === null) {
    throw new Error("AddFriendModal can only be used while logged in");
  }

  return (
    <Modal
      title="Send a friend request"
      onCancel={close}
      confirmText="Send"
      onConfirm={async () => {
        setError(null);
        try {
          if (username.current === "") {
            throw new Error("Please enter a username");
          }
          await api.friends.sendRequest(token, username.current);
          close();
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
          }
        }
      }}
    >
      <Input
        placeholder="Username"
        className={style(MODAL_INPUT_STYLE)}
        onChange={(e) => {
          const { value } = e.target as HTMLInputElement;
          username.current = value;
        }}
      />
      {error}
    </Modal>
  );
}
