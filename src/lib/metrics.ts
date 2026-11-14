import {
  DESIRE_IDS,
  JOURNEY_CONTEXTS,
  SOURCE_TYPES,
  type DesireId,
  type EvidenceRecord,
  type JourneyContext,
  type Opportunity,
  type ProductConfig,
  type SourceType,
  type SurveyResponse,
} from "./types";
import { surveyToEvidence } from "./survey";

/** Reviewer corrections: replaces desire tags only. Source text is never touched. */
export interface TagOverride {
  desires: DesireId[];
  reviewedAt: string;
}

export interface Fraction {
  numerator: number;
  denominator: number;
  /** Plural unit, e.g. "evidence records". */
  unit: string;
}

export function share(f: Fraction): number | null {
  return f.denominator > 0 ? f.numerator / f.denominator : null;
}

export function applyOverride(record: EvidenceRecord, override?: TagOverride): EvidenceRecord {
  if (!override) return record;
  const kept = record.codings.filter((c) => override.desires.includes(c.desire));
  const added = override.desires
    .filter((d) => !record.codings.some((c) => c.desire === d))
    .map((desire) => ({
      desire,
      need: "Reviewer-added tag — need not yet described",
      importance: "unknown" as const,
      fulfillment: "unknown" as const,
    }));
  return { ...record, codings: [...kept, ...added], codingStatus: "human-reviewed" };
}

/** All records for a product: seeded passages, seeded survey responses, collected responses. */
export function buildRecords(
  product: ProductConfig,
  responses: SurveyResponse[],
  overrides: Record<string, TagOverride> = {},
  external: EvidenceRecord[] = [],
): EvidenceRecord[] {
  const survey = responses
    .filter((r) => r.productId === product.id)
    .map((r) => surveyToEvidence(r, product));
  return [
    ...product.evidence,
    ...external.filter((r) => r.productId === product.id),
    ...survey,
  ].map((r) => applyOverride(r, overrides[r.id]));
}

export function hasDesire(r: EvidenceRecord, d: DesireId) {
  return r.codings.some((c) => c.desire === d);
}

export interface DesireStats {
  desire: DesireId;
  total: number;
  mentions: number;
  mustHave: number;
  unmet: number;
  knownFulfillment: number;
  workaround: number;
  dealbreaker: number;
  bySource: Record<SourceType, number>;
}

export function desireStats(records: EvidenceRecord[], desire: DesireId): DesireStats {
  const bySource = Object.fromEntries(SOURCE_TYPES.map((s) => [s, 0])) as Record<
    SourceType,
    number
  >;
  let mentions = 0,
    mustHave = 0,
    unmet = 0,
    knownFulfillment = 0,
    workaround = 0,
    dealbreaker = 0;
  for (const r of records) {
    const cs = r.codings.filter((c) => c.desire === desire);
    if (!cs.length) continue;
    mentions++;
    bySource[r.sourceType]++;
    if (cs.some((c) => c.importance === "must-have")) mustHave++;
    if (cs.some((c) => c.fulfillment === "unmet")) unmet++;
    if (cs.some((c) => ["met", "partly-met", "unmet"].includes(c.fulfillment))) knownFulfillment++;
    if (cs.some((c) => c.dealbreaker)) dealbreaker++;
    if (r.workaround) workaround++;
  }
  return {
    desire,
    total: records.length,
    mentions,
    mustHave,
    unmet,
    knownFulfillment,
    workaround,
    dealbreaker,
    bySource,
  };
}

export function allDesireStats(records: EvidenceRecord[]) {
  return DESIRE_IDS.map((d) => desireStats(records, d));
}

/** Records mentioning both desires, for every pair with ≥1 co-mention. */
export function coOccurrence(records: EvidenceRecord[]) {
  const pairs: { a: DesireId; b: DesireId; count: number }[] = [];
  for (let i = 0; i < DESIRE_IDS.length; i++) {
    for (let j = i + 1; j < DESIRE_IDS.length; j++) {
      const a = DESIRE_IDS[i]!,
        b = DESIRE_IDS[j]!;
      const count = records.filter((r) => hasDesire(r, a) && hasDesire(r, b)).length;
      if (count) pairs.push({ a, b, count });
    }
  }
  return pairs.sort((x, y) => y.count - x.count);
}

/** Stated budgets bucketed into the product's survey price ranges. Stated ≠ willingness to pay. */
export function priceDistribution(records: EvidenceRecord[], product: ProductConfig) {
  const ranges = product.survey.priceRanges.filter(
    (p) => p.min !== undefined || p.max !== undefined,
  );
  const budgets = records.filter(
    (r) => r.budget && (r.budget.min !== undefined || r.budget.max !== undefined),
  );
  const assignments = budgets.map((r) => {
    const b = r.budget!;
    const exact = ranges.findIndex((p) => b.label === `Would consider ${p.label}`);
    if (exact >= 0) return exact;
    const point = b.max ?? b.min!;
    return ranges.findIndex(
      (p) => (p.min === undefined || point >= p.min) && (p.max === undefined || point <= p.max),
    );
  });
  return {
    buckets: ranges.map((r, i) => ({
      value: r.value,
      label: r.label,
      count: assignments.filter((a) => a === i).length,
    })),
    denominator: budgets.length,
    unclassified: assignments.filter((i) => i < 0).length,
  };
}

