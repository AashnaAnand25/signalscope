import { describe, it, expect, vi, afterEach } from "vitest";
import { localExtraction, localEvidenceLookup } from "@/lib/local-research";
import { validateExtraction } from "@/lib/research-contract";
import { GroqProvider } from "@/server/agents/provider.server";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("Free emergency fallback", () => {
  it("extracts exact source quotations and leaves unsupported sentiment unknown", () => {
    const text = "I need waterproof fabric and padded straps. I prefer a price under $70.";
    const result = validateExtraction(localExtraction(text), text);
    expect(result.suggestions.map((s) => s.desire)).toContain("reliability");
    expect(result.suggestions.map((s) => s.desire)).toContain("price");
    expect(result.tone).toBeUndefined();
    expect(result.suggestions.every((s) => text.includes(s.quote))).toBe(true);
  });
  it("does not turn a marketing feature list into a customer request", () => {
    expect(localExtraction("Waterproof fabric. Integrated dashboard.").suggestions).toEqual([]);
  });
  it("looks up only supplied records, with record IDs and explicit method", () => {
    const result = localEvidenceLookup("waterproof", [
      { id: "R1", text: "I need waterproof fabric" },
      { id: "R2", text: "I need export" },
    ]);
    expect(result).toContain("[R1]");
    expect(result).not.toContain("[R2]");
    expect(result).toContain("not an LLM");
  });
  it("routes a provider-shaped Groq response without exposing its key", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-secret-only");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ choices: [{ message: { content: '{"suggestions":[]}' } }] }),
        ),
    );
    const result = await new GroqProvider().generate("tagging", "Return JSON", true);
    expect(result.provider).toBe("groq");
    expect(result.model).toBe("openai/gpt-oss-20b");
    expect(JSON.stringify(result)).not.toContain("test-secret-only");
  });
});
