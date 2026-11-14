import { describe, it, expect } from "vitest";
import { campusBackpack } from "@/data/campus-backpack";
import { desireStats, priceDistribution } from "@/lib/metrics";
import { parseEvidenceImport, persistedSchema } from "@/lib/validation";
import { surveySchema } from "@/lib/survey";
function record() {
  return structuredClone(campusBackpack.evidence[0]!);
}
describe("Research measurement boundaries", () => {
  it("unknown fulfillment is not included in the known-fulfillment denominator", () => {
    const a = record(),
      b = record();
    a.codings = [
      { desire: "compatibility", need: "Fit", importance: "unknown", fulfillment: "unmet" },
    ];
    b.codings = [
      { desire: "compatibility", need: "Fit", importance: "unknown", fulfillment: "unknown" },
    ];
    const s = desireStats([a, b], "compatibility");
    expect(s.mentions).toBe(2);
    expect(s.knownFulfillment).toBe(1);
    expect(s.unmet).toBe(1);
  });
  it("ownership alone never retains an asserted use experience", () => {
    const parsed = surveySchema.parse({
      awareness: "yes",
      experience: "purchased",
      topDesire: "quality",
      priceRange: "60-79",
      usedProduct: "no",
      usageNotes: "should not survive",
      posted: "posted-publicly",
    });
    expect(parsed.usageNotes).toBeUndefined();
    expect(parsed.posted).toBeUndefined();
  });
  it("imports reject duplicate identities and unsafe URLs", () => {
    const r = record();
    expect(() => parseEvidenceImport([r], r.productId, [r.id])).toThrow("Duplicate");
    r.sourceUrl = "javascript:alert(1)";
    expect(() => parseEvidenceImport([r], r.productId)).toThrow();
  });
  it("an import cannot silently switch its product", () => {
    const r = record();
    expect(() => parseEvidenceImport([r], "different-product")).toThrow("Product mismatch");
  });
  it("a budget enters at most one price bucket", () => {
    const r = record();
    r.budget = { min: 40, max: 59, label: "Would consider $40–59" };
    const d = priceDistribution([r], campusBackpack);
    expect(d.buckets.reduce((n, b) => n + b.count, 0)).toBe(1);
  });
  it("malformed browser state is rejected rather than trusted", () => {
    expect(() =>
      persistedSchema.parse({
        productId: campusBackpack.id,
        responses: [{ topDesire: "invented" }],
      }),
    ).toThrow();
  });
});
