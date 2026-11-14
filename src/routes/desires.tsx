import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { contextText } from "@/components/pocket/context-line";
import { DesirePanel } from "@/components/pocket/desire-panel";
import { FractionStat } from "@/components/pocket/fraction";
import { NeedSticker } from "@/components/pocket/need-sticker";
import { PageIntro } from "@/components/pocket/page-intro";
import { useDemo } from "@/lib/demo-store";
import { DESIRE_META, SOURCE_LABEL } from "@/lib/labels";
import { allDesireStats, coOccurrence, priceDistribution } from "@/lib/metrics";
import { DESIRE_IDS, type DesireId, type HotspotId } from "@/lib/types";
import { cn } from "@/lib/utils";

const AREAS: HotspotId[] = ["laptop", "straps", "main", "fabric", "price"];

export const Route = createFileRoute("/desires")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { area?: HotspotId | undefined; need?: DesireId | undefined } => ({
    area: AREAS.includes(s["area"] as HotspotId) ? (s["area"] as HotspotId) : undefined,
    need: DESIRE_IDS.includes(s["need"] as DesireId) ? (s["need"] as DesireId) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Customer desires · SignalScope" },
      {
        name: "description",
        content:
          "Ten customer-need categories with evidence counts, must-haves, unmet needs and source breakdowns.",
      },
      { property: "og:title", content: "Customer desires · SignalScope" },
      {
        property: "og:description",
        content: "What people explicitly ask for; with every count traced to its evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesiresPage,
});

const SOURCES = ["all", "review", "qa", "discussion", "survey"] as const;

function DesiresPage() {
  const { area, need } = Route.useSearch();
  const navigate = useNavigate({ from: "/desires" });
  const { product, records: allRecords, desireSource, setDesireSource } = useDemo();
  const records =
    desireSource === "all" ? allRecords : allRecords.filter((r) => r.sourceType === desireSource);
  const stats = allDesireStats(records);
  const hotspot = product.hotspots.find((h) => h.id === area);
  const ctx = contextText(records, desireSource);
  const co = coOccurrence(records).slice(0, 6);
  const price = priceDistribution(records, product);

  return (
    <div className="space-y-10">
      <PageIntro
        eyebrow="Customer desires"
        title="Customer needs"
        description="10 categories. Source-linked evidence."
        guide={{
          points: [
            "Each category counts records that mention the need, out of all records in the current filter.",
            "Must-have and unmet counts use the records mentioning that need as their denominator.",
            "Zero mentions mean we don't know; not that the need is unimportant.",
            "Shares describe this collection only. “8 / 26 records mention laptop fit” never means “31% of customers”.",
          ],
        }}
      />

      <div className="flex flex-col gap-3 rounded-3xl border-2 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter by source"
        >
          <span className="mr-1 text-sm font-semibold">Source</span>
          {SOURCES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={desireSource === s}
              onClick={() => setDesireSource(s)}
              className={cn(
                "rounded-full border-2 px-3 py-1 text-sm font-semibold transition",
                desireSource === s
                  ? "border-navy bg-navy text-navy-foreground"
                  : "border-border hover:border-primary",
              )}
            >
              {s === "all" ? "All" : SOURCE_LABEL[s]}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{ctx}</p>
      </div>

      {hotspot && (
        <div className="flex animate-pocket-open flex-wrap items-center gap-3 rounded-3xl border-2 border-dashed border-primary/50 bg-primary-soft/50 px-5 py-3">
          <p className="font-semibold">
            Showing the <span className="text-rust">{hotspot.label.toLowerCase()}</span>;{" "}
            {hotspot.description.toLowerCase()}
          </p>
          <div className="flex gap-1.5">
            {hotspot.desires.map((d) => (
              <Badge key={d} variant={DESIRE_META[d].tone}>
                {DESIRE_META[d].label}
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => navigate({ search: { area: undefined, need } })}
          >
            <X /> Show all
          </Button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {(hotspot
          ? [...stats].sort(
              (a, b) =>
                Number(hotspot.desires.includes(b.desire)) -
                Number(hotspot.desires.includes(a.desire)),
            )
          : stats
        ).map((st, i) => (
          <NeedSticker
            key={st.desire}
            stats={st}
            index={i}
            hint={product.desireHints[st.desire]}
            selected={need === st.desire}
            dimmed={!!hotspot && !hotspot.desires.includes(st.desire)}
            onOpen={() => navigate({ search: { area, need: st.desire } })}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border-2 bg-paper p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Desires mentioned together</h2>
          <p className="text-sm text-muted-foreground">Records coded with both desires.</p>
          {co.length ? (
            <ul className="mt-4 space-y-3">
              {co.map((p) => (
                <li key={p.a + p.b}>
                  <FractionStat
                    size="sm"
                    tone="lavender"
                    value={{ numerator: p.count, denominator: records.length, unit: "records" }}
                    label={`${DESIRE_META[p.a].label} + ${DESIRE_META[p.b].label}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border-2 border-dashed px-3 py-2 text-sm text-muted-foreground">
              No co-mentions in this filter.
            </p>
          )}
        </section>
        <section className="rounded-3xl border-2 bg-paper p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Stated price distribution</h2>
          <p className="text-sm text-muted-foreground">
            Budgets stated in passages and survey ranges.
          </p>
          {price.denominator ? (
            <ul className="mt-4 space-y-3">
              {price.buckets.map((b) => (
                <li key={b.value}>
                  <FractionStat
                    size="sm"
                    tone="butter"
                    value={{
                      numerator: b.count,
                      denominator: price.denominator,
                      unit: "records stating a budget",
                    }}
                    label={b.label}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border-2 border-dashed px-3 py-2 text-sm text-muted-foreground">
              No stated budgets in this filter.
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Stated budget ≠ demonstrated willingness to pay. No purchase-price data is in this
            dataset.
          </p>
        </section>
      </div>

      <DesirePanel
        desire={need ?? null}
        records={records}
        contextLabel={ctx}
        onClose={() => navigate({ search: { area, need: undefined } })}
      />
    </div>
  );
}
