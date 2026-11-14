import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MessageCircleQuestion, Scale } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EMPTY_FILTERS, useDemo } from "@/lib/demo-store";
import { DESIRE_META, FULFILLMENT_META, IMPORTANCE_LABEL, JOURNEY_LABEL } from "@/lib/labels";
import {
  coOccurrence,
  desireByJourney,
  desireStats,
  hasDesire,
  priceDistribution,
  surveyPicks,
} from "@/lib/metrics";
import type { DesireId, EvidenceRecord, Fulfillment, Importance } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DESIRE_ICON } from "./desire-icon";
import { EvidenceCard } from "./evidence-card";
import { FractionStat } from "./fraction";
import { TONE_SURFACE } from "./tone";

interface Props {
  desire: DesireId | null;
  records: EvidenceRecord[];
  contextLabel: string;
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border-2 border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{children}</p>;
}

export function DesirePanel({ desire, records, contextLabel, onClose }: Props) {
  const { product, markTrail, setEvidenceFilters } = useDemo();
  const navigate = useNavigate();

  useEffect(() => {
    if (desire) markTrail("desire");
  }, [desire, markTrail]);

  if (!desire) return null;
  const meta = DESIRE_META[desire];
  const Icon = DESIRE_ICON[desire];
  const stats = desireStats(records, desire);
  const mentioning = records.filter((r) => hasDesire(r, desire));
  const codings = mentioning.flatMap((r) => r.codings.filter((c) => c.desire === desire).map((c) => ({ c, r })));
  const needs = new Map<string, number>();
  codings.forEach(({ c }) => needs.set(c.need, (needs.get(c.need) ?? 0) + 1));
  const contexts = codings.filter(({ c }) => c.context);
  const targets = codings.filter(({ c }) => c.target);
  const tradeoffs = codings.filter(({ c }) => c.tradeoff);
  const importance = (["must-have", "preference", "unknown"] as Importance[]).map((i) => ({
    i,
    n: codings.filter(({ c }) => c.importance === i).length,
  }));
  const fulfillment = (["met", "partly-met", "unmet", "conflicting", "unknown"] as Fulfillment[]).map((f) => ({
    f,
    n: codings.filter(({ c }) => c.fulfillment === f).length,
  }));
  const supporting = mentioning.filter((r) => r.codings.some((c) => c.desire === desire && c.fulfillment !== "met"));
  const counter = mentioning.filter((r) => r.codings.some((c) => c.desire === desire && c.fulfillment === "met"));
  const conflicts = product.conflicts.filter((c) => c.desires.includes(desire));
  const co = coOccurrence(records).filter((p) => p.a === desire || p.b === desire);
  const journey = desireByJourney(records, desire);
  const question = product.researchQuestions.find((q) => q.desire === desire);
  const picks = surveyPicks(records, desire);
  const price = desire === "price" ? priceDistribution(records, product) : null;
  const passagesTotal = records.filter((r) => r.sourceType !== "survey").length;
  const passagesMentioning = mentioning.filter((r) => r.sourceType !== "survey").length;

  return (
    <Sheet open={!!desire} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full border-l-2 sm:max-w-xl">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-3">
            <span className={cn("grid size-14 place-items-center rounded-2xl", TONE_SURFACE[meta.tone])}>
              <Icon className="size-7" aria-hidden />
            </span>
            <div>
              <SheetTitle className="font-display text-3xl">{meta.label}</SheetTitle>
              <SheetDescription>{product.desireHints[desire]}</SheetDescription>
            </div>
          </div>
          <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">{contextLabel}</p>
        </SheetHeader>

        <div className="mt-5 space-y-6">
          <Section title="Within the collected evidence">
            <div className="space-y-3 rounded-2xl border-2 bg-paper p-4">
              <FractionStat value={{ numerator: passagesMentioning, denominator: passagesTotal, unit: "collected passages" }} label={`mention ${meta.label.toLowerCase()}`} />
              <FractionStat value={{ numerator: stats.mustHave, denominator: stats.mentions, unit: "mentioning records" }} label="state it as a must-have" tone="navy" />
              <FractionStat value={{ numerator: stats.unmet, denominator: stats.mentions, unit: "mentioning records" }} label="report it unmet" tone="orange" />
              <FractionStat value={{ numerator: stats.workaround, denominator: stats.mentions, unit: "mentioning records" }} label="describe a workaround" tone="sage" />
              <FractionStat value={{ numerator: stats.dealbreaker, denominator: stats.mentions, unit: "mentioning records" }} label="call it a dealbreaker" tone="lavender" />
              <FractionStat value={picks} label="picked it as what matters most" tone="butter" />
            </div>
            {stats.mentions === 0 && (
              <Empty>No records mention {meta.label.toLowerCase()}. Missing mentions are unknown — not evidence that it's unimportant.</Empty>
            )}
          </Section>

          <Section title="What people explicitly requested">
            {needs.size ? (
              <ul className="space-y-1.5">
                {[...needs.entries()].sort((a, b) => b[1] - a[1]).map(([need, n]) => (
                  <li key={need} className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2 text-sm">
                    <span>{need}</span>
                    <span className="tabular shrink-0 text-xs text-muted-foreground">{n} {n === 1 ? "record" : "records"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Nothing requested in the collection.</Empty>
            )}
          </Section>

          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Usage context (as stated)">
              {contexts.length ? (
                <ul className="space-y-1 text-sm">
                  {contexts.map(({ c, r }) => (
                    <li key={r.id + c.need}>{c.context} <span className="text-xs text-muted-foreground">· {r.id}</span></li>
                  ))}
                </ul>
              ) : (
                <Empty>No usage context stated.</Empty>
              )}
            </Section>
            <Section title="Stated targets & thresholds">
              {targets.length ? (
                <ul className="space-y-1 text-sm">
                  {targets.map(({ c, r }) => (
                    <li key={r.id + c.need}>{c.target} <span className="text-xs text-muted-foreground">· {r.id}</span></li>
                  ))}
                </ul>
              ) : (
                <Empty>No explicit target stated.</Empty>
              )}
            </Section>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Importance">
              <ul className="space-y-1 text-sm tabular">
                {importance.map(({ i, n }) => (
                  <li key={i} className="flex justify-between"><span>{IMPORTANCE_LABEL[i]}</span><span className="font-semibold">{n}</span></li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">Unit: coded statements ({codings.length})</p>
            </Section>
            <Section title="Fulfillment">
              <ul className="space-y-1 text-sm tabular">
                {fulfillment.map(({ f, n }) => (
                  <li key={f} className="flex items-center justify-between gap-2">
                    <Badge variant={FULFILLMENT_META[f].tone}>{FULFILLMENT_META[f].label}</Badge>
                    <span className="font-semibold">{n}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <Section title="Explicit trade-offs">
            {tradeoffs.length ? (
              <ul className="space-y-1.5">
                {tradeoffs.map(({ c, r }) => (
                  <li key={r.id + c.need} className="flex items-start gap-2 text-sm">
                    <Scale className="mt-0.5 size-4 shrink-0 text-lavender-strong" aria-hidden />
                    <span>{c.tradeoff} <span className="text-xs text-muted-foreground">· {r.id}</span></span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No explicit trade-offs stated.</Empty>
            )}
          </Section>

          {price && (
            <Section title="Stated price distribution">
              <div className="space-y-2 rounded-2xl border-2 bg-paper p-4">
                {price.buckets.map((b) => (
                  <FractionStat key={b.value} value={{ numerator: b.count, denominator: price.denominator, unit: "records stating a budget" }} label={b.label} tone="butter" size="sm" />
                ))}
                <p className="pt-1 text-xs text-muted-foreground">
                  These are stated budgets and ranges people would consider. They are not demonstrated willingness to pay — no purchase-price data is in this dataset.
                </p>
              </div>
            </Section>
          )}

          <Section title="Mentioned together with">
            {co.length ? (
              <div className="flex flex-wrap gap-1.5">
                {co.map((p) => {
                  const other = p.a === desire ? p.b : p.a;
                  return (
                    <Badge key={other} variant={DESIRE_META[other].tone}>
                      {DESIRE_META[other].label} · {p.count} {p.count === 1 ? "record" : "records"}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <Empty>No co-mentions in the collection.</Empty>
            )}
          </Section>

          <Section title="By stated journey stage">
            {journey.length ? (
              <div className="space-y-2">
                {journey.map((j) => (
                  <FractionStat key={j.journey} size="sm" tone="navy" value={{ numerator: j.mentions, denominator: j.total, unit: "records" }} label={`in ${JOURNEY_LABEL[j.journey]}`} />
                ))}
                <p className="text-xs text-muted-foreground">Only records with a stated journey context are included.</p>
              </div>
            ) : (
              <Empty>No stated journey context.</Empty>
            )}
          </Section>

          {conflicts.length > 0 && (
            <Section title="Conflicting preferences">
              {conflicts.map((c) => (
                <div key={c.id} className="rounded-2xl border-2 border-lavender-strong/30 bg-lavender/40 p-3 text-sm">
                  <p className="font-semibold">{c.title} <Badge variant="lavender" className="ml-1">Unresolved</Badge></p>
                  <p className="text-muted-foreground">{c.issue}</p>
                </div>
              ))}
            </Section>
          )}

          <Section title={`Supporting passages (${supporting.length})`}>
            {supporting.length ? (
              <div className="space-y-3">
                {supporting.map((r, i) => <EvidenceCard key={r.id} record={r} compact index={i} />)}
              </div>
            ) : (
              <Empty>No passages express this need as unmet or open.</Empty>
            )}
          </Section>

          <Section title={`Counterexamples — reported met (${counter.length})`}>
            {counter.length ? (
              <div className="space-y-3">
                {counter.map((r, i) => <EvidenceCard key={r.id} record={r} compact index={i} />)}
              </div>
            ) : (
              <Empty>No counterexamples in the collection.</Empty>
            )}
          </Section>

          <Section title="Next research question">
            <div className="flex items-start gap-3 rounded-2xl bg-butter p-4">
              <MessageCircleQuestion className="mt-0.5 size-5 shrink-0 text-butter-strong" aria-hidden />
              <p className="font-medium">{question?.question ?? "What would we need to ask to understand this need?"}</p>
            </div>
          </Section>

          <div className="flex flex-wrap gap-2 pb-4">
            <Button
              onClick={() => {
                setEvidenceFilters({ ...EMPTY_FILTERS, desire });
                onClose();
                navigate({ to: "/evidence" });
              }}
            >
              See all {meta.label.toLowerCase()} evidence <ArrowRight />
            </Button>
            <Button variant="outline" asChild>
              <Link to="/feedback">Ask in the survey</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
