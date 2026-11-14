import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileText, MessageCircleQuestion, Puzzle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackpackExplorer } from "@/components/pocket/backpack-explorer";
import { FractionStat } from "@/components/pocket/fraction";
import { MetricCard } from "@/components/pocket/metric-card";
import { OpportunityNote } from "@/components/pocket/opportunity";
import { HowToRead, SyntheticNotice } from "@/components/pocket/page-intro";
import { PocketPal } from "@/components/pocket/pocket-pal";
import { useDemo } from "@/lib/demo-store";
import { DESIRE_META } from "@/lib/labels";
import { allDesireStats, rankOpportunities, summarize } from "@/lib/metrics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · The Missing Pocket" },
      {
        name: "description",
        content:
          "Explore what people want from the demo backpack, what the evidence supports, and what we still need to ask.",
      },
      { property: "og:title", content: "Every product has a missing pocket · The Missing Pocket" },
      {
        property: "og:description",
        content: "Explore what people want, what the evidence supports, and what we still need to ask.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { product, records } = useDemo();
  const navigate = useNavigate();
  const s = summarize(product, records);
  const stats = allDesireStats(records)
    .filter((d) => d.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);
  const byId = new Map(records.map((r) => [r.id, r]));
  const leading = rankOpportunities(product.opportunities, records).slice(0, 3);
  const unanswered = records.filter((r) => r.sourceType === "qa" && r.answered === false);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="order-2 lg:order-1">
          <div className="rounded-[2rem] border-2 border-dashed border-stitch/70 p-4 sm:p-6">
            <BackpackExplorer />
          </div>
        </div>
        <div className="order-1 space-y-6 lg:order-2">
          <SyntheticNotice />
          <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl">
            Every product has a <span className="text-primary">missing pocket.</span>
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Explore what people want, what the evidence supports, and what we still need to ask.
          </p>
          <div className="rounded-3xl border-2 bg-paper p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Demo product · {product.category}</p>
                <h2 className="mt-1 text-2xl font-semibold">{product.name}</h2>
              </div>
              <PocketPal className="h-14 w-14 shrink-0" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {product.attributes.map((a) => (
                <div key={a.label} className="rounded-xl bg-muted/70 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{a.label}</dt>
                  <dd className="font-medium">{a.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="lg">
              <Link to="/desires">Choose a customer need <ArrowRight /></Link>
            </Button>
            <HowToRead
              points={[
                "Tap a numbered pin on the backpack (or the list below it) to open the matching needs.",
                "Every count says what it counts: passages, survey respondents, sessions and orders are never merged.",
                "Rankings are within the collected evidence — not a measure of market-wide demand.",
                "A missing mention is unknown, not proof that something doesn't matter.",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Summary metrics */}
      <section aria-labelledby="summary-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="summary-heading" className="text-3xl font-semibold">What's in the pocket</h2>
          <p className="text-sm text-muted-foreground">Calculated live from the loaded records.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={FileText}
            label="Evidence records"
            value={s.evidenceRecords}
            unit="records"
            detail={<>{s.passages} source passages + {s.surveySeeded + s.surveyCollected} survey responses</>}
          />
          <MetricCard
            icon={Users}
            label="Survey respondents"
            value={s.surveySeeded + s.surveyCollected}
            unit="respondents"
            tone="sage"
            detail={<>{s.surveySeeded} synthetic seed · {s.surveyCollected} collected in this browser</>}
          />
          <MetricCard
            icon={Puzzle}
            label="Needs identified"
            value={s.needsIdentified}
            unit="coded needs"
            tone="butter"
            detail={<>Distinct need statements in passages, across {s.categoriesWithEvidence} of 10 categories</>}
          />
          <MetricCard
            icon={MessageCircleQuestion}
            label="Unresolved questions"
            value={s.unansweredQuestions + s.unresolvedConflicts}
            unit="open items"
            tone="lavender"
            detail={<>{s.unansweredQuestions} unanswered product questions + {s.unresolvedConflicts} unresolved conflicts</>}
          />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">Units kept separate:</span>
          <Badge variant="outline">Source passages: {s.passages}</Badge>
          <Badge variant="outline">Survey respondents: {s.surveySeeded + s.surveyCollected}</Badge>
          <Badge variant="muted">Sessions: not in this dataset</Badge>
          <Badge variant="muted">Orders: not in this dataset</Badge>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Most discussed */}
        <div className="rounded-3xl border-2 bg-paper p-6 shadow-soft">
          <h2 className="text-2xl font-semibold">Most discussed needs</h2>
          <p className="text-sm text-muted-foreground">Ranked within the {s.evidenceRecords} collected records — not market-wide demand.</p>
          <ol className="mt-5 space-y-4">
            {stats.map((d) => (
              <li key={d.desire}>
                <Link
                  to="/desires"
                  search={{ need: d.desire }}
                  className="block rounded-xl p-1 transition hover:bg-muted/60"
                >
                  <FractionStat
                    value={{ numerator: d.mentions, denominator: d.total, unit: "records" }}
                    label={`mention ${DESIRE_META[d.desire].label.toLowerCase()}`}
                    tone={DESIRE_META[d.desire].tone === "muted" ? "orange" : DESIRE_META[d.desire].tone}
                  />
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* Open questions */}
        <div className="rounded-3xl border-2 bg-butter/50 p-6">
          <h2 className="text-2xl font-semibold">Open research questions</h2>
          <p className="text-sm text-muted-foreground">What the evidence can't answer yet.</p>
          <ul className="mt-4 space-y-2">
            {product.researchQuestions.slice(0, 5).map((q) => (
              <li key={q.id} className="flex items-start gap-2.5 rounded-xl bg-paper/80 px-3 py-2.5 text-sm">
                <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-butter-strong" aria-hidden />
                <span>
                  {q.question} <Badge variant={DESIRE_META[q.desire].tone} className="ml-1">{DESIRE_META[q.desire].label}</Badge>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-semibold text-muted-foreground">
            Plus {unanswered.length} unanswered public product questions in the collection ({unanswered.map((r) => r.id).join(", ")}).
          </p>
        </div>
      </section>

      {/* Conflicts */}
      <section className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold">Conflicting preferences</h2>
          <p className="text-sm text-muted-foreground">Both sides are shown. Each stays unresolved until verified.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {product.conflicts.map((c) => (
            <article key={c.id} className="rounded-3xl border-2 border-lavender-strong/25 bg-paper p-5 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <Badge variant="lavender">Unresolved</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {[c.sideA, c.sideB].map((side, i) => (
                  <div key={i} className={i ? "rounded-2xl bg-lavender/50 p-3" : "rounded-2xl bg-sage/50 p-3"}>
                    <p className="font-semibold leading-snug">{side.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground tabular">
                      {side.recordIds.filter((id) => byId.has(id)).length} {side.recordIds.length === 1 ? "passage" : "passages"} · {side.recordIds.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{c.issue}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Opportunities */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold">Leading product opportunities</h2>
            <p className="text-sm text-muted-foreground">Ordered by supporting passages within the collected evidence.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/opportunities">All opportunities <ArrowRight /></Link>
          </Button>
        </div>
        <div className="studio-wall grid gap-6 rounded-[2rem] p-6 sm:p-8 md:grid-cols-3">
          {leading.map(({ o }, i) => (
            <OpportunityNote key={o.id} o={o} index={i} onOpen={() => navigate({ to: "/opportunities", search: { open: o.id } })} />
          ))}
        </div>
      </section>
    </div>
  );
}
