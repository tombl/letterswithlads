import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { authKey, users } from "./datastores.js";
import { ClientError } from "./index.js";

export interface AuthToken {
  type: "AuthToken";
  token: string;
}

export function hashPassword({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  return promisify(scrypt)(password, username, 64) as Promise<Buffer>;
}

export function getUserFromToken(token: AuthToken) {
  const username = getUsernameFromToken(token);
  if (username === null) {
    throw new ClientError("Invalid token");
  }
  const user = users.data.get(username);
  if (user === undefined) {
    throw new ClientError("User not found", 404);
  }
  return user;
}

export function getUsernameFromToken({ token }: AuthToken) {
  const [encodedIv, encodedEncrypted] = token.split(".");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    authKey.data,
    Buffer.from(encodedIv, "base64")
  );
  return decipher.update(encodedEncrypted, "base64", "utf8");
}

export function createTokenForUsername(username: string): AuthToken {
  const data = username;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", authKey.data, iv);
  return {
    type: "AuthToken",
    token: `${iv.toString("base64")}.${Buffer.concat([
      cipher.update(data),
      cipher.final(),
    ]).toString("base64")}`,
  };
}
