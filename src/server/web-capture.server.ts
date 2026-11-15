import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { get } from "node:https";
import { load } from "cheerio";
import robotsParser from "robots-parser";
const agent = "SignalScopeResearch/1.0";
export function publicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a! >= 224 ||
      (a === 100 && b! >= 64 && b! <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b! >= 16 && b! <= 31) ||
      (a === 192 && [0, 168].includes(b!)) ||
      (a === 198 && [18, 19, 51].includes(b!)) ||
      (a === 203 && b === 0)
    );
  }
  // Only globally routable native IPv6. Reject loopback, mapped IPv4, NAT64 and local ranges.
  return (
    isIP(address) === 6 &&
    /^[23][0-9a-f]{3}:/i.test(address) &&
    !/^2001:/i.test(address) &&
    !/^2002:/i.test(address)
  );
}
export function publicUrl(raw: string): URL {
  const u = new URL(raw);
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    (u.port && u.port !== "443") ||
    u.hash ||
    u.search
  )
    throw new Error("Use a public HTTPS page without credentials, query parameters or fragments.");
  if (
    isIP(u.hostname.replaceAll("[", "").replaceAll("]", "")) ||
    !u.hostname.includes(".") ||
    /\.(local|internal|localhost)$/i.test(u.hostname)
  )
    throw new Error("Private addresses and IP-literal URLs are not supported.");
  return u;
}
type Download = { status: number; location?: string | undefined; type: string; body: string };
async function download(url: URL): Promise<Download> {
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new Error("Source resolves to a private or unsupported address.");
  const chosen = addresses[0]!;
  return new Promise((resolve, reject) => {
    const request = get(
      url,
      {
        family: chosen.family,
        lookup: (_host, _options, callback) => callback(null, chosen.address, chosen.family),
        headers: {
          "User-Agent": agent,
          Accept: "text/html,text/plain",
          "Accept-Encoding": "identity",
        },
      },
      (response) => {
        let size = 0;
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > 1000000) {
            response.destroy();
            reject(new Error("Source exceeds the 1 MB capture limit."));
          } else chunks.push(chunk);
        });
        response.on("error", reject);
        response.on("end", () =>
          resolve({
            status: response.statusCode ?? 500,
            location: response.headers.location,
            type: response.headers["content-type"] ?? "",
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    const deadline = setTimeout(
      () => request.destroy(new Error("Source timed out after 12 seconds.")),
      12000,
    );
    request.on("close", () => clearTimeout(deadline));
    request.on("error", reject);
  });
}
export function parsePage(html: string, url: string) {
  const $ = load(html);
  const title = $("title").first().text().trim().slice(0, 250) || new URL(url).hostname;
  if (/just a moment|access denied|robot check|attention required/i.test(title))
    throw new Error("Source blocked automated access. Use a permitted manual excerpt.");
  if ($('input[type="password"]').length)
    throw new Error("This page requires sign-in. Use an authorized export instead.");
  $("script,style,noscript,nav,header,footer,aside,form,svg,iframe").remove();
  const root = $("main").first().length
    ? $("main").first()
    : $("article").first().length
      ? $("article").first()
      : $("body");
  root.find("p,li,h1,h2,h3,br").append(" ");
  const text = root.text().replace(/\s+/g, " ").trim();
  if (text.length < 100)
    throw new Error(
      "No readable page text found. This page may require JavaScript or sign-in. Paste an authorized excerpt instead.",
    );
  return { title, text: text.slice(0, 18000), truncated: text.length > 18000 };
}
export async function capturePublicPage(raw: string) {
  let current = publicUrl(raw);
  const started = Date.now();
  for (let hop = 0; hop < 4; hop++) {
    if (Date.now() - started > 20000)
      throw new Error("Capture exceeded its time budget. Paste an excerpt instead.");
    const robotsUrl = new URL("/robots.txt", current.origin);
    const robots = await download(robotsUrl);
    if (
      robots.status !== 404 &&
      (robots.status !== 200 ||
        robotsParser(robotsUrl.href, robots.body).isAllowed(current.href, agent) === false)
    )
      throw new Error(
        "Automated access is disallowed or robots.txt could not be verified. Use a permitted manual excerpt.",
      );
    if (process.env["SCRAPE_PROVIDER"] === "firecrawl") {
      const key = process.env["FIRECRAWL_API_KEY"];
      if (!key)
        throw new Error(
          "FIRECRAWL_API_KEY is missing. Use native capture or configure the server key.",
        );
      const result = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          url: current.href,
          formats: ["markdown"],
          onlyMainContent: true,
          timeout: 20000,
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (!result.ok)
        throw new Error(`Firecrawl returned HTTP ${result.status}. No source was saved.`);
      const output = await result.json();
      const text = output.data?.markdown;
      if (
        typeof text !== "string" ||
        text.length < 100 ||
        /just a moment|verify you are human|access denied/i.test(text.slice(0, 250))
      )
        throw new Error("No permitted readable content returned. Use an authorized export.");
      const finalUrl = publicUrl(output.data?.metadata?.sourceURL || current.href);
      if (finalUrl.hostname !== current.hostname)
        throw new Error(
          "Rendered source redirected to another host. Supply the final public URL instead.",
        );
      return {
        title: String(output.data?.metadata?.title || current.hostname).slice(0, 250),
        text: text.slice(0, 18000),
        truncated: text.length > 18000,
        url: finalUrl.href,
        capturedAt: new Date().toISOString(),
        method: "public-html" as const,
      };
    }
    const page = await download(current);
    if ([301, 302, 303, 307, 308].includes(page.status) && page.location) {
      current = publicUrl(new URL(page.location, current).href);
      continue;
    }
    if (page.status !== 200)
      throw new Error(`Source returned HTTP ${page.status}. No capture saved.`);
    if (!page.type.includes("text/html"))
      throw new Error(
        "Only readable HTML pages are supported. Use an export for PDFs and other formats.",
      );
    return {
      ...parsePage(page.body, current.href),
      url: current.href,
      capturedAt: new Date().toISOString(),
      method: "public-html" as const,
    };
  }
  throw new Error("Too many redirects. Use the final public page URL.");
}
const recent = new Map<string, number>();
export async function handleCapture(request: Request) {
  const reply = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  if (request.method !== "POST") return reply({ error: "POST required" }, 405);
  const requestUrl = new URL(request.url);
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(requestUrl.hostname) &&
    process.env["WEB_CAPTURE_ENABLED"] !== "true"
  )
    return reply(
      {
        error:
          "Public-page capture is disabled on this host. Configure authenticated access before enabling it.",
      },
      503,
    );
  const origin = requestUrl.origin;
  if (request.headers.get("origin") !== origin)
    return reply({ error: "Same-origin requests only" }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 4000) return reply({ error: "Request too large" }, 413);
    const body = JSON.parse(raw);
    if (typeof body.url !== "string" || body.url.length > 2000)
      return reply({ error: "Supply one public URL" }, 400);
    const url = publicUrl(body.url);
    if (Date.now() - (recent.get(url.hostname) ?? 0) < 3000)
      return reply({ error: "Wait three seconds between captures from the same host." }, 429);
    if (recent.size > 1000) recent.clear();
    recent.set(url.hostname, Date.now());
    return reply(await capturePublicPage(url.href));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Capture failed";
    return reply(
      {
        error: /ENOTFOUND|EAI_AGAIN|ECONN|certificate|getaddrinfo/.test(message)
          ? "This server cannot reach that source. Use a permitted excerpt or try from your local terminal."
          : message,
      },
      422,
    );
  }
}
