import { createFileRoute } from "@tanstack/react-router";
import { ResearchAgent } from "@/components/research-agent";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/pocket/page-intro";
import { useDemo } from "@/lib/demo-store";
import { allDesireStats, summarize } from "@/lib/metrics";
export const Route = createFileRoute("/data")({
  head: () => ({ meta: [{ title: "Data workspace · SignalScope" }] }),
  component: DataWorkspace,
});
function download(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function DataWorkspace() {
  const { product, records, importRecords, hydrated } = useDemo();
  const input = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState("");
  const summary = summarize(product, records);
  const sample = [
    {
      id: "IMPORT-001",
      productId: product.id,
      sourceType: "discussion",
      text: "Replace this fictional example with permitted source text.",
      date: "2026-11-14",
      codings: [
        {
          desire: "compatibility",
          need: "Replace with a source-supported requirement",
          importance: "unknown",
          fulfillment: "unknown",
        },
      ],
      classification: "unknown",
      codingStatus: "pre-coded-demo",
      origin: "synthetic-seed",
    },
  ];
  return (
    <div className="space-y-7">
      <PageIntro
        eyebrow="Data operations"
        title="Bring your evidence. Keep its provenance."
        description="Import validated, product-specific JSON records. Source passages, survey responses, and model suggestions remain distinguishable."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Synthetic records",
            value: records.filter((r) => r.origin === "synthetic-seed").length,
          },
          {
            label: "Collected/imported records",
            value: records.filter((r) => r.origin === "collected").length,
          },
          { label: "Missing dates", value: records.filter((r) => !r.date).length },
        ].map((s) => (
          <div className="rounded-xl border bg-white p-5" key={s.label}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <strong className="mt-2 block text-3xl">{s.value}</strong>
          </div>
        ))}
      </div>
      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-xl font-semibold">Import evidence</h2>
        <p className="my-3 text-sm text-muted-foreground">
          Selected product ID: <code>{product.id}</code>. Supply an array of records. Imports are
          local to this browser. Files over 5 MB, duplicate IDs, incorrect product IDs, invalid
          categories, and unsafe source URLs are rejected.
        </p>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          aria-label="Import evidence JSON"
          disabled={!hydrated}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5 MB.");
              const count = importRecords(JSON.parse(await file.text()));
              setNotice(`Imported ${count} evidence records. Metrics have updated.`);
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Import failed.");
            } finally {
              if (input.current) input.current.value = "";
            }
          }}
        />
        <div className="workspace-export mt-5">
          <Button
            variant="outline"
            onClick={() => download("signalscope-import-example.json", sample)}
          >
            Download schema example
          </Button>
          <Button variant="outline" onClick={() => download("signalscope-evidence.json", records)}>
            Export current evidence
          </Button>
          <Button
            onClick={() =>
              download("signalscope-metrics.json", {
                productId: product.id,
                generatedAt: new Date().toISOString(),
                scope: "Current browser evidence collection, not market prevalence",
                summary,
                desires: allDesireStats(records),
              })
            }
          >
            Export calculated metrics
          </Button>
        </div>
        {notice && (
          <p role="status" className="workspace-notice mt-5 break-words">
            {notice}
          </p>
        )}
      </section>
      <ResearchAgent />
      <section className="workspace-notice">
        <strong>Research boundary</strong>
        <p>
          Real passages need a source URL or reference. Verify AI-suggested tags against the
          original. Gemini requires a server key. Velocity requires an authorized export; no direct
          connector is configured.
        </p>
      </section>
    </div>
  );
}
