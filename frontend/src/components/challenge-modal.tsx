import { navigate } from "hookrouter";
import { useRef } from "preact/hooks";
import { style } from "typestyle";
import { api } from "../api";
import { MODAL_INPUT_STYLE } from "../components/modal";
import { useAuth } from "../util/auth";
import { useEvent } from "../util/events";
import { useErrorText } from "../util/use-error-text";
import { LOADING, usePromise } from "../util/use-promise";
import { Modal } from "./modal";
import { NameRenderer } from "./name-renderer";

export function ChallengeModal({ close }: { close(): void }) {
  const { token } = useAuth();
  if (token === null) {
    throw new Error("ChallengeModal can only be used while logged in");
  }

  const [error, setError] = useErrorText();
  const username = useRef<string | null>(null);
  const friends = usePromise(
    useEvent(
      "friends",
      async () => (await api.friends.getFriends(token)).friends,
      []
    )
  );

  return (
    <Modal
      title="Challenge someone to a game"
      onCancel={() => {
        close();
      }}
      confirmText="Challenge"
      onConfirm={async () => {
        setError(null);
        try {
          if (username.current === "" || username.current === null) {
            throw new Error("Please select a person to play against");
          }
          const id = await api.game.startGame(token, username.current);
          close();
          navigate(`/game/${id}`);
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
          }
        }
      }}
    >
      <select
        className={style(MODAL_INPUT_STYLE, {
          borderRadius: 8,
          border: "none",
          padding: 8,
        })}
        onChange={(e) => {
          const { value } = e.target as HTMLSelectElement;
          username.current = value;
        }}
      >
        <option value="">Choose a person</option>
        {(friends === LOADING ? [] : friends).map((username) => (
          <option value={username}>
            <NameRenderer username={username} />
          </option>
        ))}
      </select>
      {error}
    </Modal>
  );
}
