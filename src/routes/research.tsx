import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Search, Download, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/pocket/page-intro";
import { PERLAB_TOOLS, VELOCITY_RESEARCH_URL } from "@/data/perlab-tools";
import { comparisonSchema, type Comparison } from "@/lib/research-contract";
const sourceSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  url: z.string().url().startsWith("https://"),
  title: z.string(),
  text: z.string().min(30).max(18000),
  capturedAt: z.string(),
  method: z.enum(["public-html", "manual-excerpt"]),
  purpose: z.enum(["product-spec", "customer-voice", "market-context"]),
});
type Source = z.infer<typeof sourceSchema>;
type Report = {
  comparison: Comparison;
  sources: Source[];
  priorities: string;
  generatedAt: string;
};
const storageKey = "signalscope:public-research:v1";
export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "PERLab research & competitors · SignalScope" }] }),
  component: ResearchWorkspace,
});
function ResearchWorkspace() {
  const [sources, setSources] = useState<Source[]>([]);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [manual, setManual] = useState("");
  const [purpose, setPurpose] = useState<Source["purpose"]>("product-spec");
  const [permission, setPermission] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [priorities, setPriorities] = useState(
    "Price, laptop compatibility, comfort, weather protection and repairability. Compare the same product versions and market.",
  );
  const [discovery, setDiscovery] = useState<{
    text: string;
    sources: { title: string; url: string }[];
  } | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => {
    try {
      const parsed = z
        .array(sourceSchema)
        .max(12)
        .parse(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
      setSources(parsed);
    } catch {
      /* ignore invalid local state */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(sources));
      } catch {
        setNotice("Storage is full. Sources remain available only for this visit.");
      }
    }
  }, [sources, ready]);
  async function addSource(mode: "capture" | "manual") {
    setBusy(true);
    setNotice("");
    try {
      if (!permission || !name.trim() || !url.trim())
        throw new Error("Add a product/model name, source URL and permission confirmation.");
      if (sources.length >= 12)
        throw new Error("The workspace holds 12 sources. Export or remove one first.");
      let source: Source;
      if (mode === "manual") {
        source = sourceSchema.parse({
          id: crypto.randomUUID(),
          name: name.trim(),
          url: url.trim(),
          text: manual.trim(),
          title: name.trim(),
          capturedAt: new Date().toISOString(),
          method: "manual-excerpt",
          purpose,
        });
      } else {
        const r = await fetch("/api/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
          signal: AbortSignal.timeout(45000),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Capture failed.");
        source = sourceSchema.parse({
          ...data,
          id: crypto.randomUUID(),
          name: name.trim(),
          purpose,
        });
      }
      if (sources.some((s) => s.url === source.url && s.name === source.name))
        throw new Error("That product/source is already captured.");
      setSources((prev) => [...prev, source]);
      setReport(null);
      setNotice(
        "Source captured locally. Review its text before comparing. No customer metrics changed.",
      );
      setManual("");
    } catch (e) {
      setNotice(
        e instanceof Error && ["TimeoutError", "AbortError"].includes(e.name)
          ? "Capture timed out. Paste a permitted excerpt instead."
          : e instanceof Error
            ? e.message
            : "Capture failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function discover() {
    setBusy(true);
    setNotice("");
    setDiscovery(null);
    try {
      const r = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(50000),
        body: JSON.stringify({
          mode: "search",
          text: `Find up to three directly competing product models for ${name.trim()}. Priorities and market context: ${priorities}. Prefer official manufacturer product pages. Give exact model/version, market, and source links where available. Distinguish direct alternatives from adjacent products. Do not invent specifications or choose a winner.`,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Discovery failed.");
      setDiscovery({
        text: data.text,
        sources: (data.sources ?? []).filter((source: { url: string }) =>
          source.url.startsWith("https://"),
        ),
      });
    } catch (e) {
      setNotice(
        e instanceof Error && ["TimeoutError", "AbortError"].includes(e.name)
          ? "Competitor discovery timed out. Try a narrower product and market."
          : e instanceof Error
            ? e.message
            : "Discovery failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function compare() {
    setBusy(true);
    setNotice("");
    setReport(null);
    try {
      const chosen = sources.filter((s) => selected.includes(s.id));
      if (
        chosen.length < 2 ||
        chosen.length > 4 ||
        new Set(chosen.map((s) => s.name)).size !== chosen.length
      )
        throw new Error("Select two to four sources with different product/model names.");
      const r = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "compare",
          text: priorities,
          competitors: chosen.map((s) => ({
            name: s.name,
            url: s.url,
            text: s.text.slice(0, 12000),
          })),
        }),
        signal: AbortSignal.timeout(50000),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Comparison failed.");
      setReport({
        comparison: comparisonSchema.parse(data),
        sources: chosen,
        priorities,
        generatedAt: new Date().toISOString(),
      });
      setNotice(
        "Comparison ready. Quote matches are checked; a researcher must still verify the interpretation.",
      );
    } catch (e) {
      setNotice(
        e instanceof Error && ["TimeoutError", "AbortError"].includes(e.name)
          ? "Comparison timed out. Nothing was saved. Retry with shorter excerpts."
          : e instanceof Error
            ? e.message
            : "Comparison failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  function exportBrief() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            project: "SignalScope | Kearney PERLab hackathon",
            boundary:
              "Independent prototype. Source claims are not validated customer demand, margin or official Kearney analysis.",
            sources,
            report,
            handoffs: PERLAB_TOOLS,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "perlab-research-brief.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  const gapCount =
    report?.comparison.rows.reduce(
      (n, row) => n + row.cells.filter((c) => c.status === "not-found").length,
      0,
    ) ?? 0;
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Kearney PERLab hackathon · Design for growth"
        title="From public signals to a product decision"
        description="Capture sources. Compare alternatives. Choose what to test."
      />
      <div className="getting-started">
        <strong>Research → Compare → Test → Handoff</strong>
        <span>Independent prototype. Public tool references are not live integrations.</span>
        <Button variant="outline" size="sm" onClick={exportBrief}>
          <Download size={15} />
          Export research brief
        </Button>
      </div>
      <section
        className="rounded-xl border bg-paper p-5 space-y-4"
        aria-labelledby="capture-heading"
      >
        <h2 id="capture-heading" className="text-xl font-semibold">
          1. Capture a source
        </h2>
        <p className="text-sm text-muted-foreground">
          One public HTML page at a time. We check robots.txt, preserve a source link and timestamp,
          and do not bypass sign-in or bot blocks. Text is whitespace-normalized and capped at
          18,000 characters.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Product/model name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Brand + model + version + region"
              className="research-input"
            />
          </label>
          <label className="text-sm font-semibold">
            Public source URL
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://brand.com/products/model"
              className="research-input"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="outline" disabled={busy || name.trim().length < 3} onClick={discover}>
            <Search size={15} />
            Find competing product sources
          </Button>
          <span className="text-xs text-muted-foreground">
            Sends the model name and priorities to Google Search.
          </span>
        </div>
        {discovery && (
          <div className="rounded-xl border p-4 space-y-3">
            <strong className="text-sm">Competitor leads, not verified findings</strong>
            <div className="agent-output">{discovery.text}</div>
            {discovery.sources.length ? (
              <ul className="space-y-2">
                {discovery.sources.map((source, i) => (
                  <li className="flex flex-wrap gap-3 text-sm" key={i}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {source.title}
                    </a>
                    <Button variant="outline" size="sm" onClick={() => setUrl(source.url)}>
                      Use this URL
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">
                No search sources returned. Do not treat this answer as verified web evidence.
              </p>
            )}
          </div>
        )}
        <label className="block text-sm font-semibold">
          What kind of source is this?
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as Source["purpose"])}
            className="research-input"
          >
            <option value="product-spec">Product specifications / supplier claims</option>
            <option value="customer-voice">
              Customer-reported experience (researcher labeled)
            </option>
            <option value="market-context">Market context / analyst research</option>
          </select>
        </label>
        <label className="flex gap-2 items-start text-sm">
          <input
            type="checkbox"
            checked={permission}
            onChange={(e) => setPermission(e.target.checked)}
          />
          <span>
            I have permission to use this source and its content. Robots permission alone does not
            grant reuse rights.
          </span>
        </label>
        <Button
          disabled={!ready || busy || !permission || !name.trim() || !url.trim()}
          onClick={() => addSource("capture")}
        >
          <Search size={16} />
          {busy ? "Working…" : "Capture public page"}
        </Button>
        <details className="metric-help">
          <summary>Page blocked, dynamic, or from Velocity?</summary>
          <p>
            Use an authorized original excerpt. A Velocity summary is analyst context, not a
            customer quotation. Keep the original citation. Manual entries are labeled separately.
          </p>
          <label className="block">
            Permitted excerpt
            <textarea
              className="research-input"
              rows={4}
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              maxLength={18000}
            />
          </label>
          <Button
            variant="outline"
            disabled={
              busy || !permission || manual.trim().length < 30 || !name.trim() || !url.trim()
            }
            onClick={() => addSource("manual")}
          >
            <Plus size={15} />
            Add excerpt
          </Button>
        </details>
      </section>
      {notice && (
        <p className="workspace-notice" role="status">
          {notice}
        </p>
      )}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Select competing products</h2>
        <p className="text-sm text-muted-foreground">
          Use two to four exact models. Compare the same region and version. Brand claims and
          customer testimony answer different questions.
        </p>
        {!sources.length && (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            No sources yet. Capture a page or add a permitted excerpt above.
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {sources.map((s) => (
            <article key={s.id} className="rounded-xl border bg-paper p-4 space-y-2">
              <label className="flex gap-2 font-semibold text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={(e) => {
                    setSelected(
                      e.target.checked ? [...selected, s.id] : selected.filter((id) => id !== s.id),
                    );
                    setReport(null);
                  }}
                />
                {s.name}
              </label>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline break-all"
              >
                {s.title}
                <ExternalLink className="inline ml-1" size={12} />
              </a>
              <p className="text-xs text-muted-foreground">
                {s.method === "public-html" ? "Public page capture" : "Manual excerpt"} ·{" "}
                {s.purpose} · {new Date(s.capturedAt).toLocaleDateString()} ·{" "}
                {s.text.length.toLocaleString()} characters
              </p>
              <details className="metric-help">
                <summary>Review captured text</summary>
                <p className="max-h-48 overflow-auto whitespace-pre-wrap">{s.text}</p>
              </details>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSources(sources.filter((x) => x.id !== s.id));
                  setSelected(selected.filter((id) => id !== s.id));
                  setReport(null);
                }}
              >
                <Trash2 size={13} />
                Remove local source
              </Button>
            </article>
          ))}
        </div>
        <label className="block text-sm font-semibold">
          Customer priorities and comparison criteria
          <textarea
            className="research-input"
            rows={2}
            value={priorities}
            onChange={(e) => {
              setPriorities(e.target.value);
              setReport(null);
            }}
            maxLength={12000}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Compare sends up to 12,000 characters per selected source to Google. Reports are drafts.
          No source capture enters customer statistics automatically.
        </p>
        <Button
          disabled={
            busy || selected.length < 2 || selected.length > 4 || priorities.trim().length < 3
          }
          onClick={compare}
        >
          {busy ? "Working…" : `Compare ${selected.length} products`}
        </Button>
      </section>
      {report && (
        <section className="space-y-4" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-xl font-semibold">
            3. Inspect the evidence gaps
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Products compared", n: report.sources.length },
              { label: "Criteria compared", n: report.comparison.rows.length },
              { label: "Cells needing more evidence", n: gapCount },
            ].map((x) => (
              <div className="rounded-xl border bg-paper p-4" key={x.label}>
                <p className="text-xs text-muted-foreground">{x.label}</p>
                <strong className="text-3xl">{x.n}</strong>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Missing evidence does not mean a competitor lacks a feature. Supporting quotes establish
            traceability, not independent validation.
          </p>
          <div className="overflow-x-auto rounded-xl border">
            <table className="competitor-table">
              <caption className="sr-only">Quoted competitor comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Criterion</th>
                  {report.sources.map((s) => (
                    <th scope="col" key={s.id}>
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.comparison.rows.map((row, i) => (
                  <tr key={i}>
                    <th scope="row">{row.criterion}</th>
                    {report.sources.map((s) => {
                      const cell = row.cells.find((c) => c.name === s.name);
                      return (
                        <td key={s.id}>
                          <strong className="text-sm">
                            {cell?.claim ?? "Not found in captured evidence"}
                          </strong>
                          {cell?.status === "supported" && (
                            <details className="metric-help">
                              <summary>Source quote</summary>
                              <blockquote className="my-2 border-l-2 pl-2">{cell.quote}</blockquote>
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline"
                              >
                                Open original source
                              </a>
                            </details>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="workspace-notice">
            <strong>Next product experiment</strong>
            <p className="mt-2">{report.comparison.nextTest}</p>
            <p className="mt-2 text-xs">
              Hypothesis only. Validate with real participants before a product decision.
            </p>
          </div>
        </section>
      )}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Handoff into the PERLab workflow</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {PERLAB_TOOLS.map((tool) => (
            <article className="rounded-xl border bg-paper p-4" key={tool.name}>
              <span className="section-kicker">{tool.stage}</span>
              <h3 className="font-semibold mt-1">{tool.name}</h3>
              <p className="text-sm mt-2">{tool.role}</p>
              <p className="text-sm text-muted-foreground my-2">{tool.handoff}</p>
              <a
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm underline"
              >
                Public product information
              </a>
              <span className="block text-xs text-muted-foreground mt-2">
                Manual brief handoff. API not connected.
              </span>
            </article>
          ))}
        </div>
        <div className="getting-started">
          <a
            href={VELOCITY_RESEARCH_URL}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            Open your Velocity research
          </a>
          <Link to="/company" className="text-primary underline">
            Open shared PERLab pilot
          </Link>
          <Link to="/data" className="text-primary underline">
            Review customer need tags
          </Link>
        </div>
      </section>
    </div>
  );
}
