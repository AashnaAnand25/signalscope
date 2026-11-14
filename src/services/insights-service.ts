import type { DesireCoding, OpportunityStatus, SurveyResponse } from "@/lib/types";
import type { TagOverride } from "@/lib/metrics";

/**
 * Typed service layer. The app talks only to this interface, so a backend
 * implementation (shared survey responses, authenticated reviewer edits) can
 * replace the local one without touching pages.
 */
export interface PersistedState {
  productId: string;
  responses: SurveyResponse[];
  tagOverrides: Record<string, TagOverride>;
  opportunityStatus: Record<string, OpportunityStatus>;
  bookmarks: string[];
  trail: Record<string, boolean>;
}

export interface InsightsService {
  readonly mode: "local" | "backend";
  /** Shown in the header provenance badge. */
  readonly storageNotice: string;
  load(): PersistedState | null;
  save(state: PersistedState): void;
  clear(): void;
}

export interface DesireExtractionResult {
  available: false;
  reason: string;
} 

/**
 * Integration point for a future backend that extracts desires from supplied text.
 * No AI service is connected in this demo, so this never simulates an analysis call:
 * all tags shown are pre-coded demo tags, respondent selections or reviewer edits.
 */
export async function extractDesires(_text: string): Promise<DesireExtractionResult | { available: true; codings: DesireCoding[] }> {
  return {
    available: false,
    reason: "No analysis service is connected. Tags in this demo are pre-coded, respondent-selected or reviewer-edited.",
  };
}

const KEY = "the-missing-pocket:v1";

export const localService: InsightsService = {
  mode: "local",
  storageNotice: "Local demo: responses stay in this browser.",
  load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as PersistedState) : null;
    } catch {
      return null;
    }
  },
  save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — the demo keeps working in memory */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};

/** The active service. Swap for a backend implementation when one is connected. */
export const insightsService: InsightsService = localService;
