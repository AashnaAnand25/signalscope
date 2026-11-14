import { cn } from "@/lib/utils";
import { share, type Fraction } from "@/lib/metrics";
import type { Tone } from "@/lib/labels";
import { TONE_BAR } from "./tone";

interface Props {
  value: Fraction;
  label?: string;
  showBar?: boolean;
  tone?: Tone;
  className?: string;
  size?: "sm" | "md";
}

/** Every share shows numerator, denominator and unit. The % is secondary. */
export function FractionStat({
  value,
  label,
  showBar = true,
  tone = "orange",
  className,
  size = "md",
}: Props) {
  const s = share(value);
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn("tabular text-foreground", size === "md" ? "text-sm" : "text-xs")}>
          <span className="font-display text-base font-semibold">{value.numerator}</span>
          <span className="text-muted-foreground">
            {" "}
            / {value.denominator} {value.unit}
          </span>
          {label && <span className="text-foreground"> {label}</span>}
        </p>
        <span className="tabular shrink-0 text-xs text-muted-foreground">
          {s === null ? "No denominator" : `${Math.round(s * 100)}%`}
        </span>
      </div>
      {showBar && (
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={`${value.numerator} of ${value.denominator} ${value.unit}`}
        >
          <div
            className={cn("h-full rounded-full transition-all duration-500", TONE_BAR[tone])}
            style={{ width: `${s === null ? 0 : Math.max(s * 100, s > 0 ? 3 : 0)}%` }}
          />
        </div>
      )}
    </div>
  );
}
