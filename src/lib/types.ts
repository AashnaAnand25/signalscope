/** Core domain types for SignalScope. Product-agnostic by design. */

export const DESIRE_IDS = [
  "features",
  "price",
  "quality",
  "speed",
  "convenience",
  "reliability",
  "appearance",
  "sustainability",
  "compatibility",
  "customization",
] as const;
export type DesireId = (typeof DESIRE_IDS)[number];

export const SOURCE_TYPES = ["review", "qa", "discussion", "survey", "observed"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export type Importance = "must-have" | "preference" | "unknown";
export type Fulfillment = "met" | "partly-met" | "unmet" | "conflicting" | "unknown";
export type EvidenceClass = "observed" | "self-reported" | "inferred" | "unknown";
/** How the desire tags on a record were produced. */
export type CodingStatus =
  "pre-coded-demo" | "respondent-selected" | "ai-suggested" | "human-reviewed";
export type RecordOrigin = "synthetic-seed" | "collected";

export const JOURNEY_CONTEXTS = [
  "discovery",
  "consideration",
  "purchase",
  "use",
  "support",
  "feedback",
  "after",
] as const;
export type JourneyContext = (typeof JOURNEY_CONTEXTS)[number];

export interface DesireCoding {
  desire: DesireId;
  /** The capability or outcome requested, in neutral words. */
  need: string;
  /** Usage context, only where stated. */
  context?: string | undefined;
  /** Explicit budget, threshold or specification, only where stated. */
  target?: string | undefined;
  importance: Importance;
  fulfillment: Fulfillment;
  /** What the person explicitly accepts sacrificing. */
  tradeoff?: string | undefined;
  dealbreaker?: boolean | undefined;
  /** Other desires this requirement is explicitly linked to in the same passage. */
  linkedWith?: DesireId[] | undefined;
}

export interface StatedBudget {
  /** Stated budget in USD; a stated number, not a demonstrated willingness to pay. */
  min?: number | undefined;
  max?: number | undefined;
  label: string;
}

export interface EvidenceRecord {
  id: string;
  productId: string;
  sourceType: SourceType;
  text: string;
  sourceUrl?: string | undefined;
  /** Citation for interviews, support tickets, or other non-URL sources. */
  sourceReference?: string | undefined;
  /** ISO date, or undefined → "Date unavailable". */
  date?: string | undefined;
  journey?: JourneyContext | undefined;
  /** How the journey context was established. */
  journeyBasis?: "stated" | "inferred" | undefined;
  codings: DesireCoding[];
  barrier?: string | undefined;
  workaround?: string | undefined;
  classification: EvidenceClass;
  codingStatus: CodingStatus;
  origin: RecordOrigin;
  budget?: StatedBudget | undefined;
  /** For Q&A: whether the question has an answer in the collection. */
  answered?: boolean | undefined;
  /** Overall tone of feedback passages (reviews / discussion), where coded. */
  tone?: "positive" | "mixed" | "negative" | undefined;
  /** Links to the survey response this record was created from. */
  surveyResponseId?: string | undefined;
  /** Immutable answer, separate from editable reviewer coding. */
  surveyTopDesire?: DesireId | undefined;
}

export interface ConflictPair {
  id: string;
  title: string;
  issue: string;
  sideA: { label: string; recordIds: string[] };
  sideB: { label: string; recordIds: string[] };
  desires: DesireId[];
}

export type OpportunityStatus = "investigate" | "ready-to-test" | "tested";

export interface Opportunity {
  id: string;
  title: string;
  improvement: string;
  supportingIds: string[];
  contradictingIds: string[];
  missing: string[];
  hypothesis: string;
  experiment: string;
  desires: DesireId[];
  defaultStatus: OpportunityStatus;
  /** Optional: desire whose survey "matters most" picks count as additional support. */
  surveySupportDesire?: DesireId | undefined;
}

export type HotspotId = "laptop" | "straps" | "main" | "fabric" | "price";

export interface Hotspot {
  id: HotspotId;
  label: string;
  description: string;
  desires: DesireId[];
  /** Position on the product illustration, in % of width / height. */
  x: number;
  y: number;
}

export interface ResearchQuestion {
  id: string;
  desire: DesireId;
  question: string;
}

export interface ProductConfig {
  id: string;
  name: string;
  shortName: string;
  category: string;
  /** Plural noun for the category, e.g. "backpacks". */
  categoryPlural: string;
  description: string;
  attributes: { label: string; value: string }[];
  image: { src: string; alt: string; width: number; height: number };
  hotspots: Hotspot[];
  evidence: EvidenceRecord[];
  conflicts: ConflictPair[];
  opportunities: Opportunity[];
  researchQuestions: ResearchQuestion[];
  /** Product-specific wording for desire categories. */
  desireHints: Partial<Record<DesireId, string>>;
  survey: {
    discoveryOptions: { value: string; label: string }[];
    priceRanges: { value: string; label: string; min?: number; max?: number }[];
  };
}

export type SurveyAwareness = "yes" | "no" | "not-sure";
export type SurveyExperience =
  "never-encountered" | "not-interested" | "considered" | "purchased" | "accessed-other";
export type SurveyPosted = "posted-publicly" | "told-someone" | "no";

export interface SurveyResponse {
  id: string;
  productId: string;
  submittedAt: string;
  origin: RecordOrigin;
  awareness: SurveyAwareness;
  discovery?: string | undefined;
  topDesire: DesireId;
  priceRange: string;
  needToKnow?: string | undefined;
  experience: SurveyExperience;
  usedProduct?: "yes" | "no" | undefined;
  usageNotes?: string | undefined;
  posted?: SurveyPosted | undefined;
}
