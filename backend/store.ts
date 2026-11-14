import { Database } from "bun:sqlite";
import { timingSafeEqual } from "node:crypto";

export type Product = {
  id: string;
  name: string;
  category: string;
  variant: string;
  version: string;
  region: string;
  attributes: Record<string, string>;
};
type Evidence = {
  id: string;
  productId: string;
  sourceType: string;
  text: string;
  sourceReference: string;
  date?: string;
  status: "unreviewed" | "reviewed" | "rejected";
  need?: string;
  quote?: string;
  barrier?: string;
  segment?: string;
};
type Decision = {
  id: string;
  productId: string;
  title: string;
  hypothesis: string;
  options: string[];
  supportingIds: string[];
  contradictingIds: string[];
  owner: string;
  successMetric: string;
  guardrail: string;
  reversal: string;
  status: "proposed" | "testing" | "completed";
};
type Outcome = {
  id: string;
  decisionId: string;
  arm: string;
  period: string;
  visitors: number;
  orders: number;
  revenue: number;
  cost: number;
  returns: number;
};

export function openStore(path: string) {
  const db = new Database(path, { create: true });
  db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
      variant TEXT NOT NULL, version TEXT NOT NULL, region TEXT NOT NULL,
      payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id),
      source_type TEXT NOT NULL, source_reference TEXT NOT NULL, status TEXT NOT NULL,
      payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS evidence_product ON evidence(product_id, status);
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id),
      status TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS decisions_product ON decisions(product_id);
    CREATE TABLE IF NOT EXISTS outcomes (
      id TEXT PRIMARY KEY, decision_id TEXT NOT NULL REFERENCES decisions(id),
      payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS outcomes_decision ON outcomes(decision_id);
    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id),
      payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}

