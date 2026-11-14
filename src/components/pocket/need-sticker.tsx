import { Badge } from "@/components/ui/badge";
import { DESIRE_META, SOURCE_LABEL } from "@/lib/labels";
import type { DesireStats } from "@/lib/metrics";
import { SOURCE_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DESIRE_ICON } from "./desire-icon";
import { TONE_BAR, TONE_SURFACE } from "./tone";

const TILTS = ["-rotate-1", "rotate-1", "-rotate-[0.5deg]", "rotate-[1.5deg]", "rotate-0"];

interface Props {
  stats: DesireStats;
  hint?: string;
  index: number;
  selected?: boolean;
  dimmed?: boolean;
  onOpen: () => void;
}

export function NeedSticker({ stats, hint, index, selected, dimmed, onOpen }: Props) {
  const meta = DESIRE_META[stats.desire];
  const Icon = DESIRE_ICON[stats.desire];
  const sources = SOURCE_TYPES.filter((s) => stats.bySource[s] > 0);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={cn(
        "stitched group relative flex h-full flex-col rounded-3xl border-2 bg-paper p-5 text-left shadow-sticker transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-lift",
        TILTS[index % TILTS.length],
        selected && "border-primary ring-4 ring-primary/20",
        dimmed && "opacity-55 hover:opacity-100",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("grid size-12 place-items-center rounded-2xl", TONE_SURFACE[meta.tone])}>
          <Icon className="size-6" aria-hidden />
        </span>
        <span className="tabular text-right">
          <span className="block font-display text-3xl font-semibold leading-none">{stats.mentions}</span>
          <span className="text-[11px] text-muted-foreground">of {stats.total} records</span>
        </span>
      </div>
      <h3 className="mt-3 text-xl font-semibold">{meta.label}</h3>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs tabular">
        <div className="rounded-xl bg-muted/70 px-2.5 py-1.5">
          <dt className="text-muted-foreground">Must-have</dt>
          <dd className="font-semibold">{stats.mustHave} / {stats.mentions}</dd>
        </div>
        <div className="rounded-xl bg-muted/70 px-2.5 py-1.5">
          <dt className="text-muted-foreground">Reported unmet</dt>
          <dd className="font-semibold">{stats.unmet} / {stats.mentions}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-3">
        {stats.mentions ? (
          <>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
              {sources.map((s, i) => (
                <div
                  key={s}
                  className={cn(TONE_BAR[(["navy", "orange", "lavender", "sage", "butter"] as const)[i % 5]])}
                  style={{ width: `${(stats.bySource[s] / stats.mentions) * 100}%` }}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {sources.map((s) => `${SOURCE_LABEL[s]} ${stats.bySource[s]}`).join(" · ")}
            </p>
          </>
        ) : (
          <Badge variant="muted">No mentions — unknown, not unimportant</Badge>
        )}
      </div>
    </button>
  );
}
