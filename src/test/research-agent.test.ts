import { afterEach, describe, expect, it, vi } from "vitest";
import { handleResearch } from "@/server/research-agent.server";
import { validateExtraction } from "@/lib/research-contract";
const passage = "I need a waterproof bag.";
const suggestion = {
  desire: "reliability",
  need: "Keep contents dry",
  quote: "waterproof bag",
  importance: "unknown",
  fulfillment: "unknown",
};
function req(body: unknown, origin = "http://localhost:8081") {
  return new Request("http://localhost:8081/api/research", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("Research assistant boundaries", () => {
  it("rejects invented quotation evidence", () => {
    expect(() =>
      validateExtraction(
        { suggestions: [{ ...suggestion, quote: "free repairs forever" }] },
        passage,
      ),
    ).toThrow("quote not found");
  });
  it("does not call Google without a key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("GOOGLE_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await handleResearch(req({ mode: "extract", text: passage }))).status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects cross-origin requests", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    expect(
      (await handleResearch(req({ mode: "extract", text: passage }, "https://other.example")))
        .status,
    ).toBe(403);
  });
  it("validates a real provider-shaped extraction and keeps the key server-side", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    vi.stubEnv("GOOGLE_GENAI_PROVIDER", "gemini");
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        candidates: [
          { content: { parts: [{ text: JSON.stringify({ suggestions: [suggestion] }) }] } },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const response = await handleResearch(req({ mode: "extract", text: passage }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.suggestions[0].quote).toBe("waterproof bag");
    expect(JSON.stringify(body)).not.toContain("test-only");
    expect(fetchMock.mock.calls[0]?.[0]).toContain("generativelanguage.googleapis.com");
  });
  it("supports the Google Cloud Vertex express endpoint", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    vi.stubEnv("GOOGLE_GENAI_PROVIDER", "vertex");
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        candidates: [{ content: { parts: [{ text: "Insufficient evidence." }] } }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    expect(
      (await handleResearch(req({ mode: "ask", text: "What is missing?", records: [] }))).status,
    ).toBe(200);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("aiplatform.googleapis.com");
  });
  it("keeps provider failures honest instead of returning demo answers", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("private provider error", { status: 429 })),
    );
    const response = await handleResearch(req({ mode: "search", text: "backpack customer needs" }));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private provider error");
  });
});
