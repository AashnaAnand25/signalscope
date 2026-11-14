import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageIntro } from "@/components/pocket/page-intro";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/company-survey")({
  validateSearch: (search: Record<string, unknown>) => ({
    productId: typeof search["productId"] === "string" ? search["productId"] : "",
  }),
  head: () => ({ meta: [{ title: "Product research survey · SignalScope" }] }),
  component: CompanySurvey,
});
function CompanySurvey() {
  const { productId } = Route.useSearch();
  const [notice, setNotice] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const base =
      import.meta.env["VITE_COMPANY_API_URL"] ||
      `${window.location.protocol}//${window.location.hostname}:8090`;
    try {
      const response = await fetch(`${base}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          productId,
          awareness: data.get("awareness"),
          experience: data.get("experience"),
          need: data.get("need"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed.");
      setSent(true);
      setNotice("Thank you. Your response was submitted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Submission failed.");
    }
  }
  return (
    <div className="max-w-2xl space-y-6">
      <PageIntro
        eyebrow="Voluntary research"
        title="Tell us about your experience"
        description="Your answers help identify needs that reviews may miss. This form is for a specific company product, not the fictional demo."
      />
      {!productId ? (
        <p role="alert">A product link is required.</p>
      ) : sent ? (
        <p role="status" className="rounded-xl bg-sage p-5">
          {notice}
        </p>
      ) : (
        <form className="space-y-5 rounded-xl border bg-white p-6" onSubmit={(e) => void submit(e)}>
          <p className="text-sm">
            Product reference: <code>{productId}</code>
          </p>
          <label className="block text-sm font-semibold">
            Had you heard of this product before opening this link?
            <select
              className="mt-2 w-full rounded border p-2"
              name="awareness"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Choose one
              </option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="not-sure">Not sure</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Which best describes your experience?
            <select
              className="mt-2 w-full rounded border p-2"
              name="experience"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Choose one
              </option>
              <option value="never-encountered">Never encountered it</option>
              <option value="not-interested">Saw it, not interested</option>
              <option value="considered">Considered, did not purchase</option>
              <option value="purchased">Purchased</option>
              <option value="accessed-other">Used or accessed another way</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            What need or concern mattered most? (optional)
            <textarea
              className="mt-2 w-full rounded border p-2"
              name="need"
              maxLength={400}
              rows={3}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            This is a convenience sample. Your answer does not prove market prevalence or a purchase
            outcome.
          </p>
          <Button>Submit response</Button>
          {notice && (
            <p role="alert" className="text-sm">
              {notice}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
