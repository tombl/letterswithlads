import { timingSafeEqual } from "crypto";
import {
  AuthToken,
  createTokenForUsername,
  getUserFromToken,
  getUsernameFromToken,
  hashPassword,
} from "../auth.js";
import { User, users } from "../datastores.js";
import { broadcast, ClientError } from "../index.js";

export async function getLoggedInUsername(token: AuthToken) {
  return getUsernameFromToken(token);
}

export async function getClientUser(
  token: AuthToken
): Promise<Omit<User, "hashedPassword">> {
  const { hashedPassword, ...user } = getUserFromToken(token);
  return user;
}

export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<AuthToken> {
  const user = users.data.get(username);
  if (user === undefined) {
    throw new ClientError("That user does not exist");
  }
  if (
    !timingSafeEqual(
      user.hashedPassword,
      await hashPassword({ username, password })
    )
  ) {
    throw new ClientError("Wrong password");
  }

  return createTokenForUsername(username);
}

export async function signup({
  username,
  name,
  password,
}: {
  username: string;
  name: string;
  password: string;
}) {
  if (users.data.has(username)) {
    throw new ClientError("This user already exists");
  }

  users.data.set(username, {
    username,
    name,
    friends: [],
    hashedPassword: await hashPassword({ username, password }),
    incomingFriendRequests: [],
    ongoingGames: [],
    lastSeen: new Date(),
  });
}

export async function changePassword(
  token: AuthToken,
  currentPassword: string,
  newPassword: string
) {
  const user = getUserFromToken(token);
  if (
    !timingSafeEqual(
      user.hashedPassword,
      await hashPassword({ username: user.username, password: currentPassword })
    )
  ) {
    throw new ClientError("Current password incorrect");
  }
  user.hashedPassword = await hashPassword({
    username: user.username,
    password: newPassword,
  });
}

export async function changeName(token: AuthToken, name: string) {
  const user = getUserFromToken(token);
  user.name = name;
  broadcast(user.username, "name");
  for (const friend of user.friends) {
    broadcast(friend, "friends");
  }
}

export async function getNameFromUsername(token: AuthToken, username: string) {
  const user = getUserFromToken(token);

  if (
    !(
      username === user.username ||
      user.friends.includes(username) ||
      user.incomingFriendRequests.includes(username)
    )
  ) {
    throw new ClientError("You aren't friends with that person", 403);
  }

  return users.data.get(username)!.name;
}
