import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ospreyCase } from "@/data/osprey-case";
import { campusBackpack } from "@/data/campus-backpack";
import { buildRecords, desireStats } from "@/lib/metrics";
import { buildJourney } from "@/lib/journey";
import { DemoStoreProvider, useDemo } from "@/lib/demo-store";
import { evidenceSchema } from "@/lib/validation";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
it("keeps a source ledger, product separation and traceable roadmap evidence", () => {
  const records = buildRecords(ospreyCase, []);
  expect(records).toHaveLength(23);
  expect(new Set(records.map((r) => r.id)).size).toBe(records.length);
  expect(new Set(records.map((r) => r.sourceUrl)).size).toBe(8);
  expect(
    records.every(
      (r) =>
        r.origin === "collected" &&
        r.productId === ospreyCase.id &&
        r.sourceUrl?.startsWith("https://") &&
        r.sourceReference,
    ),
  ).toBe(true);
  expect(evidenceSchema.array().safeParse(records).success).toBe(true);
  const ids = new Set(records.map((r) => r.id));
  for (const o of ospreyCase.opportunities)
    for (const id of [...o.supportingIds, ...o.contradictingIds]) expect(ids.has(id)).toBe(true);
  expect(records.some((r) => r.text.startsWith("Researcher summary:"))).toBe(true);
  expect(records.every((r) => r.codingStatus === "ai-suggested")).toBe(true);
  expect(desireStats(records, "convenience").mentions).toBe(13);
  expect(desireStats(records, "sustainability").mentions).toBe(0);
});
it("does not report survey coverage when no survey responses exist", () => {
  const { nodes } = buildJourney(ospreyCase.evidence, []);
  expect(nodes.find((n) => n.id === "unaware")!.measures).toEqual([]);
  expect(nodes.find((n) => n.id === "considering")!.measures.some((m) => m.count > 0)).toBe(true);
});
function SharedCase() {
  const d = useDemo();
  return (
    <>
      <button onClick={() => d.setProductId(ospreyCase.id)}>Public case</button>
      <button onClick={() => d.setProductId(campusBackpack.id)}>Synthetic case</button>
      <button
        onClick={() =>
          d.addResponse({
            id: "TEST-RESPONSE",
            productId: d.product.id,
            origin: "collected",
            submittedAt: "2026-11-15T12:00:00Z",
            awareness: "yes",
            experience: "considered",
            topDesire: "convenience",
            priceRange: d.product.survey.priceRanges[0]!.value,
          })
        }
      >
        Save participant response
      </button>
      <p data-testid="shared">
        {d.product.id}:{d.records.length}:{d.responses.length}:
        {desireStats(d.records, "convenience").mentions}
      </p>
    </>
  );
}
it("propagates collected survey data to the same product metrics without contaminating another product", async () => {
  localStorage.clear();
  render(
    <DemoStoreProvider>
      <SharedCase />
    </DemoStoreProvider>,
  );
  await waitFor(() =>
    expect(screen.getByTestId("shared")).toHaveTextContent(`${ospreyCase.id}:23:0:13`),
  );
  fireEvent.click(screen.getByText("Save participant response"));
  await waitFor(() =>
    expect(screen.getByTestId("shared")).toHaveTextContent(`${ospreyCase.id}:24:1:14`),
  );
  fireEvent.click(screen.getByText("Synthetic case"));
  expect(screen.getByTestId("shared").textContent).not.toContain(ospreyCase.id);
  fireEvent.click(screen.getByText("Public case"));
  expect(screen.getByTestId("shared")).toHaveTextContent(`${ospreyCase.id}:24:1:14`);
});
