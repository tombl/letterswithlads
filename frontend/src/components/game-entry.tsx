import { navigate } from "hookrouter";
import prettyMilliseconds from "pretty-ms";
import { style } from "typestyle";
import { api } from "../api";
import { useAuth } from "../util/auth";
import { useEvent } from "../util/events";
import { LOADING, usePromise } from "../util/use-promise";
import { Box } from "./box";
import { HomeEntry } from "./home-entry";
import { Loading } from "./loading";
import { NameRenderer } from "./name-renderer";

export function GameEntry({
  id,
  game,
}: {
  id: string;
  game: ReturnType<
    typeof import("../../../backend/src/api").game.getClientGame
  > extends Promise<infer T>
    ? T
    : never;
}) {
  const { token } = useAuth();
  if (token === null) {
    throw new Error("GameEntry can only be used while logged in");
  }

  const scores = usePromise(
    useEvent("game", () => api.game.getScores(token, id), [])
  );

  return (
    <HomeEntry>
      <Box
        direction="row"
        className={style({
          margin: "4px 16px",
          minHeight: "32px",
          alignItems: "center",
        })}
        onClick={() => {
          navigate(`/game/${id}`);
        }}
      >
        <Box direction="row">
          <span className={style({ marginRight: "auto", fontWeight: "bold" })}>
            <NameRenderer username={game.otherUsername} />
          </span>
        </Box>
        <Box direction="row">
          <span className={style({ margin: "auto" })}>
            {scores === LOADING ? <Loading /> : `${scores[0]} vs ${scores[1]}`}
          </span>
        </Box>
        <Box direction="row" className={style({ textAlign: "right" })}>
          <span className={style({ marginLeft: "auto" })}>
            {Date.now() - game.lastUpdate < 5000
              ? "now"
              : `${prettyMilliseconds(Date.now() - game.lastUpdate, {
                  compact: true,
                })} ago`}
          </span>
        </Box>
      </Box>
    </HomeEntry>
  );
}
