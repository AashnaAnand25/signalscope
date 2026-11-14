import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { PageIntro } from "@/components/pocket/page-intro";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/company")({
  head: () => ({ meta: [{ title: "Kearney PERLab pilot · SignalScope" }] }),
  component: CompanyWorkspace,
});

const kearneyBrief = [
  {
    title: "Design for growth",
    description:
      "PERLab describes work on product launches, portfolio clarity, and bringing customer insight into design decisions.",
    source: "https://www.kearney.com/web/product-excellence-and-renewal-lab/what-we-do",
  },
  {
    title: "Design for margin",
    description:
      "PERLab also describes product and portfolio redesign with cost, sourcing, quality, and sustainability trade-offs.",
    source: "https://www.kearney.com/web/product-excellence-and-renewal-lab/what-we-do",
  },
  {
    title: "Client data comes next",
    description:
      "Kearney invites teams to bring their own data and product into PERLab's collaborative process. A public service page is not a customer review dataset.",
    source: "https://www.kearney.com/web/product-excellence-and-renewal-lab/about-us",
  },
] as const;

type Product = {
  id: string;
  name: string;
  category: string;
  variant: string;
  version: string;
  region: string;
  attributes: Record<string, string>;
};
type Evidence = {
  id: string;
  productId: string;
  sourceType: string;
  text: string;
  sourceReference: string;
  status: string;
  need?: string;
  quote?: string;
  barrier?: string;
  segment?: string;
};
type Decision = {
  id: string;
  title: string;
  hypothesis: string;
  options: string[];
  supportingIds: string[];
  contradictingIds: string[];
  owner: string;
  successMetric: string;
  guardrail: string;
  reversal: string;
  status: string;
};
type Outcome = {
  id: string;
  arm: string;
  period: string;
  visitors: number;
  orders: number;
  revenue: number;
  cost: number;
  returns: number;
};
function rates(o: Outcome) {
  if (!o.visitors) return "No visitors recorded; rates unavailable.";
  const orderRate = ((100 * o.orders) / o.visitors).toFixed(1);
  const contribution = ((o.revenue - o.cost) / o.visitors).toFixed(2);
  const returnRate = o.orders ? ((100 * o.returns) / o.orders).toFixed(1) : "n/a";
  return `${orderRate}% order rate · ${contribution} contribution per visitor · ${returnRate}% returns per order`;
}
type Survey = { id: string; awareness: string; experience: string; need: string };
const field = "w-full rounded-lg border bg-white px-3 py-2 text-sm";
const apiBase = () =>
  import.meta.env["VITE_COMPANY_API_URL"] ||
  `${window.location.protocol}//${window.location.hostname}:8090`;
const val = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const ids = (s: string) =>
  s
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

