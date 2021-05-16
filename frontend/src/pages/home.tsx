import { navigate, useTitle } from "hookrouter";
import { useState } from "preact/hooks";
import { style } from "typestyle";
import type { NestedCSSProperties } from "typestyle/lib/types";
import { api } from "../api";
import { Button } from "../components/button";
import { ChallengeModal } from "../components/challenge-modal";
import { GameEntry } from "../components/game-entry";
import { HomeLayout } from "../components/home-layout";
import { Loading } from "../components/loading";
import { APP_NAME } from "../config";
import * as colors from "../styles/color";
import { useAuth } from "../util/auth";
import { useEvent } from "../util/events";
import { LOADING, usePromise } from "../util/use-promise";

export const BUTTON_STYLE: NestedCSSProperties = {
  backgroundColor: colors.primaryDarker,
  border: `1px solid ${colors.primaryDarker} !important`,
  color: "white",
  $nest: {
    "&:active": {
      backgroundColor: colors.primaryDark,
    },
  },
};

export default function Home() {
  useTitle(APP_NAME);
  const { token } = useAuth();
  if (token === null) {
    navigate("/login", true);
    return null;
  }

  const games = usePromise(
    useEvent(
      "games",
      async () => {
        const games = await Promise.all(
          (await api.game.getAllGames(token)).map(async (id) => ({
            id,
            game: await api.game.getClientGame(token, id),
          }))
        );
        return {
          myTurnGames: games.filter(({ game }) => game.myTurn),
          otherTurnGames: games.filter(({ game }) => !game.myTurn),
        };
      },
      []
    )
  );

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <HomeLayout selected="home">
      {modalOpen ? (
        <ChallengeModal
          close={() => {
            setModalOpen(false);
          }}
        />
      ) : null}
      {games === LOADING ? (
        <Loading size="64px" className={style({ margin: "auto" })} />
      ) : (
        <>
          {games.myTurnGames.length === 0 ? null : (
            <>
              <span>Your turn</span>
              {games.myTurnGames.map(({ id, game }) => (
                <GameEntry id={id} game={game} />
              ))}
            </>
          )}
          {games.otherTurnGames.length === 0 ? null : (
            <>
              <span
                className={style({
                  marginTop:
                    games.myTurnGames.length === 0 ? undefined : "16px",
                })}
              >
                Their turn
              </span>
              {games.otherTurnGames.map(({ id, game }) => (
                <GameEntry id={id} game={game} />
              ))}
            </>
          )}
          <Button
            className={style(BUTTON_STYLE, {
              marginTop:
                games.myTurnGames.length === 0 &&
                games.otherTurnGames.length === 0
                  ? undefined
                  : "16px",
            })}
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Challenge someone to a game
          </Button>
        </>
      )}
    </HomeLayout>
  );
}
