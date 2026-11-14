import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Database, MessagesSquare, ScanSearch, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityDialog } from "@/components/pocket/opportunity";
import { BackpackExplorer } from "@/components/pocket/backpack-explorer";
import { useDemo } from "@/lib/demo-store";
import { summarize, rankOpportunities, allDesireStats, derivedOpportunities } from "@/lib/metrics";
import { SOURCE_TYPES, type SourceType, type Opportunity } from "@/lib/types";
import { SOURCE_LABEL, DESIRE_META } from "@/lib/labels";
import {
  NeedsChart,
  SourceChart,
  TrendChart,
  CoOccurrenceChart,
  ChartPanel,
} from "@/components/research-charts";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Intelligence overview · SignalScope" },
      {
        name: "description",
        content: "Customer needs, source coverage, evidence trends, and testable opportunities.",
      },
    ],
  }),
  component: Overview,
});
function Overview() {
  const { product, records: all } = useDemo();
  const navigate = useNavigate();
  const [source, setSource] = useState("all");
  const [origin, setOrigin] = useState("all");
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const records = all.filter(
    (r) =>
      (source === "all" || r.sourceType === source) && (origin === "all" || r.origin === origin),
  );
  const s = summarize(product, records);
  const unmet = records.filter((r) => r.codings.some((c) => c.fulfillment === "unmet")).length;
  const gaps = s.unansweredQuestions + s.unresolvedConflicts;
  const leading = rankOpportunities(
    [...product.opportunities, ...derivedOpportunities(records)],
    records,
  )
    .filter((x) => x.ev.supporting.length || x.ev.contradicting.length)
    .slice(0, 3);
  const stats = allDesireStats(records);
  return (
    <div className="analytics-overview">
      <div className="analytics-heading">
        <div>
          <span className="section-kicker">Research workspace</span>
          <h1>Intelligence overview</h1>
          <p>
            {product.shortName} <span>·</span> {records.length} records in scope
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/data">
            Import evidence <ArrowRight size={15} />
          </Link>
        </Button>
      </div>
      <div className="getting-started">
        <strong>New here?</strong>
        <span>1. Pick a need.</span>
        <span>2. Read its evidence.</span>
        <span>3. Choose what to test.</span>
        <Link to="/data">Add real evidence</Link>
      </div>
      <div className="analytics-filters">
        <div className="source-tabs" role="group" aria-label="Overview source filter">
          {["all", ...SOURCE_TYPES].map((v) => (
            <button key={v} type="button" aria-pressed={source === v} onClick={() => setSource(v)}>
              {v === "all" ? "All sources" : SOURCE_LABEL[v as SourceType]}
            </button>
          ))}
        </div>
        <label className="origin-filter">
          Dataset
          <select
            aria-label="Evidence origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          >
            <option value="all">All evidence</option>
            <option value="synthetic-seed">Synthetic seed</option>
            <option value="collected">Collected / imported</option>
          </select>
        </label>
      </div>
      <div className="scope-strip">
        <span className="scope-dot" />
        <strong>{records.filter((r) => r.origin === "synthetic-seed").length} synthetic</strong>
        <span>·</span>
        <strong>{records.filter((r) => r.origin === "collected").length} collected/imported</strong>
        <span className="scope-caption">Sample counts, not market estimates</span>
      </div>
      <div className="kpi-grid">
        {[
          {
            icon: Database,
            label: "Evidence collected",
            value: s.evidenceRecords,
            detail: `${s.passages} passages · ${s.surveySeeded + s.surveyCollected} survey responses`,
          },
          {
            icon: MessagesSquare,
            label: "Need categories found",
            value: s.categoriesWithEvidence,
            detail: "how many of our 10 need types appear",
          },
          {
            icon: ScanSearch,
            label: "Records with unmet needs",
            value: unmet,
            detail: "records reporting at least one unmet need",
          },
          {
            icon: ShieldQuestion,
            label: "Questions to investigate",
            value: gaps,
            detail: `${s.unansweredQuestions} unanswered questions + ${s.unresolvedConflicts} conflicting accounts`,
          },
        ].map((k) => (
          <article className="kpi-card" key={k.label}>
            <div>
              <span>{k.label}</span>
              <k.icon size={17} />
            </div>
            <strong>{k.value.toLocaleString()}</strong>
            <small>{k.detail}</small>
          </article>
        ))}
      </div>
      {records.length === 0 ? (
        <div className="empty-analytics">
          <Database size={30} />
          <h2>No evidence in this filter</h2>
          <p>Import records or choose another source.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSource("all");
              setOrigin("all");
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <>
          <div className="analytics-grid-main">
            <NeedsChart
              records={records}
              onSelect={(need) => navigate({ to: "/desires", search: { need } })}
            />
            <div className="analytics-side">
              <SourceChart records={records} />
              <TrendChart records={records} />
            </div>
          </div>
          <div className="analytics-grid-secondary">
            <CoOccurrenceChart records={records} />
            <ChartPanel title="Fulfillment gaps" meta="Known assessments only">
              <div className="gap-list">
                {stats
                  .filter((x) => x.knownFulfillment > 0)
                  .sort(
                    (a, b) =>
                      b.unmet / Math.max(1, b.knownFulfillment) -
                      a.unmet / Math.max(1, a.knownFulfillment),
                  )
                  .slice(0, 5)
                  .map((x) => (
                    <div key={x.desire}>
                      <span>{DESIRE_META[x.desire].label}</span>
                      <strong>
                        {x.unmet}
                        <small> / {x.knownFulfillment}</small>
                      </strong>
                      <b>{Math.round((x.unmet / x.knownFulfillment) * 100)}%</b>
                    </div>
                  ))}
              </div>
              <p className="chart-note">Unmet / records with met, partly met, or unmet status.</p>
            </ChartPanel>
          </div>
        </>
      )}
      <section className="opportunity-strip">
        <header>
          <div>
            <span className="section-kicker">Next decisions</span>
            <h2>Evidence-backed experiments</h2>
          </div>
          <Link to="/opportunities">
            View all <ArrowRight size={14} />
          </Link>
        </header>
        <div className="opportunity-grid">
          {leading.map(({ o, ev }, i) => (
            <button type="button" key={o.id} onClick={() => setSelected(o)}>
              <span className="opportunity-index">0{i + 1}</span>
              <h3>{o.title}</h3>
              <div>
                <span>{ev.supporting.length} supporting</span>
                <span>{ev.contradicting.length} counterexamples</span>
              </div>
              <span className="opportunity-open">
                Inspect experiment <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
        {leading.length === 0 && (
          <p className="chart-note">No opportunities supported by the current filter.</p>
        )}
      </section>
      <details className="product-details">
        <summary>Explore demo product & methodology</summary>
        <div className="product-detail-grid">
          <BackpackExplorer />
          <div>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <ul>
              <li>Seeded evidence is fictional.</li>
              <li>Records, responses, people, and orders are different units.</li>
              <li>Unknown fulfillment is excluded from gap rates.</li>
              <li>Charts describe this collection only.</li>
            </ul>
            <Link to="/journey">
              Inspect missing perspectives <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </details>
      <OpportunityDialog o={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
