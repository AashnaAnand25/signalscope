import { describe, it, expect } from "vitest";
import { validateComparison } from "@/lib/research-contract";
const inputs = [
  {
    name: "Product A",
    url: "https://example.com/a",
    text: "Fits a 16-inch laptop. Has padded straps.",
  },
  {
    name: "Product B",
    url: "https://example.com/b",
    text: "Compact shape. Fits a 14-inch laptop.",
  },
];
const report = () => ({
  rows: [
    {
      criterion: "Laptop compatibility",
      cells: [
        {
          name: "Product A",
          claim: "16-inch fit",
          quote: "Fits a 16-inch laptop",
          status: "supported",
        },
        {
          name: "Product B",
          claim: "14-inch fit",
          quote: "Fits a 14-inch laptop",
          status: "supported",
        },
      ],
    },
  ],
  nextTest: "Test the same laptop in both sleeves.",
});
describe("Competitor claim traceability", () => {
  it("accepts exact quotes from each product's own source", () =>
    expect(validateComparison(report(), inputs).rows).toHaveLength(1));
  it("rejects invented and cross-product quotations", () => {
    const r = report();
    r.rows[0]!.cells[1]!.quote = "Fits a 16-inch laptop";
    expect(() => validateComparison(r, inputs)).toThrow("outside its source");
  });
  it("rejects omitted and duplicated products", () => {
    const r = report();
    r.rows[0]!.cells[1]!.name = "Product A";
    expect(() => validateComparison(r, inputs)).toThrow("duplicated");
  });
  it("never turns missing evidence into a missing capability", () => {
    const r = report();
    r.rows[0]!.cells[1] = {
      name: "Product B",
      claim: "Cannot fit a laptop",
      quote: "invented",
      status: "not-found",
    };
    expect(validateComparison(r, inputs).rows[0]!.cells[1]!.claim).toBe(
      "Not found in captured evidence",
    );
  });
});
