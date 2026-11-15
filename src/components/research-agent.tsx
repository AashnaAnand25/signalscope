import { localExtraction, localEvidenceLookup } from "@/lib/local-research";
import { useEffect, useState } from "react";
import { Sparkles, Search, FileText, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { useDemo } from "@/lib/demo-store";
import { extractionSchema, type Extraction } from "@/lib/research-contract";
import { SOURCE_LABEL } from "@/lib/labels";
import type { SourceType } from "@/lib/types";

type Answer = {
  tone?: "positive" | "mixed" | "negative" | undefined;
  text?: string;
  suggestions?: Extraction["suggestions"];
  sources?: { url: string; title: string }[];
  searched?: boolean;
  model?: string;
  provider?: string;
};
export function ResearchAgent() {
  const { product, records, importRecords } = useDemo();
  const [mode, setMode] = useState<"extract" | "ask" | "search">("extract");
  const [text, setText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("discussion");
  const [includeDemo, setIncludeDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [status, setStatus] = useState<{
    configured: boolean;
    provider: string;
    model: string;
  } | null>(null);
  const [statusError, setStatusError] = useState(false);
  useEffect(() => {
    fetch("/api/research")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setStatus)
      .catch(() => setStatusError(true));
  }, []);
  const scope = records.filter((r) => includeDemo || r.origin === "collected").slice(0, 40);
  async function run() {
    setBusy(true);
    setNotice("");
    setAnswer(null);
    setSelected([]);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          text,
          records:
            mode === "ask" ? scope.map((r) => ({ id: r.id, text: r.text.slice(0, 3000) })) : [],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Research failed.");
      if (mode === "extract") extractionSchema.parse(data);
      setAnswer(data);
      setNotice(
        mode === "extract"
          ? "Review each proposed tag. Nothing has been added yet."
          : "AI draft. Check its sources before making a decision.",
      );
    } catch (e) {
      setNotice(
        e instanceof Error && ["TimeoutError", "AbortError"].includes(e.name)
          ? "The request took longer than 20 seconds. Nothing was saved. Try again; if it repeats, check the server network connection."
          : e instanceof Error
            ? e.message
            : "Request failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  function runLocal() {
    setSelected([]);
    setAnswer(
      mode === "extract"
        ? { ...localExtraction(text), provider: "local-rules", model: "keyword-rules-v1" }
        : {
            text: localEvidenceLookup(text, scope),
            provider: "local-rules",
            model: "keyword-lookup-v1",
          },
    );
    setNotice(
      "Local keyword analysis. No API call, web search or LLM inference. Review every suggested tag against its exact quote before saving.",
    );
  }
  function save() {
    if (!answer?.suggestions || !selected.length) return;
    try {
      const codings = answer.suggestions
        .filter((_, i) => selected.includes(i))
        .map(({ quote: _quote, ...coding }) => coding);
      importRecords([
        {
          id: `RESEARCH-${crypto.randomUUID()}`,
          productId: product.id,
          sourceType,
          text,
          ...(sourceUrl.trim() ? { sourceUrl: sourceUrl.trim() } : {}),
          ...(sourceReference.trim() || answer.provider === "local-rules"
            ? {
                sourceReference:
                  `${sourceReference.trim()}${answer.provider === "local-rules" ? " | Local keyword suggestions explicitly selected by reviewer" : ""}`.slice(
                    0,
                    500,
                  ),
              }
            : {}),
          codings,
          ...(answer.tone ? { tone: answer.tone } : {}),
          codingStatus: answer.provider === "local-rules" ? "human-reviewed" : "ai-suggested",
          classification: "self-reported",
          origin: "collected",
        },
      ]);
      setAnswer(null);
      setText("");
      setSelected([]);
      setNotice(
        answer.provider === "local-rules"
          ? "Evidence saved with your selected rule-based tags. Metrics updated."
          : "Evidence added. Metrics updated. Tags remain labeled AI-suggested until separately reviewed.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save evidence.");
    }
  }
  return (
    <section
      className="rounded-xl border bg-paper p-5 sm:p-6 space-y-4"
      aria-labelledby="agent-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="agent-title" className="text-xl font-semibold flex items-center gap-2">
          <Sparkles size={20} />
          Research assistant
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {status?.configured
            ? `${status.provider} · ${status.model}`
            : statusError
              ? "Connection unavailable"
              : status
                ? "Key needed"
                : "Checking connection…"}
        </span>
      </div>
      {!status?.configured && (
        <p className="workspace-notice text-sm">
          Cloud AI is unavailable. Use local keyword analysis below, or configure OpenAI, Anthropic
          or Gemini on the server. Keys never go in this form.
        </p>
      )}
      <div className="source-tabs" role="group" aria-label="Research mode">
        {(
          [
            { value: "extract", label: "Tag a passage", icon: FileText },
            { value: "ask", label: "Ask your evidence", icon: MessageSquare },
            { value: "search", label: "Search the web", icon: Search },
          ] as const
        ).map((m) => (
          <button
            type="button"
            key={m.value}
            aria-pressed={mode === m.value}
            disabled={busy}
            onClick={() => {
              setMode(m.value);
              setAnswer(null);
              setNotice("");
            }}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {mode === "extract"
          ? "Paste a permitted customer passage or a quoted excerpt from a Velocity export. The configured model suggests need tags; you decide what enters the dataset."
          : mode === "ask"
            ? "Ask a question about your collected records. The assistant receives the first 40 eligible records, up to 3,000 characters each."
            : "Find current public sources with Google Search. Results are research leads, not verified customer records. Search may incur provider charges."}
      </p>
      {mode === "ask" && (
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeDemo}
              onChange={(e) => setIncludeDemo(e.target.checked)}
            />
            Include synthetic demo records
          </label>
          <strong>{scope.length} records will be sent</strong>
        </div>
      )}
      <label className="block text-sm font-semibold" htmlFor="research-input">
        {mode === "extract" ? "Original passage" : "Research question"}
      </label>
      <textarea
        id="research-input"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setAnswer(null);
        }}
        maxLength={12000}
        rows={4}
        className="w-full rounded-lg border bg-paper p-3 text-sm"
        placeholder={
          mode === "extract"
            ? "Paste original source text here…"
            : "What should we investigate next?"
        }
      />
      {mode === "extract" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Source URL (or reference below)
            <input
              type="url"
              placeholder="https://…"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border bg-paper p-2"
            />
          </label>
          <label className="text-sm">
            Source type
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className="mt-1 block w-full rounded-lg border bg-paper p-2"
            >
              {(["review", "qa", "discussion"] as const).map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {mode === "extract" && (
        <label className="block text-sm">
          Source reference, if no URL
          <input
            value={sourceReference}
            onChange={(e) => setSourceReference(e.target.value)}
            maxLength={500}
            placeholder="Interview date, participant ID, or export filename and section"
            className="mt-1 block w-full rounded-lg border bg-paper p-2"
          />
        </label>
      )}
      <p className="text-xs text-muted-foreground">
        Cloud analysis sends text to the configured provider. Local keyword analysis stays in this
        browser. Use permitted, non-sensitive research only. Nothing is automatically imported.
      </p>
      <Button
        disabled={
          busy || text.trim().length < 3 || !status?.configured || (mode === "ask" && !scope.length)
        }
        onClick={run}
      >
        {busy
          ? "Researching (up to 20 seconds)…"
          : mode === "extract"
            ? "Suggest need tags"
            : "Run research"}
      </Button>
      {mode !== "search" && (
        <Button
          variant="outline"
          disabled={busy || text.trim().length < 3 || (mode === "ask" && !scope.length)}
          onClick={runLocal}
        >
          {mode === "extract"
            ? "Analyze locally (no key needed)"
            : "Find matching evidence locally"}
        </Button>
      )}
      {notice && (
        <p role="status" className="workspace-notice text-sm">
          {notice}
        </p>
      )}
      {answer?.suggestions && (
        <div className="space-y-3">
          {answer.suggestions.length === 0 && (
            <p>No explicit customer needs found. Nothing to import.</p>
          )}
          {answer.suggestions.map((s, i) => (
            <label key={i} className="flex gap-3 rounded-lg border p-3 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(i)}
                onChange={(e) =>
                  setSelected(e.target.checked ? [...selected, i] : selected.filter((x) => x !== i))
                }
              />
              <span>
                <strong>
                  {s.desire}: {s.need}
                </strong>
                <span className="block my-2 border-l-2 pl-2">“{s.quote}”</span>
                <span className="text-muted-foreground">
                  Importance: {s.importance} · Status: {s.fulfillment}
                </span>
              </span>
            </label>
          ))}
          <Button
            disabled={!selected.length || (!sourceUrl.trim() && !sourceReference.trim())}
            onClick={save}
          >
            Add passage with {selected.length} selected tags
          </Button>
        </div>
      )}
      {answer?.text && (
        <div className="rounded-lg border p-4">
          <p className="text-xs font-semibold mb-3">
            {answer.provider === "local-rules" ? "LOCAL KEYWORD ANALYSIS" : "AI DRAFT"} ·{" "}
            {answer.model}
          </p>
          <div className="agent-output">{answer.text}</div>
          {mode === "search" && (
            <p className="text-xs mt-3">
              {answer.searched
                ? "Search sources returned. Verify relevant claims on the source pages."
                : "No search sources returned. Treat this as ungrounded and do not cite it as web evidence."}
            </p>
          )}
          <ul className="mt-3 space-y-2 text-sm">
            {answer.sources
              ?.filter((s) => s.url.startsWith("https://"))
              .map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}
