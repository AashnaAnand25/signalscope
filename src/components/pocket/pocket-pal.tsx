import { cn } from "@/lib/utils";

interface PocketPalProps {
  className?: string;
  mood?: "happy" | "curious" | "celebrate";
  animated?: boolean;
  title?: string;
}

/** Pocket Pal — an original fabric-pocket mascot with an orange tab. */
export function PocketPal({ className, mood = "happy", animated = true, title }: PocketPalProps) {
  return (
    <svg
      viewBox="0 0 120 130"
      className={cn("h-16 w-16 overflow-visible", animated && "animate-pal-bob", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* shadow */}
      <ellipse cx="60" cy="124" rx="30" ry="4" className="fill-navy/15" />
      {/* orange tab */}
      <rect x="80" y="6" width="14" height="24" rx="3" transform="rotate(8 87 18)" className="fill-primary" />
      <circle cx="87" cy="12" r="2" transform="rotate(8 87 18)" className="fill-paper" />
      {/* body */}
      <path
        d="M14 22 Q14 18 18 18 H102 Q106 18 106 22 V88 Q106 92 102 94 L62 116 Q60 117 58 116 L18 94 Q14 92 14 88 Z"
        className="fill-butter stroke-navy"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* pocket opening band */}
      <path d="M16 34 H104" className="stroke-navy/50" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      {/* stitching */}
      <path
        d="M22 40 V86 L60 107 L98 86 V40"
        fill="none"
        className="stroke-primary"
        strokeWidth="2"
        strokeDasharray="5 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* cheeks */}
      <ellipse cx="36" cy="76" rx="7" ry="4.5" className="fill-primary/30" />
      <ellipse cx="84" cy="76" rx="7" ry="4.5" className="fill-primary/30" />
      {/* eyes */}
      <g className={cn(animated && "animate-pal-blink")}>
        {mood === "celebrate" ? (
          <>
            <path d="M38 66 Q45 56 52 66" className="stroke-navy" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M68 66 Q75 56 82 66" className="stroke-navy" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="45" cy="63" rx="6" ry={mood === "curious" ? 8.5 : 7.5} className="fill-navy" />
            <ellipse cx="75" cy="63" rx="6" ry={mood === "curious" ? 6.5 : 7.5} className="fill-navy" />
            <circle cx="47" cy="60" r="2" className="fill-paper" />
            <circle cx="77" cy="60" r="2" className="fill-paper" />
          </>
        )}
      </g>
      {/* mouth */}
      {mood === "curious" ? (
        <ellipse cx="60" cy="84" rx="4" ry="3.5" className="fill-navy" />
      ) : (
        <path
          d={mood === "celebrate" ? "M48 80 Q60 96 72 80 Z" : "M50 81 Q60 90 70 81"}
          className={cn("stroke-navy", mood === "celebrate" ? "fill-rust" : "fill-none")}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
