import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EvidenceCard } from "@/components/pocket/evidence-card";
import { PageIntro, SyntheticNotice } from "@/components/pocket/page-intro";
import { PocketPal } from "@/components/pocket/pocket-pal";
import { TagEditor } from "@/components/pocket/tag-editor";
import { EMPTY_FILTERS, useDemo, type EvidenceFilters } from "@/lib/demo-store";
import { CLASS_META, DESIRE_META, JOURNEY_LABEL, SOURCE_LABEL } from "@/lib/labels";
import { hasDesire } from "@/lib/metrics";
import { DESIRE_IDS, JOURNEY_CONTEXTS, SOURCE_TYPES, type EvidenceRecord } from "@/lib/types";

export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence library · SignalScope" },
      {
        name: "description",
        content:
          "Search and filter every evidence record, review desire tags, and compare conflicting claims side by side.",
      },
      { property: "og:title", content: "Evidence library · SignalScope" },
      {
        property: "og:description",
        content: "Every record behind every number — searchable, filterable and reviewable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EvidencePage,
});

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="h-9 rounded-full border-2 bg-paper text-sm text-foreground"
          aria-label={label}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function matches(r: EvidenceRecord, f: EvidenceFilters) {
  if (
    f.q &&
    !`${r.id} ${r.text} ${r.barrier ?? ""} ${r.workaround ?? ""}`
      .toLowerCase()
      .includes(f.q.toLowerCase())
  )
    return false;
  if (f.source !== "all" && r.sourceType !== f.source) return false;
  if (f.desire !== "all" && !hasDesire(r, f.desire as never)) return false;
  if (f.journey === "unknown" ? !!r.journey : f.journey !== "all" && r.journey !== f.journey)
    return false;
  if (f.classification !== "all" && r.classification !== f.classification) return false;
  if (f.reviewed === "reviewed" && r.codingStatus !== "human-reviewed") return false;
  if (f.reviewed === "unreviewed" && r.codingStatus === "human-reviewed") return false;
  return true;
}

