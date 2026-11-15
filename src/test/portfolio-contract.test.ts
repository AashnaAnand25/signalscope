import { describe, expect, it } from "vitest";
import { validateAnalysis, type ResearchDocument } from "@/lib/portfolio-contract";
const doc: ResearchDocument = {
  id: "S1",
  url: "https://example.com/review",
  title: "Fixture",
  platform: "example.com",
  text: "The export workflow takes too long.",
  capturedAt: "2026-11-14T00:00:00Z",
  kind: "customer-feedback",
  status: "captured",
  subject: "Velocity AI",
};
const empty = { comments: [], roadmap: [], matrix: [] };
const comment = {
  quote: doc.text,
  documentId: "S1",
  kind: "customer-feedback",
  tone: "negative",
  cluster: "Export workflow",
  codings: [],
};
const cell = { value: "Unknown", documentIds: [] as string[], quote: "" };
describe("Portfolio grounding", () => {
  it("accepts an attributed exact customer quote", () =>
    expect(
      validateAnalysis({ ...empty, comments: [comment] }, [doc], ["Velocity AI"]).comments,
    ).toHaveLength(1));
  it("rejects a fabricated quote", () =>
    expect(() =>
      validateAnalysis(
        { ...empty, comments: [{ ...comment, quote: "Everyone hates this product" }] },
        [doc],
        ["Velocity AI"],
      ),
    ).toThrow("not found"));
  it("cannot turn provider marketing into customer testimony", () =>
    expect(() =>
      validateAnalysis(
        { ...empty, comments: [comment] },
        [{ ...doc, kind: "provider-claim" }],
        ["Velocity AI"],
      ),
    ).toThrow("Provider claims"));
  it("does not transfer a competitor's complaint to the primary product", () =>
    expect(() =>
      validateAnalysis(
        { ...empty, comments: [comment] },
        [{ ...doc, subject: "Competitor" }],
        ["Velocity AI"],
      ),
    ).toThrow("competing product"));
  it("rejects cross-product matrix citations", () =>
    expect(() =>
      validateAnalysis(
        {
          ...empty,
          matrix: [
            {
              product: "Competitor",
              pricing: { value: "Cheap", documentIds: ["S1"], quote: doc.text },
              ai: cell,
              timeToValue: cell,
              sentiment: cell,
            },
          ],
        },
        [doc],
        ["Velocity AI", "Competitor"],
      ),
    ).toThrow("another or unidentified"));
  it("keeps ungrounded matrix cells unknown", () => {
    const r = validateAnalysis(
      {
        ...empty,
        matrix: [
          {
            product: "Velocity AI",
            pricing: { ...cell, value: "$20 per month" },
            ai: cell,
            timeToValue: cell,
            sentiment: cell,
          },
        ],
      },
      [doc],
      ["Velocity AI"],
    );
    expect(r.matrix[0]!.pricing.value).toBe("Not established by captured sources");
  });
});
