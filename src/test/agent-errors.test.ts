import { describe, it, expect, vi, afterEach } from "vitest";
import { publicAgentError, GeminiProvider, agentProvider } from "@/server/agents/provider.server";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("Actionable provider errors", () => {
  it("distinguishes key, quota, model, network and source failures without leaking raw errors", () => {
    expect(publicAgentError({ status: 403, message: "secret-value" })).toMatch(/^KEY_REJECTED/);
    expect(publicAgentError({ status: 429, message: "secret-value" })).toMatch(/^QUOTA_EXCEEDED/);
    expect(publicAgentError({ status: 404 })).toMatch(/^MODEL_UNAVAILABLE/);
    expect(publicAgentError(new Error("getaddrinfo ENOTFOUND"))).toMatch(/^DNS_UNREACHABLE/);
    expect(publicAgentError(new Error("robots.txt disallowed"))).toMatch(/^SOURCE_DISALLOWED/);
    expect(publicAgentError({ status: 500, message: "secret-value" })).not.toContain(
      "secret-value",
    );
  });
  it("does not call a provider when its key is absent", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(new GeminiProvider().generate("tagging", "Test")).rejects.toThrow("missing");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("supports explicit optional provider routes", () => {
    for (const name of ["anthropic", "perplexity", "openai", "gemini"]) {
      vi.stubEnv("AGENT_REASONING_PROVIDER", name);
      expect(agentProvider("reasoning").name).toBe(name);
    }
  });
});

it("retries a model access 404 once with the disclosed replacement", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-only");
  vi.stubEnv("GEMINI_FAST_MODEL", "gemini-2.5-flash");
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json(
        { error: { code: 404, message: "Model unavailable", status: "NOT_FOUND" } },
        { status: 404 },
      ),
    )
    .mockResolvedValueOnce(
      Response.json({ candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] }),
    );
  vi.stubGlobal("fetch", fetch);
  const result = await new GeminiProvider().generate("tagging", "test", true);
  expect(result.model).toBe("gemini-3.8-flash");
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[1]?.[0]).toContain("gemini-3.8-flash");
});
