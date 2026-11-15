import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/pocket/page-intro";
import { useDemo } from "@/lib/demo-store";
import { AWARENESS_OPTIONS, EXPERIENCE_OPTIONS, POSTED_OPTIONS, surveySchema } from "@/lib/survey";
import { DESIRE_IDS, type SurveyResponse } from "@/lib/types";
import { DESIRE_META } from "@/lib/labels";
export const Route = createFileRoute("/feedback")({
  validateSearch: (s: Record<string, unknown>): { product?: string } =>
    typeof s["product"] === "string" ? { product: s["product"] } : {},
  head: () => ({ meta: [{ title: "Collect feedback · SignalScope" }] }),
  component: Feedback,
});
function Feedback() {
  const { product, products, setProductId, addResponse, markTrail, hydrated } = useDemo();
  const selectedProduct = Route.useSearch().product;
  useEffect(() => {
    if (hydrated && selectedProduct && products.some((p) => p.id === selectedProduct))
      setProductId(selectedProduct);
  }, [hydrated, selectedProduct, products, setProductId]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState("");
  const [consent, setConsent] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const u = new URL("/feedback", window.location.origin);
    u.searchParams.set("product", product.id);
    setUrl(u.href);
    void QRCode.toDataURL(u.href, { width: 180, margin: 1 })
      .then(setQr)
      .catch(() => setError("QR generation unavailable. Copy the survey link instead."));
  }, [product.id]);
  useEffect(() => {
    setStep(0);
    setDone(false);
    setValues({});
    setConsent(false);
  }, [product.id]);
  function change(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setError("");
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Please consent before saving a response.");
      return;
    }
    const parsed = surveySchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields.");
      return;
    }
    if (!product.survey.priceRanges.some((p) => p.value === parsed.data.priceRange)) {
      setError("Select a valid product price range.");
      return;
    }
    const response: SurveyResponse = {
      ...parsed.data,
      id: `RESP-${crypto.randomUUID()}`,
      productId: product.id,
      submittedAt: new Date().toISOString(),
      origin: "collected",
    };
    try {
      addResponse(response);
      markTrail("survey");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Response could not be saved.");
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageIntro
        eyebrow="Primary research"
        title="Ask the next useful question"
        description="A short, voluntary survey. Category preferences are separate from experience with the selected product."
      />
      <div className="workspace-notice">
        Local demonstration: answers stay in this browser. A response on another device will not
        update this dashboard. Public source records and new survey responses remain separate.
        Fictional seed records, where present, are labeled synthetic. We collect no name or email.
      </div>
      {done ? (
        <section className="rounded-xl border bg-white p-8">
          <p className="text-xs font-semibold uppercase text-primary">Response saved locally</p>
          <h2 className="mt-3 text-3xl font-semibold">Thank you for contributing.</h2>
          <p className="my-4 text-muted-foreground">
            Your response is labeled as collected survey evidence. It is not a representative market
            estimate.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/evidence">Inspect the evidence</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDone(false);
                setValues({});
                setStep(0);
                setConsent(false);
              }}
            >
              Start another response
            </Button>
          </div>
        </section>
      ) : (
        <form onSubmit={submit} className="workspace-form rounded-xl border bg-white p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Step {step + 1} of 2
          </span>
          {step === 0 ? (
            <>
              <h2 className="text-2xl font-semibold">Before viewing this study</h2>
              <label>
                Had you heard of {product.shortName} before first seeing this study?
                <select
                  required
                  value={values["awareness"] ?? ""}
                  onChange={(e) => change("awareness", e.target.value)}
                >
                  <option value="" disabled>
                    Select an answer
                  </option>
                  {AWARENESS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              {values["awareness"] === "yes" && (
                <label>
                  Where did you encounter it?
                  <select
                    value={values["discovery"] ?? ""}
                    onChange={(e) => change("discovery", e.target.value)}
                  >
                    <option value="">Not specified</option>
                    {product.survey.discoveryOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <Button type="button" disabled={!values["awareness"]} onClick={() => setStep(1)}>
                Continue to preferences
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">Your priorities</h2>
              <p className="text-sm text-muted-foreground">
                Selected research product: {product.name}. {product.description}
              </p>
              <label>
                Experience with this specific product
                <select
                  required
                  value={values["experience"] ?? ""}
                  onChange={(e) => change("experience", e.target.value)}
                >
                  <option value="" disabled>
                    Select an answer
                  </option>
                  {EXPERIENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                What matters most when choosing {product.categoryPlural}?
                <select
                  required
                  value={values["topDesire"] ?? ""}
                  onChange={(e) => change("topDesire", e.target.value)}
                >
                  <option value="" disabled>
                    Select a priority
                  </option>
                  {DESIRE_IDS.map((d) => (
                    <option key={d} value={d}>
                      {DESIRE_META[d].label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Price range you would consider
                <select
                  required
                  value={values["priceRange"] ?? ""}
                  onChange={(e) => change("priceRange", e.target.value)}
                >
                  <option value="" disabled>
                    Select a range
                  </option>
                  {product.survey.priceRanges.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                What would you need to know before choosing this product?
                <textarea
                  maxLength={400}
                  value={values["needToKnow"] ?? ""}
                  onChange={(e) => change("needToKnow", e.target.value)}
                />
              </label>
              {["purchased", "accessed-other"].includes(values["experience"] ?? "") && (
                <>
                  <label>
                    Have you actually used it?
                    <select
                      value={values["usedProduct"] ?? ""}
                      onChange={(e) => change("usedProduct", e.target.value)}
                    >
                      <option value="">Not specified</option>
                      <option value="yes">Yes</option>
                      <option value="no">No, not yet</option>
                    </select>
                  </label>
                  {values["usedProduct"] === "yes" && (
                    <>
                      <label>
                        What worked or frustrated you?
                        <textarea
                          maxLength={400}
                          value={values["usageNotes"] ?? ""}
                          onChange={(e) => change("usageNotes", e.target.value)}
                        />
                      </label>
                      <label>
                        Have you shared feedback?
                        <select
                          value={values["posted"] ?? ""}
                          onChange={(e) => change("posted", e.target.value)}
                        >
                          <option value="">Not specified</option>
                          {POSTED_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}
                </>
              )}
              <label className="!flex items-start gap-3">
                <input
                  className="!w-auto mt-1"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  I voluntarily agree to save these answers in this browser for the research demo.
                </span>
              </label>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button type="submit" disabled={!hydrated || !consent}>
                  Save response locally
                </Button>
              </div>
            </>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      )}
      <details className="rounded-xl border bg-white p-5">
        <summary className="cursor-pointer text-sm font-semibold">Survey link and QR code</summary>
        <p className="mt-3 text-xs text-muted-foreground">
          This URL opens a separate local survey on each device. Shared collection requires the
          teammate backend integration. A localhost URL is not reachable from other devices.
        </p>
        {qr && <img src={qr} alt="QR code for the displayed survey URL" width={180} height={180} />}
        <code className="block break-all text-xs">{url}</code>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setError("Survey link copied.");
            } catch {
              setError("Copy unavailable. Select the displayed URL manually.");
            }
          }}
        >
          Copy survey link
        </Button>
      </details>
    </div>
  );
}
