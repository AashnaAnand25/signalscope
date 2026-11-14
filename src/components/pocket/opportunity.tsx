import { Bookmark, BookmarkCheck, FlaskConical, HelpCircle, Lightbulb, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo-store";
import { DESIRE_META, STATUS_META } from "@/lib/labels";
import { opportunityEvidence } from "@/lib/metrics";
import type { Opportunity, OpportunityStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EvidenceCard } from "./evidence-card";

const TILT = ["-rotate-1", "rotate-1", "rotate-[-1.5deg]", "rotate-[0.5deg]", "rotate-[1.5deg]"];
const PAPER = ["bg-paper", "bg-butter/60", "bg-sage/50", "bg-lavender/50", "bg-primary-soft/50"];
const PIN = ["bg-primary", "bg-navy", "bg-sage-strong", "bg-lavender-strong", "bg-rust"];

export function OpportunityNote({ o, index, onOpen }: { o: Opportunity; index: number; onOpen: () => void }) {
  const { records, opportunityStatus, bookmarks, toggleBookmark } = useDemo();
  const ev = opportunityEvidence(o, records);
  const status = opportunityStatus(o.id);
  const saved = bookmarks.includes(o.id);
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-md p-5 pt-7 shadow-pin transition duration-300 hover:rotate-0 hover:-translate-y-1",
        TILT[index % TILT.length],
        PAPER[index % PAPER.length],
      )}
    >
      <span className={cn("absolute left-1/2 top-2 size-4 -translate-x-1/2 rounded-full border-2 border-paper shadow-sticker", PIN[index % PIN.length])} aria-hidden />
      <div className="flex items-center gap-2">
        <Badge variant={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>
        {saved && <Badge variant="navy"><BookmarkCheck /> Bookmarked</Badge>}
      </div>
      <h3 className="mt-3 text-xl font-semibold leading-snug">{o.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{o.improvement}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs tabular">
        <div className="rounded-lg bg-paper/80 px-1 py-2">
          <dt className="text-muted-foreground">Supporting</dt>
          <dd className="font-display text-lg font-semibold">{ev.supporting.length}</dd>
        </div>
        <div className="rounded-lg bg-paper/80 px-1 py-2">
          <dt className="text-muted-foreground">Contradicting</dt>
          <dd className="font-display text-lg font-semibold">{ev.contradicting.length}</dd>
        </div>
        <div className="rounded-lg bg-paper/80 px-1 py-2">
          <dt className="text-muted-foreground">Gaps</dt>
          <dd className="font-display text-lg font-semibold">{o.missing.length}</dd>
        </div>
      </dl>
      <p className="mt-1 text-[11px] text-muted-foreground">Counts are collected passages, not people.</p>
      <div className="mt-auto flex items-center gap-2 pt-4">
        <Button size="sm" onClick={onOpen}>
          Open note
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            toggleBookmark(o.id);
            toast(saved ? "Removed bookmark" : "Bookmarked");
          }}
          aria-pressed={saved}
          aria-label={saved ? `Remove bookmark from ${o.title}` : `Bookmark ${o.title}`}
        >
          {saved ? <BookmarkCheck /> : <Bookmark />} {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </article>
  );
}

export function OpportunityDialog({ o, onClose }: { o: Opportunity | null; onClose: () => void }) {
  const { records, opportunityStatus, setOpportunityStatus, bookmarks, toggleBookmark, markTrail } = useDemo();
  useEffect(() => {
    if (o) markTrail("opportunity");
  }, [o, markTrail]);
  if (!o) return null;
  const ev = opportunityEvidence(o, records);
  const status = opportunityStatus(o.id);
  const saved = bookmarks.includes(o.id);

  return (
    <Dialog open={!!o} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-3xl">
        <DialogHeader className="text-left">
          <div className="flex flex-wrap gap-1.5">
            {o.desires.map((d) => (
              <Badge key={d} variant={DESIRE_META[d].tone}>{DESIRE_META[d].label}</Badge>
            ))}
          </div>
          <DialogTitle className="pt-1 font-display text-3xl leading-tight">{o.title}</DialogTitle>
          <DialogDescription className="text-base">{o.improvement}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <fieldset className="rounded-2xl border-2 bg-muted/40 p-4">
            <legend className="px-1 text-sm font-semibold">Research status</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Research status">
              {(Object.keys(STATUS_META) as OpportunityStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={status === s}
                  onClick={() => {
                    setOpportunityStatus(o.id, s);
                    toast(`Status: ${STATUS_META[s].label}`);
                  }}
                  className={cn(
                    "rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition",
                    status === s ? "border-navy bg-navy text-navy-foreground" : "border-border bg-paper hover:border-primary",
                  )}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => toggleBookmark(o.id)}
                aria-pressed={saved}
              >
                {saved ? <BookmarkCheck /> : <Bookmark />} {saved ? "Bookmarked" : "Bookmark"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Changing the status never changes the underlying evidence.</p>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-butter/70 p-4">
              <p className="flex items-center gap-2 text-sm font-bold"><Lightbulb className="size-4" /> Hypothesis</p>
              <p className="mt-1.5">{o.hypothesis}</p>
            </div>
            <div className="rounded-2xl bg-sage/70 p-4">
              <p className="flex items-center gap-2 text-sm font-bold"><FlaskConical className="size-4" /> Next observation or experiment</p>
              <p className="mt-1.5">{o.experiment}</p>
            </div>
          </div>

          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold"><ThumbsUp className="size-4 text-sage-strong" /> Supporting evidence · {ev.supporting.length} passages</h3>
            {ev.survey && (
              <p className="mt-1 text-sm text-muted-foreground tabular">
                Also: {ev.survey.numerator} / {ev.survey.denominator} survey respondents picked {DESIRE_META[o.surveySupportDesire!].label.toLowerCase()} as what matters most (voluntary sample).
              </p>
            )}
            <div className="mt-3 grid gap-3">
              {ev.supporting.map((r, i) => <EvidenceCard key={r.id} record={r} compact index={i} />)}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold"><ThumbsDown className="size-4 text-rust" /> Contradicting evidence · {ev.contradicting.length} passages</h3>
            {ev.contradicting.length ? (
              <div className="mt-3 grid gap-3">
                {ev.contradicting.map((r, i) => <EvidenceCard key={r.id} record={r} compact index={i} />)}
              </div>
            ) : (
              <p className="mt-2 rounded-xl border-2 border-dashed px-3 py-2 text-sm text-muted-foreground">
                No contradicting passages in the collection — that is not proof there are none.
              </p>
            )}
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold"><HelpCircle className="size-4 text-lavender-strong" /> Missing information</h3>
            <ul className="mt-2 space-y-1.5">
              {o.missing.map((m) => (
                <li key={m} className="rounded-xl border-2 border-dashed border-lavender-strong/30 bg-lavender/30 px-3 py-2 text-sm">{m}</li>
              ))}
            </ul>
          </section>

          <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
            No sales, conversion or revenue effect is claimed. Those would need a corresponding study.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
