import { z } from "zod";
import { codingSchema } from "./validation";
export const suggestionSchema = codingSchema.extend({ quote: z.string().min(3).max(2000) });
export const extractionSchema = z.object({ suggestions: z.array(suggestionSchema).max(10) });
export type Extraction = z.infer<typeof extractionSchema>;
export function validateExtraction(value: unknown, passage: string): Extraction {
  const result = extractionSchema.parse(value);
  if (result.suggestions.some((s) => !passage.includes(s.quote)))
    throw new Error("AI returned a quote not found in the supplied passage. Nothing was saved.");
  return result;
}
