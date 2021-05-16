import { buffer as getStream } from "get-stream";
import { createServer } from "http";
import { pack, unpack } from "msgpackr";
import * as api from "./api.js";
import { getUserFromToken } from "./auth.js";

type API = {
  [key: string]: API | ((...args: unknown[]) => unknown) | undefined;
};

export class ClientError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
  }
}

const eventListeners = new Map<string, Set<(event: api.Broadcasts) => void>>();
export function broadcast(username: string, name: api.Broadcasts) {
  eventListeners.get(username)?.forEach((callback) => {
    callback(name);
  });
}

createServer(async (req, res) => {
  let statusCode = 200;
  let body;

  try {
    const url = req.url!; // valid for requests obtained from a http.Server

    if (url === "/" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>API server operational</h1>");
      return;
    }

    if (url.slice(0, url.indexOf("&")) === "/events" && req.method === "GET") {
      // req.destroy();
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      });
      const token = decodeURIComponent(url.slice(url.indexOf("&") + 1));
      const { username } = getUserFromToken({ type: "AuthToken", token });
      if (!eventListeners.has(username)) {
        eventListeners.set(username, new Set());
      }
      function listener(event: string) {
        res.write(`event: ${event}\ndata:\n\n`);
      }
      eventListeners.get(username)!.add(listener);
      res.addListener("close", () => {
        const listeners = eventListeners.get(username);
        listeners?.delete(listener);
        if (listeners?.size === 0) {
          eventListeners.delete(username);
        }
      });
      return;
    }
    const path = url.slice(1).split("/");
    let endpoint: unknown = api;
    for (const segment of path) {
      endpoint = (endpoint as API)?.[segment];
    }
    if (typeof endpoint !== "function") {
      throw new ClientError("Endpoint not found", 404);
    }
    if (req.method === "OPTIONS") {
      res.writeHead(200, { "Access-Control-Allow-Origin": "*" });
      res.end();
      return;
    }
    if (req.method !== "POST") {
      throw new ClientError("Method not allowed", 405);
    }
    const recieved = await getStream(req);
    let args: unknown;
    try {
      args = unpack(recieved);
    } catch (e) {
      throw new ClientError("Malformed arguments - invalid msgpack");
    }
    if (!Array.isArray(args)) {
      throw new ClientError("Malformed arguments - not an array");
    }
    const returned = await endpoint(...args);
    body = pack(returned);
  } catch (error) {
    if (error instanceof ClientError) {
      statusCode = error.statusCode;
      body = error.message;
    } else {
      statusCode = 500;
      body = "An error occured";
      console.error(error);
    }
  }
  res.writeHead(statusCode, { "Access-Control-Allow-Origin": "*" });
  res.end(body);
}).listen(Number(process.env.PORT ?? 8080), () => {
  console.log(`Listening on http://0.0.0.0:${process.env.PORT ?? 8080}`);
});
