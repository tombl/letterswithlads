import { useState } from "preact/hooks";
import { style } from "typestyle";
import { useErrorText } from "../util/use-error-text";
import { Box } from "./box";
import { Modal } from "./modal";
import { HandTile } from "./tile";

export function PickBlankModal({
  onCancel,
  onConfirm,
}: {
  onCancel(): void;
  onConfirm(piece: string): void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useErrorText();

  return (
    <Modal
      title="What piece do you want the blank to be?"
      onCancel={() => {
        onCancel();
      }}
      onConfirm={() => {
        setError(null);
        try {
          if (selected === null) {
            throw new Error("Please choose a piece");
          }
          onConfirm(selected);
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
          }
        }
      }}
    >
      <Box direction="row" wrap>
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
          <HandTile
            className={style({
              fontSize: "max(16px, min(24px, 5vh, 5vw))",
              margin: "0 auto",
            })}
            raised={letter === selected}
            letter={letter}
            onClick={() => {
              setSelected(selected === letter ? null : letter);
            }}
          />
        ))}
      </Box>
      {error}
    </Modal>
  );
}
