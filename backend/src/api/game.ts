import { nanoid } from "nanoid";
import { AuthToken, getUserFromToken } from "../auth.js";
import { games, User, users } from "../datastores.js";
import {
  applyMoves,
  BOARD_SIZE,
  getScoresFromBoard,
  getShuffledBag,
  HAND_SIZE,
  isValidMove,
  LETTER_WEIGHTS,
  Move,
  words,
} from "../game.js";
import { broadcast, ClientError } from "../index.js";

function getGameFromID(gameID: string) {
  const game = games.data.get(gameID);
  if (game === undefined) {
    throw new ClientError("That game doesn't exist", 404);
  }
  return game;
}

function getUsersGameFromID(user: User, gameID: string) {
  const game = getGameFromID(gameID);
  const thisPlayerIndex = game.players.findIndex(
    ({ username }) => username === user.username
  );
  const otherPlayerIndex = thisPlayerIndex === 0 ? 1 : 0;
  if (thisPlayerIndex === -1) {
    throw new ClientError("You aren't in that game", 401);
  }
  return { thisPlayerIndex, otherPlayerIndex, game };
}

export async function startGame(token: AuthToken, otherUsername: string) {
  const user = getUserFromToken(token);
  if (!user.friends.includes(otherUsername)) {
    throw new ClientError("You aren't friends with that person", 403);
  }

  const otherUser = users.data.get(otherUsername);
  if (otherUser === undefined) {
    throw new ClientError("That person doesn't exist", 404);
  }

  const bag = getShuffledBag();

  const id = nanoid();
  games.data.set(id, {
    bag,
    board: Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => undefined)
    ),
    lastUpdate: Date.now(),
    players: [
      {
        username: user.username,
        hand: Array.from({ length: HAND_SIZE }, () => bag.pop()!).sort(),
        pass: false,
        acknowledgedEnded: false,
      },
      {
        username: otherUsername,
        hand: Array.from({ length: HAND_SIZE }, () => bag.pop()!).sort(),
        pass: false,
        acknowledgedEnded: false,
      },
    ],
    currentTurn: 0,
    ended: false,
  });

  user.ongoingGames.push(id);
  otherUser.ongoingGames.push(id);

  broadcast(user.username, "games");
  broadcast(otherUser.username, "games");

  return id;
}

export async function validateMove(
  token: AuthToken,
  gameID: string,
  moves: Move[]
) {
  const user = getUserFromToken(token);
  const { game, thisPlayerIndex } = getUsersGameFromID(user, gameID);

  return isValidMove(game, thisPlayerIndex, moves);
}

export async function doMove(
  token: AuthToken,
  gameID: string,
  moves: Move[],
  pass: boolean
) {
  const user = getUserFromToken(token);
  const { game, otherPlayerIndex, thisPlayerIndex } = getUsersGameFromID(
    user,
    gameID
  );

  if (game.ended) {
    throw new ClientError("This game has finished");
  }

  if (game.currentTurn !== thisPlayerIndex) {
    throw new ClientError("It's not your turn");
  }

  if (pass) {
    game.players[thisPlayerIndex].pass = true;
    if (game.players[otherPlayerIndex].pass) {
      game.ended = true;
    }
  } else {
    let hand = [...game.players[thisPlayerIndex].hand].map((piece, index) => ({
      piece,
      index,
    }));
    const extraPieces: string[] = [];
    const newBag = [...game.bag];

    for (const { piece, letter } of moves) {
      const handPiece = hand.find(({ index }) => index === piece);
      const newHand = hand.filter(({ index }) => index !== piece);
      if (handPiece === undefined) {
        throw new ClientError("You don't have that piece in your hand");
      }
      if (!(handPiece.piece === letter || handPiece.piece === " ")) {
        throw new ClientError("That piece isn't that letter");
      }
      hand = newHand;
      const replacementPiece = newBag.pop();
      if (replacementPiece !== undefined) {
        extraPieces.push(replacementPiece);
      }
    }

    const validatedMove = isValidMove(game, thisPlayerIndex, moves);
    if (!validatedMove.valid) {
      throw new ClientError(validatedMove.reason);
    }

    game.board = applyMoves(game, thisPlayerIndex, moves)!;
    game.players[thisPlayerIndex].hand = [
      ...hand.map(({ piece }) => piece),
      ...extraPieces,
    ].sort();
    game.players[otherPlayerIndex].pass = false;
    game.bag = newBag;
  }

  game.currentTurn = otherPlayerIndex;
  game.lastUpdate = Date.now();

  broadcast(game.players[otherPlayerIndex].username, "game");
  broadcast(user.username, "game");
  broadcast(game.players[otherPlayerIndex].username, "games");
  broadcast(user.username, "games");
}

export async function getScores(
  token: AuthToken,
  gameID: string
): Promise<[thisPlayer: number, otherPlayer: number]> {
  const user = getUserFromToken(token);
  const { game, thisPlayerIndex, otherPlayerIndex } = getUsersGameFromID(
    user,
    gameID
  );

  const scores = getScoresFromBoard(game.board);

  return [scores[thisPlayerIndex], scores[otherPlayerIndex]];
}

export async function getClientGame(token: AuthToken, gameID: string) {
  const user = getUserFromToken(token);
  const { game, thisPlayerIndex, otherPlayerIndex } = getUsersGameFromID(
    user,
    gameID
  );

  return {
    board: game.board.map((row) => row.map((piece) => piece?.letter)),
    hand: game.players[thisPlayerIndex].hand,
    otherPassed: game.players[otherPlayerIndex].pass,
    otherUsername: game.players[otherPlayerIndex].username,
    lastUpdate: game.lastUpdate,
    myTurn: game.currentTurn === thisPlayerIndex,
    ended: game.ended,
  };
}

export async function getScoreForWord(word: string) {
  if (!words.has(word)) {
    return null;
  }
  return word
    .split("")
    .map((letter) => LETTER_WEIGHTS[letter] ?? null)
    .reduce((a, v) => (a === null || v === null ? null : a + v));
}

export async function getAllGames(token: AuthToken) {
  const user = getUserFromToken(token);
  return user.ongoingGames.filter(
    (id) =>
      !games.data
        .get(id)!
        .players.find(({ username }) => user.username === username)!
        .acknowledgedEnded
  );
}

export async function acknowledgeEnd(token: AuthToken, gameID: string) {
  const user = getUserFromToken(token);
  const { game, thisPlayerIndex, otherPlayerIndex } = getUsersGameFromID(
    user,
    gameID
  );

  if (!game.ended) {
    throw new ClientError("This game hasn't ended yet");
  }

  game.players[thisPlayerIndex].acknowledgedEnded = true;
  if (game.players[otherPlayerIndex].acknowledgedEnded) {
    user.ongoingGames = user.ongoingGames.filter((id) => id !== gameID);
    const otherUser = users.data.get(game.players[otherPlayerIndex].username)!;
    otherUser.ongoingGames = otherUser.ongoingGames.filter(
      (id) => id !== gameID
    );
    games.data.delete(gameID);
  }

  broadcast(user.username, "games");
  broadcast(game.players[otherPlayerIndex].username, "games");
}
