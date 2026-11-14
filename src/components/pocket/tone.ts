import type { Tone } from "@/lib/labels";

/** Background / text classes per tone, used for stickers and chips. */
export const TONE_SURFACE: Record<Tone, string> = {
  orange: "bg-primary-soft text-rust",
  sage: "bg-sage text-sage-strong",
  lavender: "bg-lavender text-lavender-strong",
  butter: "bg-butter text-butter-strong",
  navy: "bg-navy text-navy-foreground",
  muted: "bg-muted text-muted-foreground",
};

export const TONE_BAR: Record<Tone, string> = {
  orange: "bg-primary",
  sage: "bg-sage-strong",
  lavender: "bg-lavender-strong",
  butter: "bg-butter-strong",
  navy: "bg-navy",
  muted: "bg-muted-foreground",
};