function EvidencePage() {
  const {
    product,
    products,
    setProductId,
    records,
    evidenceFilters: f,
    setEvidenceFilters,
    markTrail,
    hydrated,
  } = useDemo();
  const [editing, setEditing] = useState<EvidenceRecord | null>(null);
  const [visibleCount, setVisibleCount] = useState(60);
  const set = (patch: Partial<EvidenceFilters>) => setEvidenceFilters({ ...f, ...patch });
  const filtered = records.filter((r) => matches(r, f));
  const active = (Object.keys(EMPTY_FILTERS) as (keyof EvidenceFilters)[]).filter(
    (k) => f[k] !== EMPTY_FILTERS[k],
  ).length;
  const byId = new Map(records.map((r) => [r.id, r]));

  useEffect(() => setVisibleCount(60), [f, product.id]);

  useEffect(() => markTrail("evidence"), [markTrail]);

  return (
    <div className="space-y-10">
      <PageIntro
        eyebrow="Evidence library"
        title="Every record behind every number"
        description={
          <>
            Search, filter and review the passages. Corrections change tags only — never the
            original text. <SyntheticNotice className="mt-2" />
          </>
        }
        guide={{
          points: [
            "Each card is one record: a passage (review, Q&A, discussion) or one survey response.",
            "“Pre-coded demo tags” were written with the synthetic data. No AI analysis runs in this demo.",
            "Use “Review tags” to correct desire tags; the record becomes human-reviewed and every count updates.",
            "Conflicting claims are shown side by side and stay unresolved until verified.",
          ],
        }}
      />

      <section
        aria-label="Filters"
        className="rounded-3xl border-2 bg-paper p-4 shadow-soft sm:p-5"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search text, barriers, workarounds or record IDs…"
            className="h-11 rounded-full border-2 bg-background pl-10"
            aria-label="Search evidence"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <FilterSelect
            label="Product"
            value={product.id}
            onChange={setProductId}
            options={products.map((p) => ({ value: p.id, label: p.shortName }))}
          />
          <FilterSelect
            label="Source"
            value={f.source}
            onChange={(v) => set({ source: v })}
            options={[
              { value: "all", label: "All sources" },
              ...SOURCE_TYPES.map((s) => ({ value: s, label: SOURCE_LABEL[s] })),
            ]}
          />
          <FilterSelect
            label="Desire"
            value={f.desire}
            onChange={(v) => set({ desire: v })}
            options={[
              { value: "all", label: "All desires" },
              ...DESIRE_IDS.map((d) => ({ value: d, label: DESIRE_META[d].label })),
            ]}
          />
          <FilterSelect
            label="Journey context"
            value={f.journey}
            onChange={(v) => set({ journey: v })}
            options={[
              { value: "all", label: "Any context" },
              ...JOURNEY_CONTEXTS.map((j) => ({ value: j, label: JOURNEY_LABEL[j] })),
              { value: "unknown", label: "Context unknown" },
            ]}
          />
          <FilterSelect
            label="Classification"
            value={f.classification}
            onChange={(v) => set({ classification: v })}
            options={[
              { value: "all", label: "Any" },
              ...(Object.keys(CLASS_META) as (keyof typeof CLASS_META)[]).map((k) => ({
                value: k,
                label: CLASS_META[k].label,
              })),
            ]}
          />
          <FilterSelect
            label="Review"
            value={f.reviewed}
            onChange={(v) => set({ reviewed: v })}
            options={[
              { value: "all", label: "All" },
              { value: "reviewed", label: "Human-reviewed" },
              { value: "unreviewed", label: "Not yet reviewed" },
            ]}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <p className="tabular" aria-live="polite">
            Showing <span className="font-semibold">{Math.min(visibleCount, filtered.length)}</span>{" "}
            of {filtered.length} matches ({records.length} records)
            {!hydrated && (
              <span className="ml-2 text-muted-foreground">· loading saved responses…</span>
            )}
          </p>
          {active > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setEvidenceFilters(EMPTY_FILTERS)}>
              <X /> Clear {active} {active === 1 ? "filter" : "filters"}
            </Button>
          )}
        </div>
      </section>

      {filtered.length ? (
        <div className="columns-1 gap-4 md:columns-2 xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {filtered.slice(0, visibleCount).map((r, i) => (
            <EvidenceCard key={r.id} record={r} index={i} onEditTags={setEditing} highlight={f.q} />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center rounded-3xl border-2 border-dashed py-14 text-center">
          <PocketPal className="h-20 w-20" mood="curious" />
          <p className="mt-3 font-display text-xl font-semibold">Nothing in this pocket</p>
          <p className="text-sm text-muted-foreground">No records match these filters.</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => setEvidenceFilters(EMPTY_FILTERS)}
          >
            Clear filters
          </Button>
        </div>
      )}

      {filtered.length > visibleCount && (
        <Button variant="outline" onClick={() => setVisibleCount((n) => n + 60)}>
          Show 60 more records
        </Button>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold">Conflicting claims</h2>
          <p className="text-sm text-muted-foreground">
            Shown side by side. Labelled unresolved until verified with new evidence.
          </p>
        </div>
        {product.conflicts.map((c) => (
          <article
            key={c.id}
            className="rounded-3xl border-2 border-lavender-strong/25 bg-paper p-5 shadow-soft"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold">{c.title}</h3>
              <Badge variant="lavender">Unresolved</Badge>
              <span className="text-sm text-muted-foreground">{c.issue}</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[c.sideA, c.sideB].map((side, i) => (
                <div
                  key={i}
                  className={i ? "rounded-2xl bg-lavender/40 p-3" : "rounded-2xl bg-sage/40 p-3"}
                >
                  <p className="mb-2 font-semibold">{side.label}</p>
                  <div className="space-y-3">
                    {side.recordIds
                      .map((id) => byId.get(id))
                      .filter((r): r is EvidenceRecord => !!r)
                      .map((r) => (
                        <EvidenceCard key={r.id} record={r} compact onEditTags={setEditing} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <TagEditor record={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