function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}
function obj(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("Expected an object.");
  return value as Record<string, unknown>;
}
function str(value: unknown, name: string, max = 500): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) fail(`Invalid ${name}.`);
  return value.trim();
}
function list(value: unknown, name: string, max = 50): string[] {
  if (
    !Array.isArray(value) ||
    value.length > max ||
    value.some((v) => typeof v !== "string" || !v.trim())
  )
    fail(`Invalid ${name}.`);
  return value.map((v: string) => v.trim());
}
function id(value: unknown): string {
  const s = str(value, "id", 100);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(s)) fail("Invalid id.");
  return s;
}
function number(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) fail(`Invalid ${name}.`);
  return value;
}
function count(value: unknown, name: string): number {
  const n = number(value, name);
  if (!Number.isSafeInteger(n)) fail(`Invalid ${name}.`);
  return n;
}
function choice<T extends string>(value: unknown, name: string, options: readonly T[]): T {
  if (!options.includes(value as T)) fail(`Invalid ${name}.`);
  return value as T;
}
function exists(db: Database, table: "products" | "evidence" | "decisions", key: string): boolean {
  return !!db.query(`SELECT id FROM ${table} WHERE id = ?`).get(key);
}
function getRows<T>(db: Database, table: string, field?: string, value?: string): T[] {
  const rows = field
    ? db
        .query(`SELECT payload FROM ${table} WHERE ${field} = ? ORDER BY created_at DESC`)
        .all(value!)
    : db.query(`SELECT payload FROM ${table} ORDER BY created_at DESC`).all();
  return (rows as { payload: string }[]).map((r) => JSON.parse(r.payload) as T);
}
function insert(db: Database, table: string, columns: string[], values: unknown[], item: unknown) {
  const names = [...columns, "payload"];
  db.query(
    `INSERT INTO ${table} (${names.join(",")}) VALUES (${names.map(() => "?").join(",")})`,
  ).run(...values, JSON.stringify(item));
}
function product(input: unknown): Product {
  const x = obj(input);
  const attributes = x.attributes === undefined ? {} : obj(x.attributes);
  if (
    Object.keys(attributes).length > 50 ||
    Object.entries(attributes).some(
      ([k, v]) => k.length > 100 || !k.trim() || typeof v !== "string" || v.length > 500,
    )
  )
    fail("Invalid attributes.");
  return {
    id: id(x.id),
    name: str(x.name, "name"),
    category: str(x.category, "category"),
    variant: str(x.variant, "variant"),
    version: str(x.version, "version"),
    region: str(x.region, "region"),
    attributes: attributes as Record<string, string>,
  };
}
function evidence(input: unknown): Evidence {
  const x = obj(input);
  const sourceReference = str(x.sourceReference, "source reference", 1000);
  if (/^https?:/i.test(sourceReference) && !sourceReference.startsWith("https://"))
    fail("Source URLs must use HTTPS.");
  const text = str(x.text, "text", 12000);
  const quote = x.quote === undefined ? undefined : str(x.quote, "quote", 2000);
  if (quote && !text.includes(quote))
    fail("Supporting quote must occur exactly in the source text.");
  const date = x.date === undefined ? undefined : str(x.date, "date", 10);
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date)
  )
    fail("Invalid date.");
  return {
    id: id(x.id),
    productId: id(x.productId),
    sourceType: choice(x.sourceType, "source type", [
      "review",
      "qa",
      "discussion",
      "support",
      "survey",
      "return",
      "interview",
      "observed",
    ]),
    sourceReference,
    text,
    date,
    status: "unreviewed",
    need: undefined,
    quote: undefined,
    barrier: undefined,
    segment: undefined,
  };
}
function decision(input: unknown): Decision {
  const x = obj(input);
  const options = list(x.options, "options", 10);
  if (options.length < 2 || new Set(options).size !== options.length)
    fail("Provide at least two distinct options.");
  const supportingIds = list(x.supportingIds, "supporting IDs");
  const contradictingIds = list(x.contradictingIds, "contradicting IDs");
  if (supportingIds.some((item) => contradictingIds.includes(item)))
    fail("The same passage cannot support and contradict a decision.");
  return {
    id: id(x.id),
    productId: id(x.productId),
    title: str(x.title, "title"),
    hypothesis: str(x.hypothesis, "hypothesis", 2000),
    options,
    supportingIds,
    contradictingIds,
    owner: str(x.owner, "owner"),
    successMetric: str(x.successMetric, "success metric"),
    guardrail: str(x.guardrail, "guardrail"),
    reversal: str(x.reversal, "reversal"),
    status: "proposed",
  };
}
function outcome(input: unknown): Outcome {
  const x = obj(input);
  const result = {
    id: id(x.id),
    decisionId: id(x.decisionId),
    arm: str(x.arm, "arm"),
    period: str(x.period, "period"),
    visitors: count(x.visitors, "visitors"),
    orders: count(x.orders, "orders"),
    revenue: number(x.revenue, "revenue"),
    cost: number(x.cost, "cost"),
    returns: count(x.returns, "returns"),
  };
  if (result.orders > result.visitors || result.returns > result.orders)
    fail("Counts exceed their denominator.");
  return result;
}
function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}
async function readBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > 2_000_000) fail("Request too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) fail("Missing JSON body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2_000_000) fail("Request too large.", 413);
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    fail("Invalid JSON.");
  }
}
function equal(a: string, b: string): boolean {
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createHandler(db: Database, token: string, allowedOrigins: string[] = []) {
  const recent = new Map<string, number[]>();
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    const cors =
      origin && allowedOrigins.includes(origin)
        ? {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            Vary: "Origin",
          }
        : undefined;
    if (origin && !cors) return json({ error: "Origin not allowed." }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const send = (data: unknown, status = 200) => json(data, status, cors);
    if (url.pathname === "/api/health" && request.method === "GET") return send({ ok: true });
    try {
      const publicSurvey = url.pathname === "/api/surveys" && request.method === "POST";
      if (!publicSurvey && !equal(request.headers.get("authorization") ?? "", `Bearer ${token}`))
        return send({ error: "Reviewer authorization required." }, 401);
      if (request.method === "GET") {
        if (url.pathname === "/api/products") return send(getRows<Product>(db, "products"));
        if (url.pathname === "/api/evidence")
          return send(
            getRows<Evidence>(db, "evidence", "product_id", id(url.searchParams.get("productId"))),
          );
        if (url.pathname === "/api/decisions")
          return send(
            getRows<Decision>(db, "decisions", "product_id", id(url.searchParams.get("productId"))),
          );
        if (url.pathname === "/api/outcomes")
          return send(
            getRows<Outcome>(db, "outcomes", "decision_id", id(url.searchParams.get("decisionId"))),
          );
        if (url.pathname === "/api/surveys")
          return send(getRows(db, "surveys", "product_id", id(url.searchParams.get("productId"))));
      }
      if (request.method === "POST" || request.method === "PATCH") {
        const input = await readBody(request);
        if (url.pathname === "/api/products" && request.method === "POST") {
          const p = product(input);
          insert(
            db,
            "products",
            ["id", "name", "category", "variant", "version", "region"],
            [p.id, p.name, p.category, p.variant, p.version, p.region],
            p,
          );
          return send(p, 201);
        }
        if (url.pathname === "/api/evidence" && request.method === "POST") {
          if (!Array.isArray(input) || input.length < 1 || input.length > 500)
            fail("Provide 1–500 records.");
          const items = input.map(evidence);
          if (new Set(items.map((x) => x.id)).size !== items.length)
            fail("Duplicate evidence ID in batch.");
          for (const e of items)
            if (!exists(db, "products", e.productId)) fail(`Unknown product ${e.productId}.`);
          db.transaction(() => {
            for (const e of items)
              insert(
                db,
                "evidence",
                ["id", "product_id", "source_type", "source_reference", "status"],
                [e.id, e.productId, e.sourceType, e.sourceReference, e.status],
                e,
              );
          })();
          return send({ imported: items.length }, 201);
        }
        const evidenceMatch = url.pathname.match(/^\/api\/evidence\/([A-Za-z0-9._:-]+)$/);
        if (evidenceMatch && request.method === "PATCH") {
          const current = getRows<Evidence>(db, "evidence").find((e) => e.id === evidenceMatch[1]);
          if (!current) fail("Evidence not found.", 404);
          const x = obj(input);
          const status = choice(x.status, "status", ["reviewed", "rejected"] as const);
          const quote = status === "reviewed" ? str(x.quote, "quote", 2000) : undefined;
          if (quote && !current.text.includes(quote))
            fail("Supporting quote must occur exactly in the source text.");
          const updated = {
            ...current,
            status,
            quote,
            need: status === "reviewed" ? str(x.need, "need") : undefined,
            barrier: x.barrier ? str(x.barrier, "barrier") : undefined,
            segment: x.segment ? str(x.segment, "segment") : undefined,
          };
          db.query("UPDATE evidence SET status = ?, payload = ? WHERE id = ?").run(
            status,
            JSON.stringify(updated),
            current.id,
          );
          return send(updated);
        }
        if (url.pathname === "/api/decisions" && request.method === "POST") {
          const d = decision(input);
          if (!exists(db, "products", d.productId)) fail("Unknown product.");
          for (const evidenceId of [...d.supportingIds, ...d.contradictingIds]) {
            const e = db
              .query("SELECT product_id, status FROM evidence WHERE id = ?")
              .get(evidenceId) as { product_id: string; status: string } | null;
            if (!e || e.product_id !== d.productId || e.status !== "reviewed")
              fail(`Evidence ${evidenceId} must be reviewed for this product.`);
          }
          if (!d.supportingIds.length || !d.contradictingIds.length)
            fail("Include supporting evidence and a counterexample.");
          insert(db, "decisions", ["id", "product_id", "status"], [d.id, d.productId, d.status], d);
          return send(d, 201);
        }
        const decisionMatch = url.pathname.match(/^\/api\/decisions\/([A-Za-z0-9._:-]+)$/);
        if (decisionMatch && request.method === "PATCH") {
          const current = getRows<Decision>(db, "decisions").find((d) => d.id === decisionMatch[1]);
          if (!current) fail("Decision not found.", 404);
          const next = choice(obj(input).status, "status", [
            "proposed",
            "testing",
            "completed",
          ] as const);
          const updated = { ...current, status: next };
          db.query("UPDATE decisions SET status = ?, payload = ? WHERE id = ?").run(
            next,
            JSON.stringify(updated),
            current.id,
          );
          return send(updated);
        }
        if (url.pathname === "/api/outcomes" && request.method === "POST") {
          const o = outcome(input);
          const d = getRows<Decision>(db, "decisions").find((item) => item.id === o.decisionId);
          if (!d) fail("Unknown decision.");
          if (!d.options.includes(o.arm)) fail("Outcome arm must match a proposed option.");
          if (
            getRows<Outcome>(db, "outcomes", "decision_id", o.decisionId).some(
              (item) => item.arm === o.arm && item.period === o.period,
            )
          )
            fail("An outcome for this arm and period already exists.", 409);
          insert(db, "outcomes", ["id", "decision_id"], [o.id, o.decisionId], o);
          return send(o, 201);
        }
        if (publicSurvey) {
          // Global demo throttle. An untrusted forwarded header must not let callers bypass it.
          const ip = "public-survey";
          const now = Date.now(),
            hits = (recent.get(ip) ?? []).filter((t) => now - t < 60_000);
          if (hits.length >= 10) fail("Please try again later.", 429);
          recent.set(ip, [...hits, now]);
          const x = obj(input),
            surveyId = id(x.id),
            productId = id(x.productId);
          if (!exists(db, "products", productId)) fail("Unknown product.");
          const answer = {
            id: surveyId,
            productId,
            awareness: choice(x.awareness, "awareness", ["yes", "no", "not-sure"] as const),
            experience: choice(x.experience, "experience", [
              "never-encountered",
              "not-interested",
              "considered",
              "purchased",
              "accessed-other",
            ] as const),
            need: x.need ? str(x.need, "need", 400) : "",
            submittedAt: new Date().toISOString(),
          };
          const prior = db.query("SELECT payload FROM surveys WHERE id = ?").get(surveyId) as {
            payload: string;
          } | null;
          if (prior) {
            const old = JSON.parse(prior.payload) as typeof answer;
            if (
              old.productId !== productId ||
              old.awareness !== answer.awareness ||
              old.experience !== answer.experience ||
              old.need !== answer.need
            )
              fail("Survey ID was already used for different answers.", 409);
            return send({ id: surveyId, duplicate: true });
          }
          insert(db, "surveys", ["id", "product_id"], [surveyId, productId], answer);
          return send({ id: surveyId }, 201);
        }
      }
      return send({ error: "Route not found." }, 404);
    } catch (error) {
      const e = error as Error & { status?: number; code?: string };
      if (e.code?.startsWith("SQLITE_CONSTRAINT"))
        return send({ error: "Duplicate ID or invalid reference." }, 409);
      return send({ error: e.status ? e.message : "Request failed." }, e.status ?? 500);
    }
  };
}