function CompanyWorkspace() {
  const [token, setToken] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [records, setRecords] = useState<Evidence[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [outcomes, setOutcomes] = useState<Record<string, Outcome[]>>({});
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const needGroups = Object.entries(
    records
      .filter((r) => r.status === "reviewed" && r.need)
      .reduce<Record<string, string[]>>((groups, r) => {
        const key = r.need!.trim().toLowerCase();
        (groups[key] ??= []).push(r.id);
        return groups;
      }, {}),
  );

  const request = useCallback(
    async <T,>(path: string, method = "GET", data?: unknown): Promise<T> => {
      const response = await fetch(`${apiBase()}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(data === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(data === undefined ? {} : { body: JSON.stringify(data) }),
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
      return result as T;
    },
    [token],
  );

  async function load(id = productId) {
    const all = await request<Product[]>("/api/products");
    setProducts(all);
    const selected = all.some((p) => p.id === id) ? id : all[0]?.id || "";
    setProductId(selected);
    if (!selected) {
      setRecords([]);
      setDecisions([]);
      setSurveys([]);
      setConnected(true);
      return;
    }
    const key = encodeURIComponent(selected);
    const [evidence, items, responses] = await Promise.all([
      request<Evidence[]>(`/api/evidence?productId=${key}`),
      request<Decision[]>(`/api/decisions?productId=${key}`),
      request<Survey[]>(`/api/surveys?productId=${key}`),
    ]);
    setRecords(evidence);
    setDecisions(items);
    setSurveys(responses);
    const outcomeEntries = await Promise.all(
      items.map(
        async (d) =>
          [
            d.id,
            await request<Outcome[]>(`/api/outcomes?decisionId=${encodeURIComponent(d.id)}`),
          ] as const,
      ),
    );
    setOutcomes(Object.fromEntries(outcomeEntries));
    setConnected(true);
  }
  async function action(fn: () => Promise<void>) {
    try {
      setMessage("");
      await fn();
      setMessage("Saved. Shared records refreshed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed.");
    }
  }
  async function submit(
    event: React.FormEvent<HTMLFormElement>,
    fn: (data: FormData) => Promise<void>,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await action(async () => {
      await fn(data);
      form.reset();
      await load();
    });
  }

  return (
    <div className="space-y-7">
      <PageIntro
        eyebrow="Kearney PERLab case · Shared research"
        title="From client product evidence to a testable decision"
        description="Use this workspace for a PERLab client product: connect the catalog, review original customer passages, compare design and margin options, and measure outcomes. The fictional backpack demo remains separate."
      />
      <section aria-labelledby="kearney-brief" className="space-y-4 rounded-xl border bg-white p-5">
        <div>
          <h2 id="kearney-brief" className="text-xl font-semibold">
            Public Kearney brief
          </h2>
          <p className="text-sm text-muted-foreground">
            Independent hackathon prototype, not an official Kearney system. These are descriptions
            of Kearney's offering, not customer testimony, verified impact, or evidence about a
            client's product.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {kearneyBrief.map((item) => (
            <article key={item.title} className="rounded-xl border bg-muted/40 p-4 text-sm">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2">{item.description}</p>
              <a
                className="mt-3 inline-block underline"
                href={item.source}
                target="_blank"
                rel="noreferrer"
              >
                Kearney source
              </a>
            </article>
          ))}
        </div>
        <p className="rounded-lg bg-butter/50 p-3 text-sm">
          First case: choose one client product and revision. Bring permitted customer passages, a
          product/BOM or service cost breakdown, and comparable conversion or outcome data. A
          product improvement can raise demand and still hurt margin or another customer segment.
        </p>
      </section>
      <section className="rounded-xl border bg-white p-5 space-y-3">
        <h2 className="text-xl font-semibold">Connect to the research API</h2>
        <p className="text-sm text-muted-foreground">
          The reviewer token stays in this tab’s memory. Supply the server URL through
          VITE_COMPANY_API_URL at build time for a hosted deployment.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            className={`${field} max-w-md`}
            type="password"
            aria-label="Reviewer token"
            placeholder="Reviewer token"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setConnected(false);
              setProductId("");
              setProducts([]);
              setRecords([]);
              setDecisions([]);
              setSurveys([]);
            }}
            autoComplete="off"
          />
          <Button type="button" onClick={() => void action(() => load())}>
            Connect / refresh
          </Button>
        </div>
        <p role="status" className="text-sm">
          {message ||
            (connected ? "Connected to shared research API." : "Connect to see company data.")}
        </p>
      </section>
      {connected && (
        <>
          <section className="rounded-xl border bg-white p-5 space-y-4">
            <h2 className="text-xl font-semibold">Products and variants</h2>
            <p className="text-sm text-muted-foreground">
              Create a separate ID for each model/version/region whose evidence should not be
              pooled. Attributes are category-specific key/value pairs.
            </p>
            <select
              className={`${field} max-w-md`}
              aria-label="Company product"
              value={productId}
              onChange={(e) => void action(() => load(e.target.value))}
            >
              {products.length === 0 && <option value="">No products yet</option>}
              {products.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name} · {p.variant} v{p.version} · {p.region}
                </option>
              ))}
            </select>
            <form
              className="grid gap-2 sm:grid-cols-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const d = new FormData(form);
                void action(async () => {
                  const p = {
                    id: val(d, "id"),
                    name: val(d, "name"),
                    category: val(d, "category"),
                    variant: val(d, "variant"),
                    version: val(d, "version"),
                    region: val(d, "region"),
                    attributes: JSON.parse(val(d, "attributes") || "{}"),
                  };
                  await request("/api/products", "POST", p);
                  form.reset();
                  await load(p.id);
                });
              }}
            >
              {(["id", "name", "category", "variant", "version", "region"] as const).map((name) => (
                <label className="text-xs font-semibold" key={name}>
                  {name}
                  <input className={field} name={name} required />
                </label>
              ))}
              <label className="text-xs font-semibold sm:col-span-2">
                Attributes JSON (optional)
                <input
                  className={field}
                  name="attributes"
                  placeholder='{"capacity":"20 L","material":"nylon"}'
                />
              </label>
              <Button className="self-end">Create product</Button>
            </form>
          </section>
          {productId && (
            <>
              <section className="rounded-xl border bg-white p-5 space-y-4">
                <h2 className="text-xl font-semibold">Evidence · {records.length} passages</h2>
                <div className="rounded-lg bg-sage/40 p-3 text-sm">
                  <strong>Reviewed need labels</strong>
                  <p className="text-xs text-muted-foreground">
                    Exact normalized labels only. These counts are passages, not unique people or
                    market prevalence; synonyms need a researcher to merge them.
                  </p>
                  {needGroups.length ? (
                    needGroups.map(([need, recordIds]) => (
                      <p key={need}>
                        {need}: {recordIds.length} · {recordIds.join(", ")}
                      </p>
                    ))
                  ) : (
                    <p>No reviewed needs yet.</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Import 1–500 JSON records. Each needs a stable ID, exact product ID, source type,
                  original text and a source reference. No automated extraction is running.
                </p>
                <input
                  aria-label="Import company evidence JSON"
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void action(async () => {
                      if (file.size > 2_000_000) throw new Error("File exceeds 2 MB.");
                      await request("/api/evidence", "POST", JSON.parse(await file.text()));
                      await load();
                      e.target.value = "";
                    });
                  }}
                />
                <details className="text-sm">
                  <summary>Evidence JSON example</summary>
                  <pre className="overflow-auto rounded bg-muted p-3">
                    {JSON.stringify(
                      [
                        {
                          id: "review-001",
                          productId,
                          sourceType: "review",
                          text: "Original customer passage",
                          sourceReference: "Approved export row 001",
                        },
                      ],
                      null,
                      2,
                    )}
                  </pre>
                </details>
                <div className="grid gap-3 lg:grid-cols-2">
                  {records.map((r) => (
                    <article key={r.id} className="rounded-xl border p-4 space-y-2 text-sm">
                      <p className="font-semibold">
                        {r.id} · {r.sourceType} · {r.status}
                      </p>
                      <p>{r.text}</p>
                      <p className="text-xs text-muted-foreground">Source: {r.sourceReference}</p>
                      {r.status === "reviewed" ? (
                        <p className="rounded bg-sage/40 p-2">
                          Need: {r.need} · exact quote: “{r.quote}”{" "}
                          {r.segment && `· segment: ${r.segment}`}
                        </p>
                      ) : (
                        <form
                          className="space-y-2"
                          onSubmit={(e) =>
                            void submit(e, async (d) => {
                              await request(`/api/evidence/${encodeURIComponent(r.id)}`, "PATCH", {
                                status: "reviewed",
                                need: val(d, "need"),
                                quote: val(d, "quote"),
                                segment: val(d, "segment"),
                                barrier: val(d, "barrier"),
                              });
                            })
                          }
                        >
                          <input
                            className={field}
                            name="need"
                            placeholder="Need, in neutral words"
                            required
                          />
                          <input
                            className={field}
                            name="quote"
                            placeholder="Exact substring supporting the need"
                            required
                          />
                          <input
                            className={field}
                            name="segment"
                            placeholder="Segment (if explicitly stated)"
                          />
                          <input
                            className={field}
                            name="barrier"
                            placeholder="Barrier (optional)"
                          />
                          <Button size="sm">Review with quote</Button>{" "}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void action(async () => {
                                await request(
                                  `/api/evidence/${encodeURIComponent(r.id)}`,
                                  "PATCH",
                                  { status: "rejected" },
                                );
                                await load();
                              })
                            }
                          >
                            Reject
                          </Button>
                        </form>
                      )}
                    </article>
                  ))}
                </div>
              </section>
              <section className="rounded-xl border bg-white p-5 space-y-4">
                <h2 className="text-xl font-semibold">Decisions · {decisions.length}</h2>
                <p className="text-sm text-muted-foreground">
                  A proposal needs reviewed supporting passages and a reviewed counterexample for
                  this product. IDs are comma-separated.
                </p>
                <form
                  className="grid gap-2 sm:grid-cols-2"
                  onSubmit={(e) =>
                    void submit(e, async (d) => {
                      await request("/api/decisions", "POST", {
                        id: val(d, "id"),
                        productId,
                        title: val(d, "title"),
                        hypothesis: val(d, "hypothesis"),
                        options: ids(val(d, "options")),
                        supportingIds: ids(val(d, "supportingIds")),
                        contradictingIds: ids(val(d, "contradictingIds")),
                        owner: val(d, "owner"),
                        successMetric: val(d, "successMetric"),
                        guardrail: val(d, "guardrail"),
                        reversal: val(d, "reversal"),
                      });
                    })
                  }
                >
                  {(
                    [
                      "id",
                      "title",
                      "hypothesis",
                      "options",
                      "supportingIds",
                      "contradictingIds",
                      "owner",
                      "successMetric",
                      "guardrail",
                      "reversal",
                    ] as const
                  ).map((name) => (
                    <label key={name} className="text-xs font-semibold">
                      {name}
                      <input className={field} name={name} required />
                    </label>
                  ))}
                  <Button className="sm:col-span-2">Propose test</Button>
                </form>
                {decisions.map((d) => (
                  <article className="rounded-xl border p-4 space-y-3 text-sm" key={d.id}>
                    <h3 className="font-semibold text-lg">
                      {d.title} · {d.status}
                    </h3>
                    <p>{d.hypothesis}</p>
                    <p>Options: {d.options.join(" / ")}</p>
                    <p>
                      Support: {d.supportingIds.join(", ")} · Counterevidence:{" "}
                      {d.contradictingIds.join(", ")}
                    </p>
                    <p>
                      Success: {d.successMetric} · Guardrail: {d.guardrail} · Reverse if:{" "}
                      {d.reversal}
                    </p>
                    <div className="flex gap-2">
                      {(["proposed", "testing", "completed"] as const).map((status) => (
                        <Button
                          key={status}
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={d.status === status}
                          onClick={() =>
                            void action(async () => {
                              await request(`/api/decisions/${encodeURIComponent(d.id)}`, "PATCH", {
                                status,
                              });
                              await load();
                            })
                          }
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                    <h4 className="font-semibold">Observed outcomes</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(outcomes[d.id] ?? []).map((o) => (
                        <p className="rounded bg-muted p-2" key={o.id}>
                          {o.arm} · {o.period}: {o.orders}/{o.visitors} orders, revenue {o.revenue},
                          cost {o.cost}, returns {o.returns}. {rates(o)}
                        </p>
                      ))}
                    </div>
                    <form
                      className="grid gap-2 sm:grid-cols-4"
                      onSubmit={(e) =>
                        void submit(e, async (data) => {
                          await request("/api/outcomes", "POST", {
                            id: val(data, "id"),
                            decisionId: d.id,
                            arm: val(data, "arm"),
                            period: val(data, "period"),
                            visitors: Number(val(data, "visitors")),
                            orders: Number(val(data, "orders")),
                            revenue: Number(val(data, "revenue")),
                            cost: Number(val(data, "cost")),
                            returns: Number(val(data, "returns")),
                          });
                        })
                      }
                    >
                      {(
                        [
                          "id",
                          "arm",
                          "period",
                          "visitors",
                          "orders",
                          "revenue",
                          "cost",
                          "returns",
                        ] as const
                      ).map((name) => (
                        <label key={name} className="text-xs">
                          {name}
                          <input
                            className={field}
                            name={name}
                            type={
                              (
                                ["visitors", "orders", "revenue", "cost", "returns"] as string[]
                              ).includes(name)
                                ? "number"
                                : "text"
                            }
                            min="0"
                            step="any"
                            required
                          />
                        </label>
                      ))}
                      <Button className="sm:col-span-4">Record result</Button>
                    </form>
                  </article>
                ))}
              </section>
              <section className="rounded-xl border bg-white p-5 space-y-2">
                <h2 className="text-xl font-semibold">
                  Non-buyer and customer survey · {surveys.length} responses
                </h2>
                <p className="text-xs text-muted-foreground">
                  Convenience sample:{" "}
                  {
                    surveys.filter(
                      (s) => s.experience === "considered" || s.experience === "not-interested",
                    ).length
                  }{" "}
                  reported considering or declining,{" "}
                  {surveys.filter((s) => s.experience === "purchased").length} reported purchasing.
                  These are self-reports, not verified orders or conversion rates.
                </p>
                <p className="text-sm">
                  Share the public survey URL for this product:{" "}
                  <a
                    className="underline"
                    href={`/company-survey?productId=${encodeURIComponent(productId)}`}
                  >{`/company-survey?productId=${encodeURIComponent(productId)}`}</a>
                </p>
                {surveys.map((s) => (
                  <p className="rounded bg-muted p-2 text-sm" key={s.id}>
                    {s.id} · awareness: {s.awareness} · journey: {s.experience} · need:{" "}
                    {s.need || "none stated"}
                  </p>
                ))}
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
