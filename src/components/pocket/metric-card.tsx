import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/labels";
import { TONE_SURFACE } from "./tone";

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  detail,
  tone = "orange",
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit: string;
  detail?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="stitched rounded-3xl border-2 bg-paper p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <span className={cn("grid size-9 place-items-center rounded-xl", TONE_SURFACE[tone])}>
          <Icon className="size-4.5" aria-hidden />
        </span>
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="mt-3 tabular">
        <span
          key={String(value)}
          className="inline-block animate-count-bump font-display text-4xl font-semibold leading-none"
        >
          {value}
        </span>
        <span className="ml-1.5 text-sm text-muted-foreground">{unit}</span>
      </p>
      {detail && <div className="mt-2 text-xs text-muted-foreground">{detail}</div>}
    </div>
  );
}
