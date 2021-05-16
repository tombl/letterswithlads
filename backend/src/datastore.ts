const DATA_DIR = "../data";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath, URL } from "url";
import { deserialize, serialize } from "v8";

export class Datastore<Data> {
  private file: string;
  public data: Data;

  constructor(private name: string, getInitialData: () => Data) {
    this.file = fileURLToPath(new URL(`${DATA_DIR}/${name}`, import.meta.url));
    if (existsSync(this.file)) {
      this.data = deserialize(readFileSync(this.file)) as Data;
      console.log(`Loaded ${name} with existing data from disk`);
    } else {
      this.data = getInitialData();
      console.log(`Initialized ${name} with fresh data`);
    }

    setInterval(() => {
      this.save();
    }, 1000 * 60 * 5);
    process.on("exit", () => {
      this.save();
    });
    process.on("SIGINT", () => {
      process.exit(1);
    });
    process.on("SIGUSR2", () => {
      process.exit(1);
    });
    process.on("uncaughtException", (error) => {
      console.error(error);
      process.exit(1);
    });
  }

  public save(): void {
    console.log(`Saving datastore ${this.name}`);
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, serialize(this.data));
  }
}
