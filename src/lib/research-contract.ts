import { z } from "zod";
import { codingSchema } from "./validation";
export const suggestionSchema = codingSchema.extend({ quote: z.string().min(3).max(2000) });
export const extractionSchema = z.object({
  tone: z.enum(["positive", "mixed", "negative"]).optional(),
  suggestions: z.array(suggestionSchema).max(10),
});
export type Extraction = z.infer<typeof extractionSchema>;
export function validateExtraction(value: unknown, passage: string): Extraction {
  const result = extractionSchema.parse(value);
  if (result.suggestions.some((s) => !passage.includes(s.quote)))
    throw new Error("AI returned a quote not found in the supplied passage. Nothing was saved.");
  return result;
}

export const competitorInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  url: z.string().url().startsWith("https://"),
  text: z.string().min(30).max(12000),
});
export type CompetitorInput = z.infer<typeof competitorInputSchema>;
export const comparisonSchema = z.object({
  rows: z
    .array(
      z.object({
        criterion: z.string().min(1).max(200),
        cells: z
          .array(
            z.object({
              name: z.string(),
              claim: z.string().max(600),
              quote: z.string().max(1500),
              status: z.enum(["supported", "not-found"]),
            }),
          )
          .min(2)
          .max(4),
      }),
    )
    .min(1)
    .max(6),
  nextTest: z.string().min(1).max(1200),
});
export type Comparison = z.infer<typeof comparisonSchema>;
export function validateComparison(value: unknown, inputs: CompetitorInput[]): Comparison {
  const result = comparisonSchema.parse(value);
  const names = new Map(inputs.map((i) => [i.name, i.text]));
  for (const row of result.rows) {
    if (
      row.cells.length !== names.size ||
      new Set(row.cells.map((c) => c.name)).size !== names.size
    )
      throw new Error(
        "Comparison omitted or duplicated a product. Retry with clear product names.",
      );
    for (const cell of row.cells) {
      if (!names.has(cell.name)) throw new Error("Comparison invented a product.");
      if (
        cell.status === "supported" &&
        (cell.quote.length < 3 || !names.get(cell.name)!.includes(cell.quote))
      )
        throw new Error("Comparison returned a quote outside its source. Nothing was saved.");
      if (cell.status === "not-found") {
        cell.claim = "Not found in captured evidence";
        cell.quote = "";
      }
    }
  }
  return result;
}
