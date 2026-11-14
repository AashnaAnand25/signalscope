import { describe, it, expect } from "vitest";
import { campusBackpack } from "@/data/campus-backpack";
import {
  applyOverride,
  derivedOpportunities,
  desireStats,
  priceDistribution,
  surveyPicks,
} from "@/lib/metrics";
import { parseEvidenceImport, persistedSchema } from "@/lib/validation";
import { surveySchema, surveyToEvidence } from "@/lib/survey";
import { buildJourney } from "@/lib/journey";
import { seededSurveyResponses } from "@/data/campus-backpack";
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
  it("tag edits do not rewrite what a respondent selected", () => {
    const response = seededSurveyResponses[0]!;
    const evidence = surveyToEvidence(response, campusBackpack);
    const corrected = applyOverride(evidence, {
      desires: [response.topDesire === "price" ? "quality" : "price"],
      reviewedAt: new Date().toISOString(),
    });
    expect(surveyPicks([corrected], response.topDesire).numerator).toBe(1);
  });
  it("counts reported use even without optional usage notes", () => {
    const response = {
      ...seededSurveyResponses[0]!,
      experience: "purchased" as const,
      usedProduct: "yes" as const,
      usageNotes: undefined,
    };
    const node = buildJourney([], [response]).nodes.find((n) => n.id === "activated")!;
    expect(node.measures.find((m) => m.label === "Respondents reporting use")?.count).toBe(1);
  });
  it("creates a traceable draft from reviewed collected unmet evidence", () => {
    const r = record();
    r.id = "COLLECTED-1";
    r.origin = "collected";
    r.sourceReference = "Interview 1, question 4";
    r.codingStatus = "human-reviewed";
    r.codings = [
      {
        desire: "quality",
        need: "Straps that support a heavy load",
        importance: "must-have",
        fulfillment: "unmet",
      },
    ];
    const imported = parseEvidenceImport([r], campusBackpack.id);
    const draft = derivedOpportunities(imported)[0]!;
    expect(draft.supportingIds).toEqual([r.id]);
    expect(draft.title).toContain("Straps that support a heavy load");
  });
  it("rejects unsourced collected passages and survey records in evidence imports", () => {
    const r = record();
    r.id = "COLLECTED-2";
    r.origin = "collected";
    r.codingStatus = "human-reviewed";
    expect(() => parseEvidenceImport([r], campusBackpack.id)).toThrow("source URL or reference");
    r.sourceReference = "Interview 2";
    r.sourceType = "survey";
    r.surveyResponseId = "invented";
    expect(() => parseEvidenceImport([r], campusBackpack.id)).toThrow("survey form");
  });
  it("rejects impossible calendar dates in imported records", () => {
    const r = record();
    r.id = "BAD-DATE";
    r.date = "2026-02-30";
    expect(() => parseEvidenceImport([r], campusBackpack.id)).toThrow();
  });
});
