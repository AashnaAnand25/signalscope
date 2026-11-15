import { z } from "zod";
import { codingSchema } from "./validation";
export const documentSchema = z.object({
  id: z.string(),
  url: z.string().url().startsWith("https://"),
  title: z.string(),
  platform: z.string(),
  text: z.string().max(18000),
  capturedAt: z.string(),
  subject: z.string().optional(),
  kind: z.enum(["provider-claim", "customer-feedback", "market-commentary", "search-lead"]),
  status: z.enum(["captured", "blocked", "search-only"]),
  note: z.string().optional(),
});
export type ResearchDocument = z.infer<typeof documentSchema>;
export const citedCellSchema = z.object({
  value: z.string().max(1000),
  documentIds: z.array(z.string()),
  quote: z.string().max(2000),
});
export const competitorSchema = z.object({
  name: z.string().min(1).max(120),
  url: z.string().url().startsWith("https://"),
  rationale: z.string().max(800),
  relation: z.enum(["direct", "adjacent", "service-alternative"]),
  sourceUrl: z.string().url().startsWith("https://"),
});
export const analysisSchema = z.object({
  comments: z
    .array(
      z.object({
        quote: z.string().min(5).max(2000),
        documentId: z.string(),
        kind: z.enum(["customer-feedback", "provider-claim", "market-commentary"]),
        tone: z.enum(["positive", "mixed", "negative"]),
        cluster: z.string().max(160),
        codings: z.array(codingSchema).max(10),
      }),
    )
    .max(25),
  roadmap: z
    .array(
      z.object({
        title: z.string().max(200),
        improvement: z.string().max(1000),
        hypothesis: z.string().max(1000),
        experiment: z.string().max(1200),
        documentIds: z.array(z.string()).min(1),
        quote: z.string().min(5).max(2000),
        basis: z.enum(["customer-feedback", "market-commentary", "provider-claim"]),
      }),
    )
    .max(8),
  matrix: z
    .array(
      z.object({
        product: z.string(),
        pricing: citedCellSchema,
        ai: citedCellSchema,
        timeToValue: citedCellSchema,
        sentiment: citedCellSchema,
      }),
    )
    .max(6),
});
export type PortfolioAnalysis = z.infer<typeof analysisSchema>;
export function validateAnalysis(
  raw: unknown,
  docs: ResearchDocument[],
  names: string[],
): PortfolioAnalysis {
  const parsed = analysisSchema.parse(raw);
  const byId = new Map(docs.map((d) => [d.id, d]));
  const check = (ids: string[], quote: string) => {
    if (ids.some((id) => !byId.has(id)))
      throw new Error("Analysis cited a document outside this run.");
    if (
      !ids.length ||
      !quote ||
      !ids.some((id) => byId.get(id)!.status === "captured" && byId.get(id)!.text.includes(quote))
    )
      throw new Error("Analysis quote was not found in captured text.");
  };
  for (const c of parsed.comments) {
    check([c.documentId], c.quote);
    if (c.kind === "customer-feedback" && byId.get(c.documentId)?.subject !== names[0])
      throw new Error(
        "Customer feedback cannot be attributed to an unidentified or competing product.",
      );
    if (c.kind === "customer-feedback" && byId.get(c.documentId)!.kind !== "customer-feedback")
      throw new Error("Provider claims or commentary cannot become customer feedback.");
  }
  for (const r of parsed.roadmap) {
    check(r.documentIds, r.quote);
    if (
      r.basis === "customer-feedback" &&
      !r.documentIds.some((id) => byId.get(id)?.kind === "customer-feedback")
    )
      throw new Error("Roadmap has no customer-feedback basis.");
  }
  const seen = new Set<string>();
  for (const row of parsed.matrix) {
    if (!names.includes(row.product) || seen.has(row.product))
      throw new Error("Analysis invented or duplicated a competitor.");
    seen.add(row.product);
    for (const key of ["pricing", "ai", "timeToValue", "sentiment"] as const) {
      const cell = row[key];
      if (!cell.documentIds.length) {
        cell.value = "Not established by captured sources";
        cell.quote = "";
      } else {
        check(cell.documentIds, cell.quote);
        if (cell.documentIds.some((id) => byId.get(id)?.subject !== row.product))
          throw new Error("Comparison cited another or unidentified product's source.");
        if (
          key === "sentiment" &&
          !cell.documentIds.some((id) => byId.get(id)?.kind === "customer-feedback")
        ) {
          cell.value = "No captured customer-feedback sample";
          cell.documentIds = [];
          cell.quote = "";
        }
      }
    }
  }
  return parsed;
}
