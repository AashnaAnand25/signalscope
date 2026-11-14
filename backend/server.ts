import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHandler, openStore } from "./store";

const token = process.env.SIGNALSCOPE_REVIEWER_TOKEN;
if (!token || token.length < 32)
  throw new Error("Set SIGNALSCOPE_REVIEWER_TOKEN to a random string of at least 32 characters.");
const path = resolve(process.env.SIGNALSCOPE_DB_PATH ?? "backend/data/signalscope.sqlite");
mkdirSync(dirname(path), { recursive: true });
const origins = (
  process.env.SIGNALSCOPE_ALLOWED_ORIGINS ?? "http://localhost:8081,http://127.0.0.1:8081"
)
  .split(",")
  .map((x) => x.trim());
const port = Number(process.env.SIGNALSCOPE_API_PORT ?? "8090");
const db = openStore(path);
const hostname = process.env.SIGNALSCOPE_API_HOST ?? "127.0.0.1";
Bun.serve({ port, hostname, fetch: createHandler(db, token, origins) });
console.log(`SignalScope research API listening on ${port}`);
