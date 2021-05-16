import { AuthToken, getUserFromToken } from "../auth.js";
import { users } from "../datastores.js";
import { broadcast, ClientError } from "../index.js";

export async function sendRequest(token: AuthToken, otherUsername: string) {
  const user = getUserFromToken(token);
  const otherUser = users.data.get(otherUsername);
  if (otherUser === undefined) {
    throw new ClientError("User not found", 404);
  }

  if (otherUsername === user.username) {
    throw new ClientError("You can't send a friend request to yourself");
  }

  if (otherUser.friends.includes(user.username)) {
    throw new ClientError("You're already friends with that user");
  }

  if (otherUser.incomingFriendRequests.includes(user.username)) {
    throw new ClientError("You already have a friend request sent");
  }

  if (user.incomingFriendRequests.includes(otherUser.username)) {
    throw new ClientError("You already have a friend request from that user");
  }

  otherUser.incomingFriendRequests.push(user.username);
  broadcast(otherUser.username, "friends");
}

export async function actionRequest(
  token: AuthToken,
  otherUsername: string,
  action: "accept" | "reject"
) {
  const user = getUserFromToken(token);
  const newRequests = user.incomingFriendRequests.filter(
    (username) => username !== otherUsername
  );
  if (user.incomingFriendRequests.length === newRequests.length) {
    throw new ClientError("You don't have a friend request from that user");
  }

  user.incomingFriendRequests = newRequests;

  const otherUser = users.data.get(otherUsername)!;
  if (action === "accept") {
    user.friends.push(otherUsername);
    otherUser.friends.push(user.username);
    broadcast(otherUsername, "friends");
  }
  broadcast(user.username, "friends");
}

export async function removeFriend(token: AuthToken, otherUsername: string) {
  const user = getUserFromToken(token);

  const newFriendsList = user.friends.filter(
    (friend) => friend !== otherUsername
  );
  if (newFriendsList.length === user.friends.length) {
    throw new ClientError("You aren't friends with that user");
  }

  const otherUser = users.data.get(otherUsername)!;

  user.friends = newFriendsList;
  otherUser.friends = otherUser.friends.filter(
    (friend) => friend !== user.username
  );

  broadcast(user.username, "friends");
  broadcast(otherUsername, "friends");
}

export async function getFriends(token: AuthToken) {
  const user = getUserFromToken(token);
  return { friends: user.friends, requests: user.incomingFriendRequests };
}
