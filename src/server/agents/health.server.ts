import { agentProvider, publicAgentError } from "./provider.server";
export async function handleAgentHealth(request: Request) {
  const url = new URL(request.url);
  if (request.method !== "POST" || request.headers.get("origin") !== url.origin)
    return Response.json({ error: "Same-origin POST required" }, { status: 403 });
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
    process.env["RESEARCH_AGENT_ENABLED"] !== "true"
  )
    return Response.json({ error: "Research disabled on this host" }, { status: 503 });
  try {
    const result = await agentProvider("tagging").generate(
      "tagging",
      'Return JSON only: {"ok":true}',
      true,
    );
    return Response.json(
      { ok: true, provider: result.provider, model: result.model },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return Response.json({ ok: false, error: publicAgentError(e) }, { status: 502 });
  }
}
