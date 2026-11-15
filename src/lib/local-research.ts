import type { Extraction } from "./research-contract";
import type { DesireId } from "./types";
const rules: [DesireId, RegExp, string][] = [
  [
    "features",
    /\b(pocket|compartment|strap|battery|export|feature|dashboard|report)\w*/i,
    "Requested feature",
  ],
  ["price", /\b(price|cost|budget|afford|expensive)\w*|\$\s*\d/i, "Price or budget requirement"],
  [
    "quality",
    /\b(quality|durable|padding|padded|material|fabric|stitch)\w*/i,
    "Material or build quality",
  ],
  ["speed", /\b(fast|slow|latency|load|waiting|speed|performance)\w*/i, "Speed or responsiveness"],
  [
    "convenience",
    /\b(easy|simple|setup|onboard|effort|convenien|confusing|difficult)\w*/i,
    "Ease of use",
  ],
  [
    "reliability",
    /\b(waterproof|reliab|crash|break|bug|fail|rain)\w*/i,
    "Reliable operation or protection",
  ],
  [
    "appearance",
    /\b(look|style|design|color|colour|aesthetic|appearance)\w*/i,
    "Appearance preference",
  ],
  [
    "sustainability",
    /\b(sustainab|recycl|carbon|repair|environment)\w*/i,
    "Environmental or repair requirement",
  ],
  ["compatibility", /\b(compatib|integrat|connect|laptop|fit|API)\w*/i, "Fit or compatibility"],
  ["customization", /\b(custom|personali|adjust|configur)\w*/i, "Customization preference"],
];
const desire =
  /\b(need|want|wish|prefer|must|should|missing|cannot|can't|doesn't|does not|too|fails|hard|expensive|unreliable|difficult|would)\b/i;
/** Browser-local keyword suggestions, never a model answer or a stress/sentiment score. */
export function localExtraction(text: string): Extraction {
  const sentences = text.match(/[^.!?]+(?:[.!?]|$)/g) || [text];
  return {
    suggestions: rules.flatMap(([category, pattern, need]) => {
      const sentence = sentences.find((s) => desire.test(s) && pattern.test(s))?.trim();
      return sentence
        ? [
            {
              desire: category,
              need,
              quote: sentence.slice(0, 2000),
              importance: "unknown" as const,
              fulfillment: "unknown" as const,
            },
          ]
        : [];
    }),
  };
}
export function localEvidenceLookup(question: string, records: { id: string; text: string }[]) {
  const stop = new Set([
    "what",
    "which",
    "where",
    "when",
    "does",
    "have",
    "with",
    "that",
    "this",
    "about",
    "would",
    "should",
    "could",
    "please",
    "customers",
    "customer",
    "their",
    "they",
    "evidence",
    "records",
    "need",
    "needs",
  ]);
  const words = [
    ...new Set((question.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter((w) => !stop.has(w))),
  ];
  const hits = records.filter((r) => words.some((w) => r.text.toLowerCase().includes(w)));
  return `Local keyword lookup, not an LLM answer.\nMatched ${hits.length} of ${records.length} supplied records. These are records, not distinct customers.\n\n${
    hits
      .slice(0, 8)
      .map((r) => `[${r.id}] ${r.text.slice(0, 600)}`)
      .join("\n\n") ||
    "No matching evidence found. Try a specific term such as price, waterproof, export or compatibility."
  }\n\nNext step: review the original passages and collect direct feedback on any unresolved need. No web search or causal inference was performed.`;
}
