import type {
  CodingStatus,
  DesireId,
  EvidenceClass,
  Fulfillment,
  Importance,
  JourneyContext,
  OpportunityStatus,
  SourceType,
} from "./types";

export type Tone = "orange" | "sage" | "lavender" | "butter" | "navy" | "muted";

export const DESIRE_META: Record<DesireId, { label: string; tone: Tone }> = {
  features: { label: "Features", tone: "orange" },
  price: { label: "Price", tone: "butter" },
  quality: { label: "Quality", tone: "sage" },
  speed: { label: "Speed", tone: "lavender" },
  convenience: { label: "Convenience", tone: "orange" },
  reliability: { label: "Reliability", tone: "navy" },
  appearance: { label: "Appearance", tone: "lavender" },
  sustainability: { label: "Sustainability", tone: "sage" },
  compatibility: { label: "Compatibility", tone: "butter" },
  customization: { label: "Customization", tone: "lavender" },
};

export const SOURCE_LABEL: Record<SourceType, string> = {
  review: "Review",
  qa: "Q&A",
  discussion: "Public discussion",
  survey: "Survey",
  observed: "Observed event",
};

export const JOURNEY_LABEL: Record<JourneyContext, string> = {
  discovery: "Awareness & discovery",
  consideration: "Interest & consideration",
  purchase: "Purchase or access",
  use: "Activation & use",
  support: "Support",
  feedback: "Feedback",
  after: "Advocacy, repeat, return or churn",
};

export const CLASS_META: Record<EvidenceClass, { label: string; tone: Tone; help: string }> = {
  observed: {
    label: "Observed",
    tone: "sage",
    help: "Recorded directly (e.g., an event log or the existence of a submitted review).",
  },
  "self-reported": {
    label: "Self-reported",
    tone: "butter",
    help: "What a person said about themselves or their experience.",
  },
  inferred: {
    label: "Inferred hypothesis",
    tone: "lavender",
    help: "A reasoned guess from indirect signals. Needs verification.",
  },
  unknown: {
    label: "Unknown",
    tone: "muted",
    help: "No data in the collection can establish this.",
  },
};

export const IMPORTANCE_LABEL: Record<Importance, string> = {
  "must-have": "Must-have",
  preference: "Preference",
  unknown: "Importance unknown",
};

export const FULFILLMENT_META: Record<Fulfillment, { label: string; tone: Tone }> = {
  met: { label: "Met", tone: "sage" },
  "partly-met": { label: "Partly met", tone: "butter" },
  unmet: { label: "Unmet", tone: "orange" },
  conflicting: { label: "Conflicting", tone: "lavender" },
  unknown: { label: "Unknown", tone: "muted" },
};

export const CODING_LABEL: Record<CodingStatus, string> = {
  "pre-coded-demo": "Pre-coded demo tags",
  "respondent-selected": "Selected by respondent",
  "ai-suggested": "AI-suggested",
  "human-reviewed": "Human-reviewed",
};

export const STATUS_META: Record<OpportunityStatus, { label: string; tone: Tone }> = {
  investigate: { label: "Investigate", tone: "lavender" },
  "ready-to-test": { label: "Ready to test", tone: "butter" },
  tested: { label: "Tested", tone: "sage" },
};

export function formatDate(iso?: string) {
  if (!iso) return "Date unavailable";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date unavailable";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
