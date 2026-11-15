import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { KEARNEY_CATALOG, kearneyEntry } from "../../data/kearney-products";
import {
  analysisSchema,
  competitorSchema,
  validateAnalysis,
  type PortfolioAnalysis,
  type ResearchDocument,
} from "../../lib/portfolio-contract";
import { capturePublicPage, publicUrl } from "../web-capture.server";
import { agentProvider, parseAgentJson } from "./provider.server";
import type { EvidenceRecord } from "../../lib/types";
export type PortfolioJob = {
  id: string;
  productId: string;
  status: "running" | "complete" | "failed";
  stage: string;
  startedAt: string;
  finishedAt?: string;
  documents: ResearchDocument[];
  competitors: z.infer<typeof competitorSchema>[];
  analysis?: PortfolioAnalysis;
  records: EvidenceRecord[];
  errors: string[];
  trace: { agent: string; message: string; at: string }[];
};
const jobs = new Map<string, PortfolioJob>();
const stableId = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const note = (job: PortfolioJob, agent: string, message: string) => {
  job.stage = message;
  job.trace.push({ agent, message, at: new Date().toISOString() });
};
const safeError = (e: unknown) =>
  e instanceof Error &&
  /missing|requires|Unsupported agent|returned HTTP|No source pages|no usable|quote|cited|customer-feedback|invented|duplicated/.test(
    e.message,
  )
    ? e.message.slice(0, 250)
    : "Provider or source request failed. Check network access, model availability and quota. No unsupported findings were added.";
