import { ExternalLink, PencilLine, Wrench, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CLASS_META,
  CODING_LABEL,
  DESIRE_META,
  FULFILLMENT_META,
  JOURNEY_LABEL,
  SOURCE_LABEL,
  formatDate,
} from "@/lib/labels";
import type { EvidenceRecord } from "@/lib/types";
import { useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

interface Props {
  record: EvidenceRecord;
  onEditTags?: (r: EvidenceRecord) => void;
  compact?: boolean;
  highlight?: string;
  className?: string;
  index?: number;
}

export function EvidenceCard({ record, onEditTags, compact, highlight, className, index = 0 }: Props) {
  const { product } = useDemo();
  const cls = CLASS_META[record.classification];
  const desires = Array.from(new Set(record.codings.map((c) => c.desire)));
  return (
    <article
      className={cn(
        "animate-card-reveal relative rounded-2xl border-2 bg-paper p-4 shadow-soft sm:p-5",
        record.origin === "collected" && "border-primary/40",
        className,
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      aria-label={`Evidence ${record.id}`}
    >
      <header className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-mono font-semibold text-foreground">{record.id}</span>
        <span className="text-muted-foreground">· {product.shortName}</span>
        <Badge variant="navy" className="ml-auto">{SOURCE_LABEL[record.sourceType]}</Badge>
        {record.origin === "collected" ? (
          <Badge variant="orange">Collected here</Badge>
        ) : (
          <Badge variant="muted">Synthetic seed</Badge>
        )}
      </header>

      <blockquote className="mt-3 border-l-4 border-primary/50 pl-3 text-[15px] leading-relaxed text-foreground">
        {highlight ? <Highlighted text={record.text} q={highlight} /> : record.text}
      </blockquote>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {desires.map((d) => (
          <Badge key={d} variant={DESIRE_META[d].tone}>
            {DESIRE_META[d].label}
          </Badge>
        ))}
        {!desires.length && <Badge variant="muted">No desire tags</Badge>}
      </div>

      {!compact && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {record.codings.map((c, i) => (
            <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
              <span className="font-medium text-foreground">{c.need}</span>
              {c.target && <span>· target: {c.target}</span>}
              <Badge variant={FULFILLMENT_META[c.fulfillment].tone}>{FULFILLMENT_META[c.fulfillment].label}</Badge>
              {c.importance === "must-have" && <Badge variant="outline">Must-have</Badge>}
              {c.dealbreaker && <Badge variant="orange">Stated dealbreaker</Badge>}
              {c.tradeoff && <span className="w-full text-xs">Trade-off: {c.tradeoff}</span>}
            </li>
          ))}
        </ul>
      )}

      {(record.barrier || record.workaround) && (
        <div className="mt-3 space-y-1 text-sm">
          {record.barrier && (
            <p className="flex items-start gap-1.5 text-rust">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> <span><span className="font-semibold">Barrier:</span> {record.barrier}</span>
            </p>
          )}
          {record.workaround && (
            <p className="flex items-start gap-1.5 text-sage-strong">
              <Wrench className="mt-0.5 size-4 shrink-0" aria-hidden /> <span><span className="font-semibold">Workaround:</span> {record.workaround}</span>
            </p>
          )}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t-2 border-dashed border-border pt-3 text-xs text-muted-foreground">
        <span>{formatDate(record.date)}</span>
        <span>
          {record.journey ? `${JOURNEY_LABEL[record.journey]}${record.journeyBasis === "inferred" ? " (inferred)" : ""}` : "Journey context unknown"}
        </span>
        <Badge variant={cls.tone}>{cls.label}</Badge>
        <span className={cn(record.codingStatus === "human-reviewed" && "font-semibold text-sage-strong")}>
          {CODING_LABEL[record.codingStatus]}
        </span>
        {record.sourceType === "qa" && <span>{record.answered ? "Answered in thread" : "Unanswered"}</span>}
        {record.sourceUrl ? (
          <a href={record.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
            Source <ExternalLink className="size-3" />
          </a>
        ) : (
          <span>No source URL (synthetic)</span>
        )}
        {onEditTags && (
          <Button size="sm" variant="ghost" className="ml-auto h-7 px-2.5" onClick={() => onEditTags(record)}>
            <PencilLine /> Review tags
          </Button>
        )}
      </footer>
    </article>
  );
}

function Highlighted({ text, q }: { text: string; q: string }) {
  const term = q.trim();
  if (!term) return <>{text}</>;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="rounded bg-butter px-0.5 text-foreground">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
