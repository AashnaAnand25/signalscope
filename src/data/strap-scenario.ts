import type { EvidenceRecord } from "@/lib/types";

/** Fictional passages for the guided decision demo; never presented as market research. */
export const STRAP_SCENARIO: EvidenceRecord[] = [
  {
    id: "STORY-OWNER-01",
    productId: "campus-everyday-backpack",
    sourceType: "review",
    text: "The straps started pulling away after a month of carrying my laptop and textbooks. I like the pockets, but I can't trust this bag on a long walk.",
    date: "2026-11-01",
    journey: "use",
    journeyBasis: "stated",
    codings: [
      {
        desire: "quality",
        need: "Straps that support a heavy load",
        context: "Laptop and textbooks on a long walk",
        importance: "must-have",
        fulfillment: "unmet",
      },
    ],
    barrier: "Strap attachment failed under a heavy load",
    classification: "self-reported",
    codingStatus: "pre-coded-demo",
    origin: "synthetic-seed",
    tone: "negative",
  },
  {
    id: "STORY-NONBUYER-02",
    productId: "campus-everyday-backpack",
    sourceType: "discussion",
    text: "I carry a heavy laptop every day. I considered this bag, but I couldn't find a load rating or any detail about the strap stitching, so I chose another one.",
    date: "2026-11-03",
    journey: "consideration",
    journeyBasis: "stated",
    codings: [
      {
        desire: "quality",
        need: "Straps that support a heavy load",
        context: "Daily heavy laptop carry",
        importance: "must-have",
        fulfillment: "unknown",
      },
    ],
    barrier: "No load rating or strap-construction detail",
    classification: "self-reported",
    codingStatus: "pre-coded-demo",
    origin: "synthetic-seed",
  },
  {
    id: "STORY-LIGHT-03",
    productId: "campus-everyday-backpack",
    sourceType: "review",
    text: "I carry only a tablet and a notebook. The light straps are comfortable for me; I would not want extra padding or a heavier bag.",
    date: "2026-11-05",
    journey: "use",
    journeyBasis: "stated",
    codings: [
      {
        desire: "convenience",
        need: "A lightweight bag for a small daily load",
        context: "Tablet and notebook",
        importance: "preference",
        fulfillment: "met",
        tradeoff: "Would not accept extra weight for more padding",
      },
    ],
    classification: "self-reported",
    codingStatus: "pre-coded-demo",
    origin: "synthetic-seed",
    tone: "positive",
  },
];