function kind(url: string, primary: boolean): ResearchDocument["kind"] {
  if (primary) return "provider-claim";
  const u = new URL(url);
  const host = u.hostname;
  if (
    /(^|\.)(g2\.com|capterra\.com|gartner\.com|reddit\.com|trustpilot\.com)$/.test(host) &&
    /review|peer-insight|comments/i.test(u.pathname)
  )
    return "customer-feedback";
  return "market-commentary";
}
async function capture(job: PortfolioJob, url: string, primary: boolean, subject?: string) {
  if (job.documents.some((d) => d.url === url) || job.documents.length >= 16) return;
  const id = `SRC-${stableId(url)}`;
  const platform = new URL(url).hostname.replace(/^www\./, "");
  try {
    const data = await capturePublicPage(url);
    const lower = (data.title + " " + data.text).toLowerCase();
    const candidates = [
      kearneyEntry(job.productId)!.name,
      ...job.competitors.map((c) => c.name),
    ].filter((name) => lower.includes(name.toLowerCase()));
    const identified = subject || (candidates.length === 1 ? candidates[0] : undefined);
    job.documents.push({
      id,
      url: data.url,
      title: data.title,
      platform,
      text: data.text,
      capturedAt: data.capturedAt,
      kind: kind(url, primary),
      status: "captured",
      ...(identified ? { subject: identified } : {}),
    });
  } catch {
    job.documents.push({
      id,
      url,
      title: platform,
      platform,
      text: "",
      capturedAt: new Date().toISOString(),
      kind: kind(url, primary),
      status: "blocked",
      note: "Page could not be captured. It may require sign-in, deny bots, use unsupported content, or be unreachable. Use an authorized export; this source is not evidence for a claim.",
    });
  }
}
async function search(job: PortfolioJob, prompt: string) {
  const output = await agentProvider("search").generate("search", prompt);
  for (const source of output.sources.slice(0, 4)) {
    try {
      publicUrl(source.url);
    } catch {
      continue;
    }
    await capture(job, source.url, false);
  }
  return output;
}
const outputShape = `Return JSON with comments:[{quote,documentId,kind:"customer-feedback"|"provider-claim"|"market-commentary",tone:"positive"|"mixed"|"negative",cluster,codings:[{desire:"features"|"price"|"quality"|"speed"|"convenience"|"reliability"|"appearance"|"sustainability"|"compatibility"|"customization",need,importance:"must-have"|"preference"|"unknown",fulfillment:"met"|"partly-met"|"unmet"|"conflicting"|"unknown"}]}], roadmap:[{title,improvement,hypothesis,experiment,documentIds:[id],quote,basis:"customer-feedback"|"market-commentary"|"provider-claim"}], matrix:[{product,pricing:{value,documentIds,quote},ai:{value,documentIds,quote},timeToValue:{value,documentIds,quote},sentiment:{value,documentIds,quote}}]. Every quote must be an exact substring of a cited captured document. No markdown. For missing matrix evidence set value:"Unknown", documentIds:[],quote:"". Never invent customer sentiment from provider claims. No numeric ratings, competitive scores or unsupported superiority claims. Comments must be attributed to the primary offering, never transfer a competitor's complaint to Kearney. Roadmap items are testable hypotheses, not proven flaws. Keep fewer than 12 comments and 4 roadmap items. Matrix has one row per named product. An absent review corpus is unknown, not positive sentiment.`;
async function run(job: PortfolioJob) {
  const entry = kearneyEntry(job.productId)!;
  try {
    note(job, "Source collector", "Capturing the official product description");
    await capture(job, entry.source.url, true, entry.name);
    note(
      job,
      "Feedback researcher",
      "Searching for attributed customer feedback and market discussion",
    );
    try {
      await search(
        job,
        `Find public feedback ABOUT ${entry.searchScope}. Search G2, Capterra, Gartner Peer Insights, Reddit, LinkedIn, TEAMS Design case studies, YouTube demos and Innovation Unpacked. Distinguish actual users from provider marketing and employee reviews. Use exact product identity. Do not invent comments or transfer feedback from unrelated products. Cite exact source URLs. If no direct feedback is found, state that plainly.`,
      );
    } catch (e) {
      job.errors.push(safeError(e));
    }
    note(job, "Competitor researcher", "Discovering relevant competing offerings automatically");
    try {
      const discovery = await agentProvider("search").generate(
        "search",
        `Identify 3 to 5 specific competing products or service offerings for ${entry.searchScope}. Find relevant competitors, not a fixed list of famous firms. Distinguish direct competitors, adjacent capabilities and service alternatives. Cite an official source for each named offering and its relevant capability. Do not compare consulting services as if they had public SaaS pricing.`,
      );
      const extraction = await agentProvider("tagging").generate(
        "tagging",
        `Extract competitors from the search text ONLY. JSON {"competitors":[{"name":"exact offering name","url":"official HTTPS product URL","rationale":"relevance","relation":"direct|adjacent|service-alternative","sourceUrl":"one of the allowed URLs"}]}. No invented URLs. At most 5. Allowed source URLs: ${JSON.stringify(discovery.sources)}. Search text: ${discovery.text}`,
        true,
      );
      const candidates = z
        .object({ competitors: z.array(competitorSchema).max(5) })
        .parse(parseAgentJson(extraction.text)).competitors;
      const allowed = new Set(discovery.sources.map((s) => s.url));
      job.competitors = candidates.filter(
        (c) => allowed.has(c.sourceUrl) && c.name.toLowerCase() !== entry.name.toLowerCase(),
      );
      for (const competitor of job.competitors) {
        try {
          publicUrl(competitor.url);
          await capture(job, competitor.url, true, competitor.name);
        } catch {
          /* no unsafe URL fetch */
        }
      }
    } catch (e) {
      job.errors.push(safeError(e));
    }
    if (job.competitors.length) {
      note(job, "Review researcher", "Checking customer evidence for the discovered alternatives");
      try {
        await search(
          job,
          `Find actual customer reviews for these exact offerings: ${job.competitors.map((c) => c.name).join(", ")}. Prefer exact product review pages on G2, Capterra and Gartner Peer Insights. Provide source URLs. Do not invent review counts, ratings or complaints. Distinguish products from similarly named tools.`,
        );
      } catch (e) {
        job.errors.push(safeError(e));
      }
    }
    const captured = job.documents.filter((d) => d.status === "captured");
    if (!captured.length)
      throw new Error(
        "No source pages could be captured. Add an authorized excerpt or check network access before analyzing.",
      );
    note(job, "Feedback tagger", "Extracting quoted comments and separating claim types");
    const texts = captured.map((d) => ({ ...d, text: d.text.slice(0, 8000) }));
    const tagged = await agentProvider("tagging").generate(
      "tagging",
      `${outputShape}\nFocus comments on ${entry.name}. Return empty roadmap and matrix arrays at this stage. DOCUMENTS: ${JSON.stringify(texts)}`,
      true,
    );
    const comments = analysisSchema.parse(parseAgentJson(tagged.text)).comments;
    note(job, "Renewal strategist", "Building a cited comparison and testable product roadmap");
    const names = [entry.name, ...job.competitors.map((c) => c.name)];
    const synthesis = await agentProvider("reasoning").generate(
      "reasoning",
      `${outputShape}\nPrimary product: ${entry.name}. Product rows: ${JSON.stringify(names)}. Compare pricing model, AI capabilities, time-to-value and ACTUAL customer sentiment only where captured. Return comments:[] because tagging has already occurred. DOCUMENTS: ${JSON.stringify(texts)}`,
      true,
    );
    const result = analysisSchema.parse(parseAgentJson(synthesis.text));
    job.analysis = validateAnalysis({ ...result, comments }, captured, names);
    job.records = job.analysis.comments
      .filter((c) => c.kind === "customer-feedback")
      .map((c) => {
        const doc = captured.find((d) => d.id === c.documentId)!;
        return {
          id: `VOC-${stableId(entry.id + doc.url + c.quote)}`,
          productId: entry.id,
          sourceType: /g2|capterra|gartner|trustpilot/.test(doc.platform) ? "review" : "discussion",
          text: c.quote,
          sourceUrl: doc.url,
          sourceReference: `PERLab research | ${doc.platform} | captured ${doc.capturedAt}; exact source quote; user identity and product use not independently verified`,
          codings: c.codings,
          tone: c.tone,
          origin: "collected",
          codingStatus: "ai-suggested",
          classification: "self-reported",
        };
      });
    job.status = "complete";
    job.finishedAt = new Date().toISOString();
    note(job, "Verifier", "Quote checks passed. Researcher review is still required.");
  } catch (e) {
    job.status = "failed";
    job.finishedAt = new Date().toISOString();
    job.errors.push(safeError(e));
    note(job, "Verifier", "Run stopped without adding unsupported findings");
  }
}
const response = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function handlePortfolio(request: Request) {
  const url = new URL(request.url);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (!local && process.env["RESEARCH_AGENT_ENABLED"] !== "true")
    return response({ error: "Configure protected hosting before enabling research." }, 503);
  if (request.method === "GET") {
    const id = url.searchParams.get("job");
    const job = id ? jobs.get(id) : undefined;
    return job
      ? response(job)
      : response({ error: "Research run not found. Start a new run." }, 404);
  }
  if (request.method !== "POST") return response({ error: "POST required" }, 405);
  if (request.headers.get("origin") !== url.origin)
    return response({ error: "Same-origin requests only" }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 1000) return response({ error: "Request too large" }, 413);
    const { productId, refresh } = z
      .object({ productId: z.string(), refresh: z.boolean().default(false) })
      .parse(JSON.parse(raw));
    if (!KEARNEY_CATALOG.some((p) => p.id === productId))
      return response({ error: "Unknown portfolio product" }, 400);
    if (!(
      process.env["GEMINI_API_KEY"] ||
      process.env["GOOGLE_API_KEY"] ||
      (process.env["OPENAI_API_KEY"] && process.env["SERPER_API_KEY"])
    ))
      return response(
        { error: "Add GEMINI_API_KEY to the server environment. No research was started." },
        503,
      );
    const cached = [...jobs.values()]
      .reverse()
      .find(
        (job) =>
          job.productId === productId &&
          job.status !== "failed" &&
          Date.now() - Date.parse(job.startedAt) < 86400000,
      );
    if (cached && (!refresh || cached.status === "running")) return response(cached);
    if ([...jobs.values()].filter((j) => j.status === "running").length >= 2)
      return response({ error: "Two research runs are active. Wait for one to finish." }, 429);
    if (jobs.size >= 20) jobs.delete([...jobs.keys()][0]!);
    const job: PortfolioJob = {
      id: randomUUID(),
      productId,
      status: "running",
      stage: "Queued",
      startedAt: new Date().toISOString(),
      documents: [],
      competitors: [],
      records: [],
      errors: [],
      trace: [],
    };
    jobs.set(job.id, job);
    void run(job);
    return response(job, 202);
  } catch {
    return response({ error: "Invalid portfolio request" }, 400);
  }
}
