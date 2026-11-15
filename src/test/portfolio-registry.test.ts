import { describe, expect, it } from "vitest";
import { PRODUCTS, getProduct } from "@/data/products";
import { KEARNEY_CATALOG } from "@/data/kearney-products";
import { buildRecords } from "@/lib/metrics";
describe("Shared portfolio data architecture", () => {
  it("registers every verified Kearney offering and retains the separate backpack demo", () => {
    for (const p of KEARNEY_CATALOG) expect(getProduct(p.id).id).toBe(p.id);
    expect(PRODUCTS.some((p) => p.id === "campus-everyday-backpack")).toBe(true);
  });
  it("does not fabricate Kearney reviews or survey responses", () => {
    for (const p of PRODUCTS.filter((p) => p.id !== "campus-everyday-backpack")) {
      expect(p.evidence).toEqual([]);
      expect(buildRecords(p, [], {}, [])).toEqual([]);
    }
  });
});
