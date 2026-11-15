import { createHash } from "node:crypto";
import { describe, expect, it, vi, afterEach } from "vitest";
const mocks = vi.hoisted(() => ({ generate: vi.fn(), capture: vi.fn() }));
vi.mock("@/server/agents/provider.server", () => ({
  agentProvider: () => ({ generate: mocks.generate }),
  parseAgentJson: JSON.parse,
  publicAgentError: (e: Error) => e.message,
}));
vi.mock("@/server/web-capture.server", () => ({
  capturePublicPage: mocks.capture,
  publicUrl: (url: string) => new URL(url),
}));
import { handlePortfolio } from "@/server/agents/portfolio.server";
const feedbackURL = "https://www.g2.com/products/velocity-ai/reviews";
const alternativeURL = "https://example.com/planner";
const id = (url: string) => `SRC-${createHash("sha256").update(url).digest("hex").slice(0, 16)}`;
const quote = "We used Velocity AI and could not export our audit trail.";
afterEach(() => vi.unstubAllEnvs());
describe("Automatic product research", () => {
  it("discovers alternatives and ingests source-backed feedback without competitor fields", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only");
    mocks.capture.mockImplementation(async (url: string) => ({
      title:
        url === feedbackURL
          ? "Kearney Velocity AI review"
          : url === alternativeURL
            ? "ExamplePlanner"
            : "Velocity AI | Kearney",
      text:
        url === feedbackURL
          ? `Kearney Velocity AI customer review. ${quote}`
          : url === alternativeURL
            ? "ExamplePlanner supports scenario analysis."
            : "Kearney Velocity AI supports concept development.",
      url,
      capturedAt: "2026-11-14T00:00:00Z",
      method: "public-html",
    }));
    mocks.generate.mockImplementation(async (_task: string, prompt: string) => {
      const output = (text: string, sources: { url: string; title: string }[] = []) => ({
        text,
        sources,
        model: "fixture",
        provider: "fixture",
      });
      if (prompt.startsWith("Find public feedback"))
        return output("An attributed review was found.", [{ url: feedbackURL, title: "Review" }]);
      if (prompt.startsWith("Identify 3 to 5"))
        return output("ExamplePlanner is a relevant adjacent scenario-analysis product.", [
          { url: alternativeURL, title: "ExamplePlanner" },
        ]);
      if (prompt.startsWith("Extract competitors"))
        return output(
          JSON.stringify({
            competitors: [
              {
                name: "ExamplePlanner",
                url: alternativeURL,
                sourceUrl: alternativeURL,
                rationale: "Adjacent scenario analysis",
                relation: "adjacent",
              },
            ],
          }),
        );
      if (prompt.startsWith("Find actual customer reviews"))
        return output("No additional captured reviews.");
      if (prompt.includes("Return empty roadmap"))
        return output(
          JSON.stringify({
            comments: [
              {
                quote,
                documentId: id(feedbackURL),
                kind: "customer-feedback",
                tone: "negative",
                cluster: "Audit export",
                codings: [
                  {
                    desire: "features",
                    need: "Export audit trail",
                    importance: "unknown",
                    fulfillment: "unmet",
                  },
                ],
              },
            ],
            roadmap: [],
            matrix: [],
          }),
        );
      return output(
        JSON.stringify({
          comments: [],
          matrix: [],
          roadmap: [
            {
              title: "Test an audit export",
              improvement: "Prototype export",
              hypothesis: "An export may reduce manual review effort",
              experiment: "Compare completion time on a defined review task",
              documentIds: [id(feedbackURL)],
              quote,
              basis: "customer-feedback",
            },
          ],
        }),
      );
    });
    const request = new Request("http://localhost:8081/api/portfolio", {
      method: "POST",
      headers: { Origin: "http://localhost:8081" },
      body: JSON.stringify({ productId: "velocity-ai", refresh: true }),
    });
    const response = await handlePortfolio(request);
    expect(response.status).toBe(202);
    let job = await response.json();
    for (let n = 0; n < 25 && job.status === "running"; n++) {
      await new Promise((r) => setTimeout(r, 0));
      job = await (
        await handlePortfolio(new Request(`http://localhost:8081/api/portfolio?job=${job.id}`))
      ).json();
    }
    expect(job.status).toBe("complete");
    expect(job.competitors[0].name).toBe("ExamplePlanner");
    expect(job.records[0].text).toBe(quote);
    expect(job.records[0].codingStatus).toBe("ai-suggested");
    expect(job.records[0].sourceUrl).toBe(feedbackURL);
    expect(job.analysis.roadmap[0].documentIds).toEqual([id(feedbackURL)]);
    expect(JSON.stringify(job)).not.toContain("test-only");
  });
  it("requires same-origin writes", async () => {
    expect(
      (
        await handlePortfolio(
          new Request("http://localhost:8081/api/portfolio", {
            method: "POST",
            headers: { Origin: "https://other.example" },
            body: "{}",
          }),
        )
      ).status,
    ).toBe(403);
  });
});

it("retains a labeled seed description when capture and providers both fail", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-only");
  vi.stubEnv("VERCEL", "1");
  mocks.capture.mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
  mocks.generate.mockRejectedValue(new Error("MODEL_UNAVAILABLE: test provider"));
  const response = await handlePortfolio(
    new Request("http://localhost:8081/api/portfolio", {
      method: "POST",
      headers: { Origin: "http://localhost:8081" },
      body: JSON.stringify({ productId: "ingredient-compass", refresh: true }),
    }),
  );
  const job = await response.json();
  expect(job.status).toBe("failed");
  expect(job.description.mode).toBe("seed-demo");
  expect(job.description.text.length).toBeGreaterThan(50);
  expect(job.records).toEqual([]);
  expect(job.documents[0].note).toContain("ENOTFOUND");
});
it("uses an authorized excerpt after a failed live capture, without inventing customer feedback", async () => {
  vi.stubEnv("GEMINI_API_KEY", "test-only");
  vi.stubEnv("VERCEL", "1");
  mocks.capture.mockRejectedValue(new Error("Source blocked"));
  mocks.generate.mockRejectedValue(new Error("REQUEST_TIMEOUT: test provider"));
  const excerpt = "Authorized test-only product description. ".repeat(4);
  const response = await handlePortfolio(
    new Request("http://localhost:8081/api/portfolio", {
      method: "POST",
      headers: { Origin: "http://localhost:8081" },
      body: JSON.stringify({ productId: "tariff-simulator", refresh: true, excerpt }),
    }),
  );
  const job = await response.json();
  expect(job.description.mode).toBe("authorized-excerpt");
  expect(job.description.text).toBe(excerpt);
  expect(job.documents[0].kind).toBe("provider-claim");
  expect(job.records).toEqual([]);
});
