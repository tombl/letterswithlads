import { navigate, useTitle } from "hookrouter";
import { useState } from "preact/hooks";
import { style } from "typestyle";
import { api } from "../api";
import { AddFriendModal } from "../components/add-friend-modal";
import { Box } from "../components/box";
import { Button } from "../components/button";
import { HomeEntry } from "../components/home-entry";
import { HomeLayout } from "../components/home-layout";
import { Loading } from "../components/loading";
import { LoadingButton } from "../components/loading-button";
import { NameRenderer } from "../components/name-renderer";
import { APP_NAME } from "../config";
import * as colors from "../styles/color";
import { useAuth } from "../util/auth";
import { useEvent } from "../util/events";
import { LOADING, usePromise } from "../util/use-promise";
import { BUTTON_STYLE } from "./home";

export default function Friends() {
  useTitle(`Friends - ${APP_NAME}`);
  const { token } = useAuth();
  if (token === null) {
    navigate("/login", true);
    return null;
  }

  const friends = usePromise(
    useEvent("friends", () => api.friends.getFriends(token), [])
  );

  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <HomeLayout selected="friends">
      {isModalOpen ? (
        <AddFriendModal
          close={() => {
            setModalOpen(false);
          }}
        />
      ) : null}
      {friends === LOADING ? (
        <Loading size="64px" className={style({ margin: "auto" })} />
      ) : (
        <>
          {friends.friends.length === 0 ? null : (
            <>
              <span>Friends</span>
              {friends.friends.map((friend) => (
                <HomeEntry>
                  <Box direction="row" className={style({ marginLeft: "8px" })}>
                    <NameRenderer username={friend} />
                  </Box>
                  <LoadingButton
                    onClick={async () => {
                      await api.friends.removeFriend(token, friend);
                    }}
                    className={style({
                      color: "white",
                      backgroundColor: colors.red,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    })}
                  >
                    ✗
                  </LoadingButton>
                </HomeEntry>
              ))}
            </>
          )}
          {friends.requests.length === 0 ? null : (
            <>
              <span
                className={style({
                  marginTop: friends.friends.length === 0 ? undefined : "16px",
                })}
              >
                Incoming requests
              </span>
              {friends.requests.map((friend) => (
                <HomeEntry>
                  <Box direction="row" className={style({ marginLeft: "8px" })}>
                    <NameRenderer username={friend} />
                  </Box>
                  <LoadingButton
                    onClick={async () => {
                      await api.friends.actionRequest(token, friend, "reject");
                    }}
                    className={style({
                      color: "white",
                      backgroundColor: colors.red,
                      borderRadius: 0,
                    })}
                  >
                    ✗
                  </LoadingButton>
                  <LoadingButton
                    onClick={async () => {
                      await api.friends.actionRequest(token, friend, "accept");
                    }}
                    className={style({
                      color: "white",
                      backgroundColor: colors.green,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    })}
                  >
                    ✓
                  </LoadingButton>
                </HomeEntry>
              ))}
            </>
          )}
          <Button
            className={style(BUTTON_STYLE, {
              marginTop:
                friends.friends.length === 0 && friends.requests.length === 0
                  ? undefined
                  : "16px",
            })}
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Send a friend request
          </Button>
        </>
      )}
    </HomeLayout>
  );
}