/** Desire mentions by journey context, using only contexts the record states. */
export function desireByJourney(records: EvidenceRecord[], desire: DesireId) {
  const stated = records.filter((r) => r.journey && r.journeyBasis === "stated");
  return JOURNEY_CONTEXTS.map((j) => {
    const inStage = stated.filter((r) => r.journey === j);
    return {
      journey: j,
      mentions: inStage.filter((r) => hasDesire(r, desire)).length,
      total: inStage.length,
    };
  }).filter((row) => row.total > 0);
}

export interface Summary {
  evidenceRecords: number;
  passages: number;
  surveySeeded: number;
  surveyCollected: number;
  needsIdentified: number;
  categoriesWithEvidence: number;
  unansweredQuestions: number;
  unresolvedConflicts: number;
}

export function summarize(product: ProductConfig, records: EvidenceRecord[]): Summary {
  const passages = records.filter((r) => r.sourceType !== "survey");
  const survey = records.filter((r) => r.sourceType === "survey");
  const needs = new Set(
    passages.flatMap((r) =>
      r.codings
        .filter((c) => !c.need.startsWith("Reviewer-added"))
        .map((c) => `${c.desire}:${c.need}`),
    ),
  );
  return {
    evidenceRecords: records.length,
    passages: passages.length,
    surveySeeded: survey.filter((r) => r.origin === "synthetic-seed").length,
    surveyCollected: survey.filter((r) => r.origin === "collected").length,
    needsIdentified: needs.size,
    categoriesWithEvidence: DESIRE_IDS.filter((d) => records.some((r) => hasDesire(r, d))).length,
    unansweredQuestions: passages.filter((r) => r.sourceType === "qa" && r.answered === false)
      .length,
    unresolvedConflicts: product.conflicts.length,
  };
}

export function dateRange(records: EvidenceRecord[]) {
  const dates = records
    .map((r) => r.date)
    .filter((d): d is string => !!d)
    .sort();
  return { from: dates[0], to: dates[dates.length - 1], undated: records.length - dates.length };
}

/** Survey responses whose "matters most" pick matches a desire. */
export function surveyPicks(records: EvidenceRecord[], desire: DesireId): Fraction {
  const survey = records.filter((r) => r.sourceType === "survey" && r.surveyTopDesire);
  return {
    numerator: survey.filter((r) => r.surveyTopDesire === desire).length,
    denominator: survey.length,
    unit: "survey responses",
  };
}

export function opportunityEvidence(o: Opportunity, records: EvidenceRecord[]) {
  const byId = new Map(records.map((r) => [r.id, r]));
  const supporting = o.supportingIds
    .map((id) => byId.get(id))
    .filter((r): r is EvidenceRecord => !!r);
  const contradicting = o.contradictingIds
    .map((id) => byId.get(id))
    .filter((r): r is EvidenceRecord => !!r);
  const survey = o.surveySupportDesire ? surveyPicks(records, o.surveySupportDesire) : undefined;
  return { supporting, contradicting, survey };
}

/** Draft research opportunities derived only from reviewed, collected passages. */
export function derivedOpportunities(records: EvidenceRecord[]): Opportunity[] {
  const groups = new Map<
    string,
    {
      desire: DesireId;
      need: string;
      supportingIds: Set<string>;
      contradictingIds: Set<string>;
    }
  >();
  for (const r of records) {
    if (
      r.origin !== "collected" ||
      r.sourceType === "survey" ||
      r.codingStatus !== "human-reviewed"
    )
      continue;
    for (const c of r.codings) {
      const need = c.need.trim().replace(/\s+/g, " ");
      if (!need || need.startsWith("Reviewer-added tag")) continue;
      const key = `${c.desire}:${need.toLowerCase()}`;
      const group = groups.get(key) ?? {
        desire: c.desire,
        need,
        supportingIds: new Set<string>(),
        contradictingIds: new Set<string>(),
      };
      if (c.fulfillment === "unmet" || c.fulfillment === "partly-met")
        group.supportingIds.add(r.id);
      if (c.fulfillment === "met") group.contradictingIds.add(r.id);
      groups.set(key, group);
    }
  }
  return [...groups.entries()]
    .filter(([, group]) => group.supportingIds.size)
    .sort((a, b) => b[1].supportingIds.size - a[1].supportingIds.size)
    .slice(0, 50)
    .map(([key, group]) => ({
      id: `collected:${key}`,
      title: `Investigate: ${group.need}`,
      improvement: `Explore a product or information change that addresses: ${group.need}.`,
      supportingIds: [...group.supportingIds],
      contradictingIds: [...group.contradictingIds],
      missing: [
        "How often this need occurs outside the collected passages",
        "Whether a change would affect purchase decisions",
      ],
      hypothesis: `Addressing ${group.need} may improve the experience for people who raised it.`,
      experiment:
        "Compare the current product with a revised concept among relevant buyers and non-buyers; record choices, reasons, and trade-offs.",
      desires: [group.desire],
      defaultStatus: "investigate",
    }));
}

export function rankOpportunities(opps: Opportunity[], records: EvidenceRecord[]) {
  return [...opps]
    .map((o) => ({ o, ev: opportunityEvidence(o, records) }))
    .sort(
      (a, b) =>
        b.ev.supporting.length - a.ev.supporting.length ||
        (b.ev.survey?.numerator ?? 0) - (a.ev.survey?.numerator ?? 0),
    );
}

export function pct(f: Fraction) {
  const s = share(f);
  return s === null ? "—" : `${Math.round(s * 100)}%`;
}
