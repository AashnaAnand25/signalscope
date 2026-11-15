import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  RefreshCw,
  Download,
  MessageSquare,
  Search,
  GitCompareArrows,
  ListChecks,
} from "lucide-react";
import { Button } from "./ui/button";
import { SourceBadge } from "./source-badge";
import { KEARNEY_CATALOG, PUBLISHED_CONTEXT, kearneyEntry } from "@/data/kearney-products";
import { useDemo } from "@/lib/demo-store";
import { NeedsChart, CoOccurrenceChart, SourceChart } from "./research-charts";
import { DESIRE_META } from "@/lib/labels";
import { ResearchAgent } from "./research-agent";
import { evidenceSchema } from "@/lib/validation";
import { analysisSchema, documentSchema, competitorSchema } from "@/lib/portfolio-contract";
import { z } from "zod";
const reportSchema = z.object({
  id: z.string(),
  productId: z.string(),
  status: z.enum(["running", "complete", "failed"]),
  stage: z.string(),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  documents: z.array(documentSchema).max(16),
  competitors: z.array(competitorSchema).max(5),
  analysis: analysisSchema.optional(),
  records: z.array(evidenceSchema),
  errors: z.array(z.string()),
  trace: z.array(z.object({ agent: z.string(), message: z.string(), at: z.string() })),
});
type Report = z.infer<typeof reportSchema>;
const tabs = [
  { id: "overview", label: "Overview", icon: Search },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "compare", label: "Compare", icon: GitCompareArrows },
  { id: "roadmap", label: "Roadmap", icon: ListChecks },
] as const;
const cacheKey = "signalscope:portfolio-reports:v1";
export function PortfolioWorkspace() {
  const { product, setProductId, records, importRecords, hydrated } = useDemo();
  const entry = kearneyEntry(product.id) || KEARNEY_CATALOG[0]!;
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [reports, setReports] = useState<Record<string, Report>>({});
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const active = useRef(new Set<string>());
  const [pending, setPending] = useState<string | null>(null);
  const [disposition, setDisposition] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      setReports(z.record(reportSchema).parse(JSON.parse(localStorage.getItem(cacheKey) || "{}")));
    } catch {
      /* no valid cached report */
    }
    try {
      setDisposition(JSON.parse(localStorage.getItem("signalscope:roadmap-status:v1") || "{}"));
    } catch {
      /* defaults */
    }
    setReady(true);
  }, []);
  const report = reports[entry.id];
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(reports));
      } catch {
        setNotice("Report storage is full. Export this run before leaving.");
      }
    }
  }, [reports, ready]);
  const update = useCallback((value: Report) => {
    setReports((previous) => ({ ...previous, [value.productId]: value }));
  }, []);
  const run = useCallback(
    async (refresh = false) => {
      if (active.current.has(entry.id)) return;
      const id = entry.id;
      active.current.add(id);
      setPending(id);
      setNotice("");
      try {
        const response = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: id, refresh }),
          signal: AbortSignal.timeout(15000),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not start research.");
        update(reportSchema.parse(data));
      } catch (e) {
        setNotice(e instanceof Error ? e.message : "Could not start research.");
      } finally {
        setPending(null);
      }
    },
    [entry.id, update],
  );
  useEffect(() => {
    if (!ready || !hydrated) return;
    if (!kearneyEntry(product.id)) {
      setProductId(KEARNEY_CATALOG[0]!.id);
      return;
    }
    const cached = reports[entry.id];
    if (!cached || Date.now() - Date.parse(cached.startedAt) > 86400000) void run();
  }, [entry.id, hydrated, ready, product.id, reports, run, setProductId]);
  useEffect(() => {
    if (report?.status !== "running") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/portfolio?job=${encodeURIComponent(report.id)}`, {
          signal: AbortSignal.timeout(10000),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Run unavailable");
        if (!cancelled) update(reportSchema.parse(data));
      } catch (e) {
        if (!cancelled) {
          setNotice(e instanceof Error ? e.message : "Run unavailable");
          active.current.delete(entry.id);
          update({
            ...report,
            status: "failed",
            stage: "Run connection lost",
            errors: [...report.errors, "Run connection lost. Start a new run."],
          });
        }
      }
    };
    const timer = setInterval(() => void poll(), 2000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [report, entry.id, update]);
  useEffect(() => {
    if (!hydrated || report?.status !== "complete") return;
    const fresh = report.records.filter((r) => !records.some((old) => old.id === r.id));
    if (fresh.length) {
      try {
        importRecords(fresh);
      } catch (e) {
        setNotice(e instanceof Error ? e.message : "Records were not saved.");
      }
    }
    active.current.delete(entry.id);
  }, [report, entry.id, hydrated, records, importRecords]);
  const feedback = records.filter((r) => r.productId === entry.id && r.origin === "collected");
  const voices = report?.analysis?.comments.filter((c) => c.kind === "customer-feedback") ?? [];
  const commentary = report?.analysis?.comments.filter((c) => c.kind !== "customer-feedback") ?? [];
  const sourcesFor = (ids: string[]) => (report?.documents ?? []).filter((d) => ids.includes(d.id));
  const cited = (ids: string[], quote?: string) => (
    <div>
      {sourcesFor(ids).map((d) => (
        <SourceBadge
          key={d.id}
          url={d.url}
          platform={d.platform}
          detail={`${d.kind} · retrieved ${new Date(d.capturedAt).toLocaleDateString()}`}
        />
      ))}
      {!ids.length && <SourceBadge detail="No verified source quote; not an established fact" />}
      {quote && (
        <details className="metric-help">
          <summary>Supporting source quote</summary>
          <blockquote>{quote}</blockquote>
        </details>
      )}
    </div>
  );
  function exportReport() {
    const data = {
      product: entry,
      report,
      feedback,
      scope:
        "Independent hackathon prototype. Provider claims and customer feedback are separate. No verified market-wide statistics.",
      exportedAt: new Date().toISOString(),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entry.id}-renewal-brief.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  const busy = pending === entry.id || report?.status === "running";
  const catalogFeedbackSources = [
    ...new Set(feedback.flatMap((r) => (r.sourceUrl ? [r.sourceUrl] : []))),
  ];
  return (
    <div className="portfolio-workspace space-y-6">
      <section className="renewal-hero">
        <span className="section-kicker">Kearney PERLab hackathon · Independent prototype</span>
        <h1>Turn customer voices into the next product decision.</h1>
        <p>Find pain points. Check the alternatives. Build a source-backed renewal roadmap.</p>
        <div className="renewal-steps">
          {[
            "Ingest feedback",
            "Analyze pain points",
            "Benchmark competitors",
            "Generate roadmap",
          ].map((step, i) => (
            <span key={step}>
              <b>{i + 1}</b>
              {step}
              {i < 3 && <ArrowRight size={13} />}
            </span>
          ))}
        </div>
        <SourceBadge
          url="https://www.kearney.com/web/product-excellence-and-renewal-lab/what-we-do"
          platform="Kearney.com"
          detail="Workflow inspired by public PERLab design-for-growth and design-for-margin positioning. Not an official integration or endorsement."
        />
      </section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="section-kicker">Flagship workspace</span>
          <h2 className="text-2xl font-semibold">Kearney Product &amp; Portfolio Analysis</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              active.current.delete(entry.id);
              void run(true);
            }}
          >
            <RefreshCw size={14} />
            Refresh research
          </Button>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download size={14} />
            Export brief
          </Button>
        </div>
      </div>
      <div className="portfolio-selector" role="group" aria-label="Kearney portfolio products">
        {KEARNEY_CATALOG.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={entry.id === p.id}
            onClick={() => {
              setProductId(p.id);
              setNotice("");
            }}
          >
            <strong>{p.name}</strong>
            <small>{p.category}</small>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Publicly documented offering subset, not Kearney's complete internal catalog. Ignite is a
        service; “DeepFind Analytics” could not be verified as a Kearney product and is not treated
        as one.
      </p>
      <SourceBadge
        url="https://www.kearney.com/service/strategy-growth/innovation-for-growth/ignite/"
        platform="Kearney.com"
      />
      <div className="research-run" role="status">
        <span className={busy ? "scope-dot" : ""} />
        <strong>
          {busy
            ? report?.stage || "Starting research…"
            : report?.status === "complete"
              ? "Research complete; source review recommended"
              : report?.status === "failed"
                ? "Research needs attention"
                : "Research starts automatically for the selected product"}
        </strong>
        <small>
          Gemini research uses server credentials and may take several minutes. Cached for 24 hours.
          No private platform sign-in is bypassed.
        </small>
        {notice && <p>{notice}</p>}
        {report?.errors.map((error, i) => (
          <p key={i}>{error}</p>
        ))}
      </div>
      <div className="portfolio-tabs" role="tablist" aria-label="Product analysis tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            id={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="space-y-5">
        {tab === "overview" && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-xl border bg-paper p-5">
                <span className="section-kicker">Published offering</span>
                <h3 className="text-2xl font-semibold my-2">{entry.name}</h3>
                <p className="text-sm">{entry.description}</p>
                <SourceBadge
                  url={entry.source.url}
                  platform={entry.source.platform}
                  detail="Provider description, not user feedback"
                />
                <p className="text-sm mt-4">
                  <strong>Target industries:</strong> {entry.industries.join(", ")}
                </p>
                <SourceBadge url={entry.source.url} platform={entry.source.platform} />
                <ul className="mt-3 space-y-2 text-sm">
                  {entry.capabilities.map((c) => (
                    <li key={c}>
                      <strong>{c}</strong>
                      <SourceBadge url={entry.source.url} platform={entry.source.platform} />
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-xl border bg-paper p-5">
                <h3 className="text-lg font-semibold">Voice-of-customer coverage</h3>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { label: "Captured customer records", n: feedback.length },
                    {
                      label: "Source pages captured",
                      n: report?.documents.filter((d) => d.status === "captured").length ?? 0,
                    },
                    { label: "Alternatives discovered", n: report?.competitors.length ?? 0 },
                    { label: "Renewal hypotheses", n: report?.analysis?.roadmap.length ?? 0 },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border p-3">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <strong className="block text-3xl mt-1">{m.n}</strong>
                      <SourceBadge
                        detail={
                          report
                            ? `Run ${report.id.slice(0, 8)} · ${report.stage}`
                            : "This product's saved evidence collection"
                        }
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-4 text-muted-foreground">
                  No customer records means no measured sentiment or diagnosed customer flaw.
                  Provider claims and market commentary stay separate.
                </p>
                <SourceBadge detail="Calculation: collected records for this product; no inferred customers" />
                <details className="metric-help">
                  <summary>Research run trace</summary>
                  <ol>
                    {report?.trace.map((step, i) => (
                      <li key={i} className="my-2">
                        <strong>{step.agent}</strong>: {step.message}
                      </li>
                    ))}
                  </ol>
                </details>
              </article>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <NeedsChart
                  records={feedback}
                  onSelect={(need) => {
                    window.location.href = `/desires?need=${need}`;
                  }}
                />
                {catalogFeedbackSources.map((url) => (
                  <SourceBadge key={url} url={url} />
                ))}
                {!feedback.length && (
                  <SourceBadge detail="No customer-feedback corpus captured for this product" />
                )}
              </div>
              <div>
                <SourceChart records={feedback} />
                {catalogFeedbackSources.map((url) => (
                  <SourceBadge key={url} url={url} />
                ))}
              </div>
            </div>
            <CoOccurrenceChart records={feedback} />
            <SourceBadge
              detail={`Calculated from ${feedback.length} saved customer records; association, not causality`}
            />
            <div className="flex gap-4 text-sm">
              <Link to="/desires" className="text-primary underline">
                Explore all ten customer needs
              </Link>
              <Link to="/journey" className="text-primary underline">
                Inspect missing customer perspectives
              </Link>
            </div>
          </>
        )}
        {tab === "comments" && (
          <>
            <div className="rounded-xl border bg-paper p-5">
              <h3 className="text-lg font-semibold">Customer sentiment, not marketing sentiment</h3>
              <div className="sentiment-bars">
                {(["positive", "mixed", "negative"] as const).map((tone) => {
                  const n = feedback.filter((c) => c.tone === tone).length;
                  const denominator = feedback.filter((c) => c.tone).length;
                  return (
                    <div key={tone}>
                      <span>{tone}</span>
                      <div>
                        <i style={{ width: `${denominator ? (n / denominator) * 100 : 0}%` }} />
                      </div>
                      <strong>
                        {n} / {denominator}
                      </strong>
                    </div>
                  );
                })}
              </div>
              <SourceBadge detail="AI/reviewer tone labels among saved customer records with known tone; not a representative satisfaction score" />
              {catalogFeedbackSources.map((url) => (
                <SourceBadge key={url} url={url} />
              ))}
            </div>
            {!feedback.length && (
              <div className="workspace-notice">
                <strong>No verified customer-feedback collection yet.</strong>
                <p>
                  Public product pages do not substitute for user reviews. Run research or ingest a
                  permitted original comment below.
                </p>
                <SourceBadge
                  detail={`Current collection for ${entry.name}: zero collected feedback records`}
                />
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {feedback.map((comment) => (
                <article key={comment.id} className="rounded-xl border bg-paper p-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{comment.tone || "Unclassified"}</span>
                    <span>{comment.codingStatus}</span>
                  </div>
                  <blockquote className="my-3 text-sm">“{comment.text}”</blockquote>
                  <SourceBadge url={comment.sourceUrl} detail={comment.sourceReference} />
                  <div className="flex gap-2 flex-wrap mt-3">
                    {comment.codings.map((c, i) => (
                      <span key={i} className="text-xs rounded-full border px-2 py-1">
                        {DESIRE_META[c.desire].label}: {c.need}
                      </span>
                    ))}
                  </div>
                  <SourceBadge
                    url={comment.sourceUrl}
                    detail="Need tags are interpretations requiring source review"
                  />
                </article>
              ))}
            </div>
            {commentary.length > 0 && (
              <details className="rounded-xl border bg-paper p-5">
                <summary className="font-semibold cursor-pointer">
                  Provider claims &amp; market commentary ({commentary.length})
                </summary>
                {commentary.map((c, i) => (
                  <div key={i} className="border-t mt-4 pt-3">
                    <span className="text-xs font-semibold">{c.kind}</span>
                    <blockquote className="my-2 text-sm">“{c.quote}”</blockquote>
                    {cited([c.documentId])}
                  </div>
                ))}
              </details>
            )}
            <details className="rounded-xl border bg-paper p-5">
              <summary className="cursor-pointer font-semibold">
                Published problem framing, not client reviews
              </summary>
              <p className="text-sm text-muted-foreground my-3">
                These short excerpts describe problems the provider says it addresses. They do not
                establish dissatisfaction with the selected Kearney offering.
              </p>
              {(PUBLISHED_CONTEXT[entry.id] || []).map((quote) => (
                <blockquote key={quote} className="my-4 text-sm">
                  <p>“{quote}”</p>
                  <SourceBadge
                    url={entry.source.url}
                    platform={entry.source.platform}
                    detail="Provider claim; excluded from customer sentiment and pain-point counts"
                  />
                </blockquote>
              ))}
            </details>
            <ResearchAgent />
            <div>
              <Link to="/evidence" className="text-primary underline text-sm">
                Review and correct saved evidence tags
              </Link>
            </div>
          </>
        )}
        {tab === "compare" && (
          <>
            <h3 className="text-xl font-semibold">{entry.name} and its discovered alternatives</h3>
            <p className="text-sm text-muted-foreground">
              Competitors are found for the selected product. No competitor names or source data are
              required from you. Missing evidence stays unknown; consulting services and SaaS
              products are not automatically equivalent.
            </p>
            <SourceBadge
              detail={
                report
                  ? `Discovery run ${report.id.slice(0, 8)}`
                  : "Automatic research has not completed"
              }
            />
            {report?.competitors.map((c) => (
              <article key={c.name} className="rounded-lg border bg-paper p-4">
                <strong>{c.name}</strong>
                <span className="text-xs ml-3">{c.relation}</span>
                <p className="text-sm mt-2">{c.rationale}</p>
                <SourceBadge
                  url={c.sourceUrl}
                  detail="Search-grounded relevance, not independent product validation"
                />
              </article>
            ))}
            {!report?.competitors.length && (
              <div className="workspace-notice">
                No grounded competitors returned yet. We do not substitute a fixed list of famous
                firms.
                <SourceBadge detail="Current discovery run has no verified competitor records" />
              </div>
            )}
            {report?.analysis?.matrix.length ? (
              <>
                <div className="overflow-x-auto rounded-xl border">
                  <table className="competitor-table">
                    <caption className="sr-only">
                      Automatic product comparison with citations
                    </caption>
                    <thead>
                      <tr>
                        <th>Offering</th>
                        <th>Pricing model</th>
                        <th>AI capabilities</th>
                        <th>Time to value</th>
                        <th>Customer sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.analysis.matrix.map((row) => (
                        <tr key={row.product}>
                          <th scope="row">{row.product}</th>
                          {(["pricing", "ai", "timeToValue", "sentiment"] as const).map((key) => (
                            <td key={key}>
                              <p>{row[key].value}</p>
                              {cited(row[key].documentIds, row[key].quote)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <article className="rounded-xl border bg-paper p-5">
                  <h4 className="font-semibold">Comparison evidence coverage</h4>
                  <p className="text-xs text-muted-foreground">
                    Supported criteria out of four. This measures documentation coverage, not
                    product quality.
                  </p>
                  <div className="coverage-bars">
                    {report.analysis.matrix.map((row) => {
                      const cells = [row.pricing, row.ai, row.timeToValue, row.sentiment];
                      const n = cells.filter((c) => c.documentIds.length).length;
                      return (
                        <div key={row.product}>
                          <strong>{row.product}</strong>
                          <span>
                            <i style={{ width: `${n * 25}%` }} />
                          </span>
                          <b>{n}/4</b>
                          {cited([...new Set(cells.flatMap((c) => c.documentIds))])}
                        </div>
                      );
                    })}
                  </div>
                </article>
              </>
            ) : (
              <SourceBadge detail="Comparison matrix is unavailable until captured source quotations pass validation" />
            )}
          </>
        )}
        {tab === "roadmap" && (
          <>
            <h3 className="text-xl font-semibold">Product improvements supported by evidence</h3>
            <p className="text-sm text-muted-foreground">
              Each recommendation is a hypothesis with a source and a proposed test. A provider
              claim alone cannot prove a customer pain point.
            </p>
            <SourceBadge detail="Recommendations are generated from this research run, with basis labels and supporting quotations below" />
            {!report?.analysis?.roadmap.length && (
              <div className="workspace-notice">
                No grounded renewal recommendations yet. Gather original customer feedback to
                support them.
                <SourceBadge detail="No validated roadmap items in the current run" />
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {report?.analysis?.roadmap.map((r, i) => (
                <article key={i} className="rounded-xl border bg-paper p-5 space-y-3">
                  <span className="section-kicker">
                    {r.basis === "customer-feedback"
                      ? "Customer-feedback hypothesis"
                      : "Exploratory hypothesis; customer validation needed"}
                  </span>
                  <h4 className="text-lg font-semibold">{r.title}</h4>
                  {cited(r.documentIds, r.quote)}
                  <p className="text-sm">
                    <strong>Improve:</strong> {r.improvement}
                  </p>
                  {cited(r.documentIds)}
                  <p className="text-sm">
                    <strong>Hypothesis:</strong> {r.hypothesis}
                  </p>
                  {cited(r.documentIds)}
                  <p className="text-sm">
                    <strong>Test:</strong> {r.experiment}
                  </p>
                  {cited(r.documentIds)}
                  <label className="text-sm">
                    Research status
                    <select
                      className="research-input"
                      value={disposition[`${entry.id}:${r.title}`] || "Investigate"}
                      onChange={(e) => {
                        const next = { ...disposition, [`${entry.id}:${r.title}`]: e.target.value };
                        setDisposition(next);
                        try {
                          localStorage.setItem(
                            "signalscope:roadmap-status:v1",
                            JSON.stringify(next),
                          );
                        } catch {
                          setNotice("Status could not be saved.");
                        }
                      }}
                    >
                      <option>Investigate</option>
                      <option>Ready to test</option>
                      <option>Tested; record outcome in company pilot</option>
                    </select>
                  </label>
                </article>
              ))}
            </div>
            <Link to="/company" className="text-primary underline">
              Record an experiment and outcome in the shared company pilot
            </Link>
          </>
        )}
      </div>
      <details className="rounded-xl border bg-paper p-5">
        <summary className="cursor-pointer font-semibold">
          All sources &amp; collection gaps ({report?.documents.length || 0})
        </summary>
        <p className="text-xs text-muted-foreground mt-3">
          The label “Source: PERLab / platform” identifies this research workflow. It does not imply
          PERLab authored, verified or endorsed third-party comments.
        </p>
        {report?.documents.map((d) => (
          <article key={d.id} className="border-t mt-4 pt-3">
            <strong className="text-sm">{d.title}</strong>
            <span className="text-xs ml-2">
              {d.status} · {d.kind}
            </span>
            <SourceBadge
              url={d.url}
              platform={d.platform}
              detail={d.note || `Captured ${d.capturedAt}`}
            />
          </article>
        ))}
      </details>
    </div>
  );
}
