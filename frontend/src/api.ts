import { pack, unpack } from "msgpackr";

export const BACKEND = `http://${location.hostname}:8080`;

function makeApi<T>(...path: string[]): T {
  return (new Proxy(() => {}, {
    get(_target, key: string) {
      return makeApi(...path, key);
    },
    async apply(_target, _this, args) {
      // await new Promise((r) => setTimeout(r, 5000));
      const resp = await fetch(new URL(path.join("/"), BACKEND).toString(), {
        method: "POST",
        body: pack(args),
      });
      if (resp.status !== 200) {
        throw new Error(await resp.text());
      }
      return unpack(new Uint8Array(await resp.arrayBuffer()));
    },
  }) as unknown) as T;
}

export const api = makeApi<typeof import("../../backend/src/api")>();
