import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { DESIRE_META } from "@/lib/labels";
import type { HotspotId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BackpackExplorer() {
  const { product, markTrail } = useDemo();
  const navigate = useNavigate();
  const [active, setActive] = useState<HotspotId | null>(null);

  const open = (id: HotspotId) => {
    markTrail("explore");
    navigate({ to: "/desires", search: { area: id } });
  };

  return (
    <div className="grid gap-5">
      <div className="relative mx-auto w-full max-w-[460px]">
        <img
          src={product.image.src}
          alt={product.image.alt}
          width={product.image.width}
          height={product.image.height}
          className="h-auto w-full select-none"
          draggable={false}
        />
        {product.hotspots.map((h, i) => {
          const isActive = active === h.id;
          return (
            <div key={h.id} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
              <button
                type="button"
                onClick={() => open(h.id)}
                onMouseEnter={() => setActive(h.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(h.id)}
                onBlur={() => setActive(null)}
                aria-label={`${h.label}: ${h.description}. Open insights`}
                className="group relative -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-offset-4"
              >
                <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse-ring" aria-hidden />
                <span className="relative grid size-9 place-items-center rounded-full border-[3px] border-paper bg-navy font-display text-sm font-semibold text-navy-foreground shadow-sticker transition group-hover:scale-110 group-hover:bg-primary">
                  {i + 1}
                </span>
              </button>
              {isActive && (
                <div
                  className={cn(
                    "pointer-events-none absolute top-6 z-10 w-48 animate-pocket-open rounded-2xl border-2 border-dashed border-stitch bg-paper p-3 shadow-lift",
                    h.x > 55 ? "right-0" : "left-0",
                  )}
                  role="presentation"
                >
                  <p className="font-display font-semibold">{h.label}</p>
                  <p className="text-xs text-muted-foreground">{h.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2" aria-label="Product areas">
        {product.hotspots.map((h, i) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => open(h.id)}
              onMouseEnter={() => setActive(h.id)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl border-2 bg-paper px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-soft",
                active === h.id && "border-primary",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy font-display text-xs font-semibold text-navy-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{h.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {h.desires.map((d) => DESIRE_META[d].label).join(" · ")}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
