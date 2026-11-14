import { z } from "zod";
import {
  DESIRE_IDS,
  type EvidenceRecord,
  type JourneyContext,
  type ProductConfig,
  type SurveyResponse,
} from "./types";

export const AWARENESS_OPTIONS = [
  { value: "yes", label: "Yes, I'd heard of it" },
  { value: "no", label: "No, this is new to me" },
  { value: "not-sure", label: "I'm not sure" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: "never-encountered", label: "I'd never encountered it before today" },
  { value: "not-interested", label: "I came across it, but it isn't relevant to me" },
  { value: "considered", label: "I considered it, but haven't got one" },
  { value: "purchased", label: "I purchased it" },
  { value: "accessed-other", label: "I have one another way (gift, borrowed, shared)" },
] as const;

export const POSTED_OPTIONS = [
  { value: "posted-publicly", label: "Yes, I posted a review or comment" },
  { value: "told-someone", label: "I told someone directly, but didn't post" },
  { value: "no", label: "No" },
] as const;

/** Users of the product: only these are asked usage questions. */
export function hasUsedProduct(experience: string | undefined, used?: string) {
  return used === "yes" && (experience === "purchased" || experience === "accessed-other");
}

const text = z
  .string()
  .trim()
  .max(400, "Please keep this under 400 characters.")
  .optional()
  .transform((v) => (v ? v : undefined));

export const surveySchema = z
  .object({
    awareness: z.enum(["yes", "no", "not-sure"], { required_error: "Please choose an answer." }),
    discovery: z.string().max(40).optional(),
    topDesire: z.enum(DESIRE_IDS, { required_error: "Please pick what matters most." }),
    priceRange: z
      .string({ required_error: "Please choose a price range." })
      .min(1, "Please choose a price range.")
      .max(20),
    needToKnow: text,
    experience: z.enum(
      ["never-encountered", "not-interested", "considered", "purchased", "accessed-other"],
      { required_error: "Please choose the option that fits best." },
    ),
    usedProduct: z.enum(["yes", "no"]).optional(),
    usageNotes: text,
    posted: z.enum(["posted-publicly", "told-someone", "no"]).optional(),
  })
  .transform((v) => ({
    ...v,
    // Discovery only applies to people who'd heard of it; usage only to people who used it.
    discovery: v.awareness === "yes" ? v.discovery : undefined,
    usedProduct: ["purchased", "accessed-other"].includes(v.experience) ? v.usedProduct : undefined,
    usageNotes: hasUsedProduct(v.experience, v.usedProduct) ? v.usageNotes : undefined,
    posted: hasUsedProduct(v.experience, v.usedProduct) ? v.posted : undefined,
  }));

export type SurveyInput = z.input<typeof surveySchema>;
export type SurveyAnswers = z.output<typeof surveySchema>;

function journeyFor(r: SurveyResponse): JourneyContext | undefined {
  switch (r.experience) {
    case "considered":
      return "consideration";
    case "purchased":
      return r.usedProduct === "yes" || r.usageNotes ? "use" : "purchase";
    case "accessed-other":
      return r.usedProduct === "yes" || r.usageNotes ? "use" : undefined;
    case "not-interested":
      return "discovery";
    default:
      return undefined;
  }
}

/** Converts a survey response into one evidence record (unit: one survey respondent). */
export function surveyToEvidence(r: SurveyResponse, product: ProductConfig): EvidenceRecord {
  const parts: string[] = [];
  if (r.needToKnow) parts.push(`Needs to know: “${r.needToKnow}”`);
  if (r.usageNotes) parts.push(`Experience: “${r.usageNotes}”`);
  const range = product.survey.priceRanges.find((p) => p.value === r.priceRange);
  const hasBudget = range && (range.min !== undefined || range.max !== undefined);
  return {
    id: r.id,
    productId: r.productId,
    sourceType: "survey",
    text: parts.length
      ? parts.join(" · ")
      : "Answered multiple-choice questions only (no free text).",
    date: r.submittedAt.slice(0, 10),
    journey: journeyFor(r),
    journeyBasis: "stated",
    codings: [
      {
        desire: r.topDesire,
        need: `Picked as what matters most when choosing ${product.categoryPlural}`,
        importance: "preference",
        fulfillment: "unknown",
      },
    ],
    classification: "self-reported",
    codingStatus: "respondent-selected",
    origin: r.origin,
    budget: hasBudget
      ? { min: range.min, max: range.max, label: `Would consider ${range.label}` }
      : undefined,
    surveyResponseId: r.id,
  };
}
