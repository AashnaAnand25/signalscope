import { ospreyCase } from "./osprey-case";
import type { ProductConfig, SurveyResponse } from "@/lib/types";
import { KEARNEY_PRODUCTS } from "./kearney-products";
import { campusBackpack, seededSurveyResponses } from "./campus-backpack";

/** Product registry. Add another ProductConfig here to swap the demo object. */
export const PRODUCTS: ProductConfig[] = [ospreyCase, ...KEARNEY_PRODUCTS, campusBackpack];

export const SEEDED_SURVEY_RESPONSES: SurveyResponse[] = seededSurveyResponses;

export function getProduct(id: string | undefined): ProductConfig {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0]!;
}
