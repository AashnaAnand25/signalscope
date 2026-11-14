import { cn } from "@/lib/utils";
interface Props {
  className?: string;
  mood?: "happy" | "curious" | "celebrate";
  animated?: boolean;
  title?: string;
}
/** Abstract evidence/signal mark, shared across the research workspace. */
export function PocketPal({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-12 w-12 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="64" height="64" rx="14" fill="#14283F" />
      <path
        d="M15 44V31M27 44V23M39 44V16"
        stroke="#42C2AE"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M47 38L52 43L58 31"
        stroke="#FFFFFF"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
