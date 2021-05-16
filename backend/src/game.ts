export const BOARD_SIZE = 15;
export const HAND_SIZE = 7;
export const LETTER_WEIGHTS: Record<string, number | undefined> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

const INITIAL_BAG = Object.entries({
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
  " ": 2,
}).flatMap(([letter, repetitions]) =>
  Array.from({ length: repetitions }, () => letter)
);

import shuffle from "array-shuffle";
import { existsSync, readFileSync } from "fs";
import { URL } from "url";
import type { Game } from "./datastores";

const wordsPath = new URL("../../wordlist.txt", import.meta.url);
export const words = new Set(
  existsSync(wordsPath)
    ? readFileSync(wordsPath, "utf8")
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((word) => word.toUpperCase())
    : []
);
console.log(`Loaded ${words.size} words`);
if (words.size === 0) {
  console.log(`I looked for a wordlist but couldn't find it`);
  console.log(`Please put a newline delimited list of words at ${wordsPath}`);
}

export interface Piece {
  player: number;
  letter: string;
}
export type Board = Array<Array<Piece | undefined>>;
export interface Move {
  piece: number;
  letter: string;
  position: [number, number];
}

export function getScoresFromBoard(board: Board) {
  const scores: [number, number] = [0, 0];
  for (const row of board) {
    for (const piece of row) {
      if (piece === undefined) {
        continue;
      }
      const score = LETTER_WEIGHTS[piece.letter];
      if (score === undefined) {
        throw new Error("Unknown letter");
      }
      scores[piece.player] += score;
    }
  }
  return scores;
}

export function isValidBoard(
  board: Board
): { valid: true } | { valid: false; word: string } {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === undefined) {
        continue;
      }
      if (board[y][x - 1] === undefined) {
        const letters = [];
        let offset = 0;
        while (true) {
          const piece = board[y][x + offset]?.letter;
          if (piece === undefined) {
            break;
          } else {
            letters.push(piece);
          }
          offset++;
        }
        if (letters.length > 1 && !words.has(letters.join(""))) {
          return { valid: false, word: letters.join("") };
        }
      }
      if (board[y - 1]?.[x] === undefined) {
        const letters = [];
        let offset = 0;
        while (true) {
          const piece = board[y + offset][x]?.letter;
          if (piece === undefined) {
            break;
          } else {
            letters.push(piece);
          }
          offset++;
        }
        if (letters.length > 1 && !words.has(letters.join(""))) {
          return { valid: false, word: letters.join("") };
        }
      }
    }
  }

  return { valid: true };
}

export function applyMoves(
  game: Game,
  player: number,
  moves: Move[]
): Board | null {
  const newBoard = game.board.map((row) => [...row]);
  for (const {
    piece,
    position: [x, y],
  } of moves) {
    if (game.board[y][x] !== undefined) {
      return null;
    }
    newBoard[y][x] = {
      player: player,
      letter: game.players[player].hand[piece],
    };
  }
  return newBoard;
}

export function isValidMove(
  game: Game,
  player: number,
  moves: Move[]
): { valid: true } | { valid: false; reason: string } {
  if (moves.length === 0) {
    return { valid: false, reason: "At least one tile must be placed" };
  }

  for (const {
    position: [x, y],
  } of moves) {
    if (x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE) {
      return {
        valid: false,
        reason: "All tiles must be placed inside the board",
      };
    }
  }

  const isVertical = moves.reduce(
    (acc, { position: [x, _y] }) => acc && x === moves[0].position[0],
    true
  );
  const isHorizontal = moves.reduce(
    (acc, { position: [_x, y] }) => acc && y === moves[0].position[1],
    true
  );

  if (isVertical === isHorizontal && moves.length > 1) {
    return { valid: false, reason: "All tiles must be in a straight line" };
  }

  const sorted = isVertical
    ? [...moves].sort(
        ({ position: [x1, _y211] }, { position: [x2, _y2] }) => x1 - x2
      )
    : isHorizontal
    ? [...moves].sort(
        ({ position: [_x1, y1] }, { position: [_x2, y2] }) => y1 - y2
      )
    : (() => {
        throw new Error("Moves is neither horizontal nor vertical");
      })();

  let isAdjacent =
    game.board.find(
      (row) => row.find((piece) => piece !== undefined) !== undefined
    ) === undefined;
  for (const {
    position: [x, y],
  } of moves) {
    if (isAdjacent) {
      break;
    }
    if (
      game.board[y - 1]?.[x] !== undefined ||
      game.board[y][x - 1] !== undefined ||
      game.board[y + 1]?.[x] !== undefined ||
      game.board[y][x + 1] !== undefined
    ) {
      isAdjacent = true;
    }
  }

  if (!isAdjacent) {
    return {
      valid: false,
      reason: "At least one tile must touch another existing tile",
    };
  }

  const theoreticalBoard = applyMoves(game, player, moves);

  if (theoreticalBoard === null) {
    return {
      valid: false,
      reason: "Tiles cannot be played where existing tiles are",
    };
  }

  const validatedBoard = isValidBoard(theoreticalBoard);
  if (!validatedBoard.valid) {
    return {
      valid: false,
      reason: `${validatedBoard.word} is not a valid word`,
    };
  }

  for (
    let offset = sorted[0].position[isVertical ? 0 : 1];
    offset < sorted[sorted.length - 1].position[isVertical ? 0 : 1];
    offset++
  ) {
    const piece =
      theoreticalBoard[isHorizontal ? offset : sorted[0].position[1]][
        isVertical ? offset : sorted[0].position[0]
      ];
    if (piece === undefined) {
      return {
        valid: false,
        reason: "All tiles must be placed in a line with no gaps",
      };
    }
  }

  return { valid: true };
}

export function getShuffledBag() {
  return shuffle([...INITIAL_BAG]);
}
