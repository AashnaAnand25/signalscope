import { z } from "zod";
import {
  DESIRE_IDS,
  JOURNEY_CONTEXTS,
  SOURCE_TYPES,
  type EvidenceRecord,
  type SurveyResponse,
} from "./types";
export const codingSchema = z.object({
  desire: z.enum(DESIRE_IDS),
  need: z.string().trim().min(1).max(500),
  context: z.string().max(1000).optional(),
  target: z.string().max(500).optional(),
  importance: z.enum(["must-have", "preference", "unknown"]),
  fulfillment: z.enum(["met", "partly-met", "unmet", "conflicting", "unknown"]),
  tradeoff: z.string().max(1000).optional(),
  dealbreaker: z.boolean().optional(),
  linkedWith: z.array(z.enum(DESIRE_IDS)).optional(),
});
export const evidenceSchema = z.object({
  id: z.string().min(1).max(160),
  productId: z.string().min(1),
  sourceType: z.enum(SOURCE_TYPES),
  text: z.string().trim().min(1).max(12000),
  sourceUrl: z.string().url().startsWith("https://").optional(),
  sourceReference: z.string().trim().min(1).max(500).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((date) => {
      const parsed = new Date(`${date}T00:00:00Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    }, "Invalid calendar date")
    .optional(),
  journey: z.enum(JOURNEY_CONTEXTS).optional(),
  journeyBasis: z.enum(["stated", "inferred"]).optional(),
  codings: z.array(codingSchema).max(30),
  barrier: z.string().max(2000).optional(),
  workaround: z.string().max(2000).optional(),
  classification: z.enum(["observed", "self-reported", "inferred", "unknown"]),
  codingStatus: z.enum(["pre-coded-demo", "respondent-selected", "ai-suggested", "human-reviewed"]),
  origin: z.enum(["synthetic-seed", "collected"]),
  budget: z
    .object({
      min: z.number().nonnegative().optional(),
      max: z.number().nonnegative().optional(),
      label: z.string().min(1),
    })
    .refine(
      (b) => b.min === undefined || b.max === undefined || b.min <= b.max,
      "Budget bounds reversed",
    )
    .optional(),
  answered: z.boolean().optional(),
  tone: z.enum(["positive", "mixed", "negative"]).optional(),
  surveyResponseId: z.string().optional(),
  surveyTopDesire: z.enum(DESIRE_IDS).optional(),
});
export function parseEvidenceImport(
  input: unknown,
  productId: string,
  existingIds: string[] = [],
): EvidenceRecord[] {
  const records = z.array(evidenceSchema).min(1).max(5000).parse(input);
  const seen = new Set(existingIds);
  for (const r of records) {
    if (r.sourceType === "survey")
      throw new Error(
        `Import survey answers through the survey form, not evidence JSON (${r.id}).`,
      );
    if (r.surveyResponseId || r.surveyTopDesire)
      throw new Error(`Non-survey record ${r.id} cannot link to a survey response.`);
    if (r.origin === "collected" && !r.sourceUrl && !r.sourceReference)
      throw new Error(`Collected record ${r.id} needs a source URL or reference.`);
    if (
      (r.origin === "collected" &&
        ["pre-coded-demo", "respondent-selected"].includes(r.codingStatus)) ||
      (r.origin === "synthetic-seed" && r.codingStatus !== "pre-coded-demo")
    )
      throw new Error(`Record ${r.id} has a coding status inconsistent with its origin.`);
    if (r.productId !== productId)
      throw new Error(`Product mismatch on ${r.id}. Expected ${productId}.`);
    if (seen.has(r.id)) throw new Error(`Duplicate record ID: ${r.id}`);
    seen.add(r.id);
  }
  return JSON.parse(JSON.stringify(records)) as EvidenceRecord[];
}
export const responseSchema = z.object({
  id: z.string().min(1),
  productId: z.string(),
  submittedAt: z.string().datetime(),
  origin: z.enum(["synthetic-seed", "collected"]),
  awareness: z.enum(["yes", "no", "not-sure"]),
  discovery: z.string().max(40).optional(),
  topDesire: z.enum(DESIRE_IDS),
  priceRange: z.string().max(20),
  needToKnow: z.string().max(400).optional(),
  experience: z.enum([
    "never-encountered",
    "not-interested",
    "considered",
    "purchased",
    "accessed-other",
  ]),
  usedProduct: z.enum(["yes", "no"]).optional(),
  usageNotes: z.string().max(400).optional(),
  posted: z.enum(["posted-publicly", "told-someone", "no"]).optional(),
});
export function validateResponse(input: unknown): SurveyResponse {
  return JSON.parse(JSON.stringify(responseSchema.parse(input))) as SurveyResponse;
}
export const persistedSchema = z.object({
  productId: z.string(),
  responses: z.array(responseSchema).default([]),
  externalRecords: z.array(evidenceSchema).default([]),
  tagOverrides: z
    .record(z.object({ desires: z.array(z.enum(DESIRE_IDS)), reviewedAt: z.string() }))
    .default({}),
  opportunityStatus: z.record(z.enum(["investigate", "ready-to-test", "tested"])).default({}),
  bookmarks: z.array(z.string()).default([]),
  trail: z.record(z.boolean()).default({}),
});
