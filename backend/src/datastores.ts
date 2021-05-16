import { randomBytes, scryptSync } from "crypto";
import { Datastore } from "./datastore.js";
import type { Piece } from "./game.js";

export const authKey = new Datastore("authKey", () =>
  scryptSync(randomBytes(64), "securesalt", 32)
);

export interface User {
  username: string;
  name: string;
  hashedPassword: Buffer;
  friends: string[];
  incomingFriendRequests: string[];
  ongoingGames: string[];
  lastSeen: Date;
}
export const users = new Datastore("users", () => new Map<string, User>());

export interface Game {
  board: Array<Array<Piece | undefined>>;
  ended: boolean;
  players: [
    {
      username: string;
      hand: string[];
      pass: boolean;
      acknowledgedEnded: boolean;
    },
    {
      username: string;
      hand: string[];
      pass: boolean;
      acknowledgedEnded: boolean;
    }
  ];
  lastUpdate: number;
  bag: string[];
  currentTurn: number;
}
export const games = new Datastore("games", () => new Map<string, Game>());
