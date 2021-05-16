import { navigate, useTitle } from "hookrouter";
import { useMemo, useState } from "preact/hooks";
import { style } from "typestyle";
import type { Move } from "../../../backend/src/game";
import { api } from "../api";
import { Box } from "../components/box";
import { Loading } from "../components/loading";
import { LoadingButton } from "../components/loading-button";
import { Modal } from "../components/modal";
import { PickBlankModal } from "../components/pick-blank-modal";
import { BoardTile, HandTile } from "../components/tile";
import { APP_NAME } from "../config";
import * as colors from "../styles/color";
import { useAuth } from "../util/auth";
import { useEvent } from "../util/events";
import { LOADING, usePromise } from "../util/use-promise";

const TOP_BAR_PADDING = "16px";
const TOP_BAR_HEIGHT = "clamp(50px, 10vh, 64px)";
const BUTTON_ROW_HEIGHT = "clamp(44px, 10vh, 64px)";

export default function Game({ id }: { id: string }) {
  useTitle(`Game - ${APP_NAME}`);
  const { token } = useAuth();
  if (token === null) {
    navigate("/login", true);
    return null;
  }

  const [selected, setSelected] = useState<
    | { type: "hand"; index: number }
    | { type: "board"; x: number; y: number }
    | null
  >(null);
  const [moves, setMoves] = useState<Move[]>([]);

  const [pickBlankModal, setPickBlankModal] = useState<Omit<
    Move,
    "letter"
  > | null>(null);

  const myName = usePromise(
    useMemo(
      async () =>
        await api.auth.getNameFromUsername(
          token,
          await api.auth.getLoggedInUsername(token)
        ),
      []
    )
  );

  const promise = useEvent(
    "game",
    () => ({
      game: api.game.getClientGame(token, id),
      scores: api.game.getScores(token, id),
    }),
    []
  );
  const game = usePromise(promise.game);
  const scores = usePromise(promise.scores);
  const otherNamePromise = usePromise(
    useMemo(
      async () =>
        await api.auth.getNameFromUsername(
          token,
          (await promise.game).otherUsername
        ),
      [promise.game]
    )
  );
  const [error, setError] = useState<string | null>(null);

  function theoreticalMove(
    pieceIndex: number,
    x: number,
    y: number,
    fromBlank?: string
  ) {
    if (game === LOADING || !game.myTurn) {
      setSelected(null);
      return;
    }

    const piece = game.hand[pieceIndex];
    if (piece === " " && fromBlank === undefined) {
      setPickBlankModal({ piece: pieceIndex, position: [x, y] });
      return;
    }

    setMoves([
      ...moves,
      { position: [x, y], piece: pieceIndex, letter: fromBlank ?? piece },
    ]);
    setSelected(null);
  }

  const boardWithMoves = useMemo(() => {
    if (game === LOADING) {
      return LOADING;
    }
    const board = game.board.map((row) => [...row]);
    for (const {
      letter,
      position: [x, y],
    } of moves) {
      board[y][x] = letter;
    }
    return board;
  }, [game, moves]);

  const handWithMoves = useMemo(() => {
    if (game === LOADING) {
      return LOADING;
    }
    return game.hand
      .map((letter, index) => ({ letter, index }))
      .filter(({ index }) => !moves.map(({ piece }) => piece).includes(index));
  }, [game, moves]);

  return (
    <Box
      direction="column"
      className={style({ backgroundColor: colors.primary })}
    >
      {game === LOADING || scores === LOADING || !game.ended ? null : (
        <Modal
          title={
            scores[0] > scores[1]
              ? "You won!"
              : scores[0] < scores[1]
              ? "You lost"
              : "It's a draw!"
          }
          oneButton
          confirmText="Go home"
          onConfirm={async () => {
            await api.game.acknowledgeEnd(token, id);
            navigate("/");
          }}
        >
          The final score was {scores[0]} to {scores[1]}
        </Modal>
      )}
      {pickBlankModal === null ? null : (
        <PickBlankModal
          onConfirm={(piece) => {
            setPickBlankModal(null);
            theoreticalMove(
              pickBlankModal.piece,
              pickBlankModal.position[0],
              pickBlankModal.position[1],
              piece
            );
          }}
          onCancel={() => {
            setSelected(null);
            setPickBlankModal(null);
          }}
        />
      )}
      <Box direction="row" grow={false}>
        <Box
          direction="row"
          spacing="8px"
          className={style({
            height: TOP_BAR_HEIGHT,
            padding: `${TOP_BAR_PADDING} 0 ${TOP_BAR_PADDING} ${TOP_BAR_PADDING}`,
            alignItems: "center",
          })}
        >
          <span className={style({ fontWeight: "bold" })}>
            {myName === LOADING ? <Loading /> : myName}
          </span>
          <span className={style({ marginRight: "auto" })}>
            {scores === LOADING ? <Loading /> : scores[0]}
          </span>
        </Box>
        <Box
          direction="row"
          spacing="8px"
          className={style({
            height: TOP_BAR_HEIGHT,
            alignItems: "center",
            padding: `${TOP_BAR_PADDING} ${TOP_BAR_PADDING} ${TOP_BAR_PADDING} 0`,
          })}
        >
          <span className={style({ marginLeft: "auto" })}>
            {scores === LOADING ? <Loading /> : scores[1]}
          </span>
          <span className={style({ fontWeight: "bold" })}>
            {otherNamePromise === LOADING ? <Loading /> : otherNamePromise}
          </span>
        </Box>
      </Box>
      <Box
        direction="row"
        shrink
        className={style({
          backgroundColor: colors.primaryDark,
        })}
      >
        {boardWithMoves === LOADING || game === LOADING ? (
          <Loading size="64px" className={style({ margin: "auto" })} />
        ) : (
          <Box
            direction="column"
            className={style({
              margin: "auto",
              height: "100%",
              maxHeight: "100vw",
              maxWidth: `calc(100vh - 80px - ${TOP_BAR_HEIGHT} - ${BUTTON_ROW_HEIGHT})`,
            })}
          >
            {boardWithMoves.map((row, y) => (
              <Box direction="row">
                {row.map((letter, x) => {
                  const isTheoreticalMove =
                    moves.find(
                      (move) => move.position[0] === x && move.position[1] === y
                    ) !== undefined;
                  return (
                    <BoardTile
                      raised={
                        selected?.type === "board" &&
                        selected.x === x &&
                        selected.y === y
                      }
                      onClick={() => {
                        const moveIndex = moves.findIndex(
                          (move) =>
                            move.position[0] === x && move.position[1] === y
                        );
                        if (moveIndex !== -1) {
                          setMoves([
                            ...moves.slice(0, moveIndex),
                            ...moves.slice(moveIndex + 1),
                          ]);
                        } else if (
                          selected?.type === "hand" &&
                          game.board[y][x] === undefined
                        ) {
                          theoreticalMove(selected.index, x, y);
                        } else if (
                          selected?.type === "board" &&
                          selected.x === x &&
                          selected.y === y
                        ) {
                          setSelected(null);
                        } else if (game.board[y][x] === undefined) {
                          setSelected({ type: "board", x, y });
                        }
                      }}
                      neighbours={{
                        top:
                          letter !== undefined &&
                          !isTheoreticalMove &&
                          game.board[y - 1]?.[x] !== undefined,
                        left:
                          letter !== undefined &&
                          !isTheoreticalMove &&
                          game.board[y][x - 1] !== undefined,
                        bottom:
                          letter !== undefined &&
                          !isTheoreticalMove &&
                          game.board[y + 1]?.[x] !== undefined,
                        right:
                          letter !== undefined &&
                          !isTheoreticalMove &&
                          game.board[y][x + 1] !== undefined,
                      }}
                      letter={letter}
                      className={style({
                        fontSize: "min(3.5vw, 3.5vh)",
                      })}
                    />
                  );
                })}
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Box
        direction="row"
        grow={false}
        className={style({
          backgroundColor: colors.primaryDark,
        })}
      >
        {game === LOADING || !game.myTurn ? (
          <Box
            direction="row"
            className={style({
              backgroundColor: colors.primary,
              height: BUTTON_ROW_HEIGHT,
            })}
          >
            {game === LOADING ? (
              <Loading />
            ) : (
              <span className={style({ margin: "auto" })}>Not your turn</span>
            )}
          </Box>
        ) : (
          <>
            <Box
              direction="row"
              className={style({
                height: BUTTON_ROW_HEIGHT,
              })}
            >
              <LoadingButton
                onClick={async () => {
                  setMoves([]);
                  await api.game.doMove(token, id, [], true);
                }}
                className={style({
                  backgroundColor: colors.yellow,
                  color: "white",
                  fontWeight: "bold",
                  width: "100%",
                  borderBottomLeftRadius: "0 !important",
                  borderBottomRightRadius: "0 !important",
                })}
              >
                Pass
              </LoadingButton>
            </Box>
            <Box
              direction="row"
              grow={2}
              className={style({
                height: BUTTON_ROW_HEIGHT,
              })}
            >
              <LoadingButton
                onClick={async () => {
                  try {
                    await api.game.doMove(token, id, moves, false);
                    setMoves([]);
                    setError(null);
                  } catch (error: unknown) {
                    if (error instanceof Error) {
                      setError(error.message);
                    }
                  }
                }}
                className={style({
                  backgroundColor: colors.primary,
                  fontSize: error === null ? "24px" : undefined,
                  color: "white",
                  fontWeight: error === null ? "bold" : undefined,
                  width: "100%",
                  borderBottomLeftRadius: "0 !important",
                  borderBottomRightRadius: "0 !important",
                })}
              >
                {error === null ? "Play" : error}
              </LoadingButton>
            </Box>
          </>
        )}
      </Box>
      <Box
        direction="row"
        grow={false}
        spacing="2vw"
        className={style({
          fontSize: "min(24px, 5vw)",
          padding: "16px",
          margin: "0 auto",
        })}
      >
        {handWithMoves === LOADING || game === LOADING ? (
          <Loading />
        ) : (
          handWithMoves.map(({ letter, index }) => (
            <HandTile
              letter={letter}
              raised={selected?.type === "hand" && selected.index === index}
              onClick={() => {
                if (selected?.type === "board") {
                  theoreticalMove(index, selected.x, selected.y);
                } else if (
                  selected?.type === "hand" &&
                  selected.index === index
                ) {
                  setSelected(null);
                } else {
                  setSelected({ type: "hand", index });
                }
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
