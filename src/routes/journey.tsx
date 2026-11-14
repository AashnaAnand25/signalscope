import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Repeat } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FractionStat } from "@/components/pocket/fraction";
import { PageIntro } from "@/components/pocket/page-intro";
import { PocketPal } from "@/components/pocket/pocket-pal";
import { useDemo } from "@/lib/demo-store";
import {
  MISSING_PERSPECTIVES,
  buildJourney,
  coverageOf,
  type Coverage,
  type JourneyNode,
} from "@/lib/journey";
import { CLASS_META, JOURNEY_LABEL } from "@/lib/labels";
import { JOURNEY_CONTEXTS } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Journey & coverage · SignalScope" },
      {
        name: "description",
        content:
          "A branching customer journey showing what is observed, self-reported, inferred or unknown; and who is missing.",
      },
      { property: "og:title", content: "Journey & coverage · SignalScope" },
      {
        property: "og:description",
        content:
          "See which journey stages the evidence covers, and which perspectives remain unobserved.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JourneyPage,
});

const COVERAGE_TONE: Record<Coverage, "sage" | "butter" | "muted"> = {
  measured: "sage",
  "partly measured": "butter",
  "not measured": "muted",
};

function JourneyPage() {
  const { records, responses, markTrail } = useDemo();
  const { nodes, transitions } = buildJourney(records, responses);
  const [openNode, setOpenNode] = useState<JourneyNode | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const coverage = { measured: 0, "partly measured": 0, "not measured": 0 } as Record<
    Coverage,
    number
  >;
  nodes.forEach((n) => coverage[coverageOf(n)]++);

  return (
    <div className="space-y-12">
      <PageIntro
        eyebrow="Journey & coverage"
        title="Journey coverage"
        description="Measured stages. Visible gaps."
        guide={{
          points: [
            "Stops aren't exclusive: one person can be in several states, and loops (↻) can repeat.",
            "Observed = recorded directly. Self-reported = what people told us. Inferred = a hypothesis. Unknown = no data.",
            "No click ≠ not interested. No purchase record ≠ rejection. No review ≠ satisfaction.",
            "Transitions we can't measure say so, and list the data needed.",
          ],
        }}
      />

      <div className="flex flex-wrap gap-2 text-sm">
        {(Object.keys(coverage) as Coverage[]).map((c) => (
          <Badge key={c} variant={COVERAGE_TONE[c]} className="px-3 py-1 text-sm">
            {coverage[c]} of {nodes.length} stops {c}
          </Badge>
        ))}
        {(Object.keys(CLASS_META) as (keyof typeof CLASS_META)[]).map((k) => (
          <Badge key={k} variant={CLASS_META[k].tone} className="px-3 py-1 text-sm">
            {CLASS_META[k].label}
          </Badge>
        ))}
      </div>

      {/* Map */}
      <section
        aria-label="Journey map"
        className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6"
      >
        <ol className="flex min-w-max gap-4">
          {JOURNEY_CONTEXTS.map((g, gi) => (
            <li key={g} className="relative w-64 shrink-0">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-navy font-display text-sm font-semibold text-navy-foreground">
                  {gi + 1}
                </span>
                <h2 className="text-base font-semibold leading-tight">{JOURNEY_LABEL[g]}</h2>
                {gi < JOURNEY_CONTEXTS.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-2 size-4 text-stitch" aria-hidden />
                )}
              </div>
              <ul className="space-y-3 rounded-3xl border-2 border-dashed border-stitch/60 bg-paper/50 p-3">
                {nodes
                  .filter((n) => n.group === g)
                  .map((n) => {
                    const cov = coverageOf(n);
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => setOpenNode(n)}
                          aria-haspopup="dialog"
                          className="w-full rounded-2xl border-2 bg-paper p-3 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold leading-tight">{n.label}</p>
                            {n.repeatable && (
                              <Repeat
                                className="size-4 shrink-0 text-lavender-strong"
                                aria-label="Can repeat"
                              />
                            )}
                          </div>
                          {n.measures.length ? (
                            <ul className="mt-2 space-y-1">
                              {n.measures.slice(0, 2).map((m) => (
                                <li
                                  key={m.label}
                                  className="flex items-baseline gap-1.5 text-xs tabular"
                                >
                                  <span className="font-display text-lg font-semibold">
                                    {m.count}
                                  </span>
                                  <span className="text-muted-foreground">{m.unit}</span>
                                  <Badge
                                    variant={CLASS_META[m.evidenceType].tone}
                                    className="ml-auto px-1.5 py-0 text-[10px]"
                                  >
                                    {CLASS_META[m.evidenceType].label}
                                  </Badge>
                                </li>
                              ))}
                              {n.measures.length > 2 && (
                                <li className="text-[11px] text-muted-foreground">
                                  +{n.measures.length - 2} more measures
                                </li>
                              )}
                            </ul>
                          ) : (
                            <p className="mt-2 text-xs font-semibold text-muted-foreground">
                              Not measurable with current data
                            </p>
                          )}
                          <Badge variant={COVERAGE_TONE[cov]} className="mt-2">
                            {cov}
                          </Badge>
                          {n.leadsTo.length > 0 && (
                            <p className="mt-2 text-[11px] text-muted-foreground">
                              →{" "}
                              {n.leadsTo
                                .map((id) => byId.get(id)?.label)
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Transitions */}
      <section className="rounded-3xl border-2 bg-paper p-6 shadow-soft">
        <h2 className="text-2xl font-semibold">Transitions between stops</h2>
        <p className="text-sm text-muted-foreground">
          Rates are only shown when both numerator and denominator come from the same people.
        </p>
        <ul className="mt-5 divide-y-2 divide-dashed divide-border">
          {transitions.map((t) => (
            <li key={t.label} className="grid gap-2 py-3 md:grid-cols-[1fr_1.3fr] md:items-center">
              <p className="font-semibold">{t.label}</p>
              {t.measurable ? (
                <div>
                  <FractionStat
                    value={{
                      numerator: t.measurable.numerator,
                      denominator: t.measurable.denominator,
                      unit: t.measurable.unit,
                    }}
                    tone="sage"
                    size="sm"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.measurable.source} · voluntary sample, not representative
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
                  <p className="font-semibold">Not measurable with current data</p>
                  <p className="text-xs text-muted-foreground">Needs: {t.dataNeeded}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Who is missing */}
      <section className="rounded-[2rem] bg-navy p-6 text-navy-foreground sm:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <PocketPal className="h-16 w-16" mood="curious" />
          <div>
            <h2 className="text-3xl font-semibold">Who is missing?</h2>
            <p className="text-navy-foreground/75">
              These are gaps in the evidence. We don't know how many people they include.
            </p>
          </div>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {MISSING_PERSPECTIVES.map((m) => {
            const open = revealed.includes(m.id);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => {
                    setRevealed((r) => (open ? r.filter((x) => x !== m.id) : [...r, m.id]));
                    if (!open) markTrail("missing");
                  }}
                  className="stitched-light w-full rounded-3xl bg-navy-foreground/10 p-5 text-left transition hover:bg-navy-foreground/15"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg font-semibold">{m.title}</span>
                    {open ? (
                      <EyeOff className="size-5 shrink-0" aria-hidden />
                    ) : (
                      <Eye className="size-5 shrink-0" aria-hidden />
                    )}
                  </span>
                  {open ? (
                    <span className="mt-3 block animate-pocket-open space-y-2 text-sm">
                      <span className="block">{m.gap}</span>
                      <span className="block rounded-xl bg-butter px-3 py-2 font-semibold text-foreground">
                        How to reach them: {m.reach}
                      </span>
                      <span className="block text-xs text-navy-foreground/70">
                        Population size: unknown; not estimated.
                      </span>
                    </span>
                  ) : (
                    <span className="mt-2 block text-sm text-navy-foreground/70">
                      Reveal this missing perspective
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <Button asChild className="mt-6">
          <Link to="/feedback">
            Ask the people we're missing <ArrowRight />
          </Link>
        </Button>
      </section>

      <Dialog open={!!openNode} onOpenChange={(o) => !o && setOpenNode(null)}>
        {openNode && (
          <DialogContent className="w-[calc(100%-1.5rem)] max-w-xl">
            <DialogHeader className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {JOURNEY_LABEL[openNode.group]}
              </p>
              <DialogTitle className="font-display text-2xl">{openNode.label}</DialogTitle>
              <DialogDescription>{openNode.definition}</DialogDescription>
            </DialogHeader>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                ["Required data", openNode.requiredData],
                ["Denominator", openNode.denominator],
                ["Time window", openNode.timeWindow],
                ["Limitation", openNode.limitation],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-muted/60 px-3 py-2">
                  <dt className="text-xs font-semibold text-muted-foreground">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Current measures
              </h3>
              {openNode.measures.length ? (
                openNode.measures.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center gap-3 rounded-xl border-2 px-3 py-2"
                  >
                    <span className="font-display text-2xl font-semibold tabular">{m.count}</span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="block font-medium">{m.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        Unit: {m.unit} · Source: {m.source}
                      </span>
                    </span>
                    <Badge variant={CLASS_META[m.evidenceType].tone}>
                      {CLASS_META[m.evidenceType].label}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border-2 border-dashed px-3 py-2 text-sm">
                  <span className="font-semibold">Not measurable with current data.</span> Needs:{" "}
                  {openNode.requiredData}
                </p>
              )}
              {openNode.unavailable.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Unavailable: {openNode.unavailable.join(" · ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Counts are a floor within the sources, not a population size.
              </p>
            </div>
            <Badge variant={COVERAGE_TONE[coverageOf(openNode)]} className={cn("w-fit")}>
              Coverage: {coverageOf(openNode)}
            </Badge>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
