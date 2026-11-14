import { parseEvidenceImport, validateResponse } from "./validation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, SEEDED_SURVEY_RESPONSES, getProduct } from "@/data/products";
import { insightsService, type PersistedState } from "@/services/insights-service";
import { buildRecords, type TagOverride } from "./metrics";
import type {
  DesireId,
  EvidenceRecord,
  OpportunityStatus,
  ProductConfig,
  SurveyResponse,
} from "./types";

export const TRAIL_STEPS = [
  { id: "explore", label: "Explore the product", to: "/" },
  { id: "desire", label: "Choose a customer need", to: "/desires" },
  { id: "evidence", label: "Inspect supporting & conflicting evidence", to: "/evidence" },
  { id: "missing", label: "Reveal a missing perspective", to: "/journey" },
  { id: "survey", label: "Submit a survey response", to: "/feedback" },
  { id: "opportunity", label: "Open an improvement opportunity", to: "/opportunities" },
] as const;
export type TrailStep = (typeof TRAIL_STEPS)[number]["id"];

export interface EvidenceFilters {
  q: string;
  source: string;
  desire: string;
  journey: string;
  classification: string;
  reviewed: string;
}
export const EMPTY_FILTERS: EvidenceFilters = {
  q: "",
  source: "all",
  desire: "all",
  journey: "all",
  classification: "all",
  reviewed: "all",
};

interface Ctx {
  hydrated: boolean;
  product: ProductConfig;
  products: ProductConfig[];
  setProductId: (id: string) => void;
  /** All survey responses for the product: seeded + collected. */
  responses: SurveyResponse[];
  collectedResponses: SurveyResponse[];
  records: EvidenceRecord[];
  importRecords: (input: unknown) => number;
  addResponse: (r: SurveyResponse) => void;
  tagOverrides: Record<string, TagOverride>;
  setTags: (recordId: string, desires: DesireId[]) => void;
  resetTags: (recordId: string) => void;
  opportunityStatus: (id: string) => OpportunityStatus;
  setOpportunityStatus: (id: string, s: OpportunityStatus) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  trail: Record<string, boolean>;
  markTrail: (step: TrailStep) => void;
  evidenceFilters: EvidenceFilters;
  setEvidenceFilters: (f: EvidenceFilters) => void;
  desireSource: string;
  setDesireSource: (s: string) => void;
  resetDemo: () => void;
  storageNotice: string;
}

const StoreContext = createContext<Ctx | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [productId, setProductId] = useState(PRODUCTS[0]!.id);
  const [externalRecords, setExternalRecords] = useState<EvidenceRecord[]>([]);
  const [collected, setCollected] = useState<SurveyResponse[]>([]);
  const [tagOverrides, setTagOverrides] = useState<Record<string, TagOverride>>({});
  const [oppStatus, setOppStatus] = useState<Record<string, OpportunityStatus>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [trail, setTrail] = useState<Record<string, boolean>>({});
  const [evidenceFilters, setEvidenceFilters] = useState<EvidenceFilters>(EMPTY_FILTERS);
  const [desireSource, setDesireSource] = useState("all");
  const loaded = useRef(false);

  useEffect(() => {
    const s = insightsService.load();
    if (s) {
      setProductId(getProduct(s.productId).id);
      setCollected(s.responses ?? []);
      setExternalRecords(s.externalRecords ?? []);
      setTagOverrides(s.tagOverrides ?? {});
      setOppStatus(s.opportunityStatus ?? {});
      setBookmarks(s.bookmarks ?? []);
      setTrail(s.trail ?? {});
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!loaded.current || !hydrated) return;
    const state: PersistedState = {
      productId,
      responses: collected,
      externalRecords,
      tagOverrides,
      opportunityStatus: oppStatus,
      bookmarks,
      trail,
    };
    try {
      insightsService.save(state);
      setStorageError("");
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Changes were not saved.");
    }
  }, [productId, collected, externalRecords, tagOverrides, oppStatus, bookmarks, trail, hydrated]);

  const product = getProduct(productId);
  const responses = useMemo(
    () => [...SEEDED_SURVEY_RESPONSES, ...collected].filter((r) => r.productId === product.id),
    [collected, product.id],
  );
  const records = useMemo(
    () => buildRecords(product, responses, tagOverrides, externalRecords),
    [product, responses, tagOverrides, externalRecords],
  );

  function persist(patch: Partial<PersistedState>) {
    insightsService.save({
      productId,
      responses: collected,
      externalRecords,
      tagOverrides,
      opportunityStatus: oppStatus,
      bookmarks,
      trail,
      ...patch,
    });
    setStorageError("");
  }

  const markTrail = useCallback((step: TrailStep) => {
    setTrail((t) => (t[step] ? t : { ...t, [step]: true }));
  }, []);

  const value: Ctx = {
    hydrated,
    product,
    products: PRODUCTS,
    setProductId,
    responses,
    collectedResponses: collected.filter((r) => r.productId === product.id),
    records,
    addResponse: (r) => {
      const validated = validateResponse(r);
      if (validated.productId !== product.id) throw new Error("Response product mismatch.");
      if (
        collected.some((x) => x.id === r.id) ||
        SEEDED_SURVEY_RESPONSES.some((x) => x.id === r.id)
      )
        throw new Error("Duplicate response ID.");
      const next = [...collected, validated];
      persist({ responses: next });
      setCollected(next);
    },
    importRecords: (input) => {
      const imported = parseEvidenceImport(
        input,
        product.id,
        records.map((r) => r.id),
      );
      const next = [...externalRecords, ...imported];
      persist({ externalRecords: next });
      setExternalRecords(next);
      return imported.length;
    },
    tagOverrides,
    setTags: (id, desires) =>
      setTagOverrides((o) => ({ ...o, [id]: { desires, reviewedAt: new Date().toISOString() } })),
    resetTags: (id) =>
      setTagOverrides((o) => {
        const next = { ...o };
        delete next[id];
        return next;
      }),
    opportunityStatus: (id) =>
      oppStatus[id] ??
      product.opportunities.find((o) => o.id === id)?.defaultStatus ??
      "investigate",
    setOpportunityStatus: (id, s) => setOppStatus((m) => ({ ...m, [id]: s })),
    bookmarks,
    toggleBookmark: (id) =>
      setBookmarks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id])),
    trail,
    markTrail,
    evidenceFilters,
    setEvidenceFilters,
    desireSource,
    setDesireSource,
    resetDemo: () => {
      setCollected([]);
      setExternalRecords([]);
      setTagOverrides({});
      setOppStatus({});
      setBookmarks([]);
      setTrail({});
      setEvidenceFilters(EMPTY_FILTERS);
      setDesireSource("all");
    },
    storageNotice: storageError || insightsService.storageNotice,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoStoreProvider");
  return ctx;
}
