import { describe, expect, it } from "bun:test";
import { createHandler, openStore } from "./store";

const token = "a".repeat(40);
const product = {
  id: "bag-v2-us",
  name: "Bag",
  category: "Backpacks",
  variant: "Laptop",
  version: "2",
  region: "US",
};
const evidence = (id: string, text: string) => ({
  id,
  productId: product.id,
  sourceType: "review",
  text,
  sourceReference: `ticket-${id}`,
});

describe("company workflow", () => {
  it("isolates reviewer data and persists a decision with traceable counterevidence", async () => {
    const db = openStore(":memory:");
    const handle = createHandler(db, token, ["http://localhost:8081"]);
    const call = (path: string, method = "GET", body?: unknown, authorized = true) =>
      handle(
        new Request(`http://localhost:8090${path}`, {
          method,
          headers: {
            ...(authorized ? { Authorization: `Bearer ${token}` } : {}),
            ...(body ? { "Content-Type": "application/json" } : {}),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
      );
    expect((await call("/api/products", "GET", undefined, false)).status).toBe(401);
    expect((await call("/api/products", "POST", product)).status).toBe(201);
    expect((await call("/api/products", "POST", product)).status).toBe(409);
    const batch = [
      evidence("a", "The straps broke under load."),
      evidence("b", "I prefer lighter straps."),
    ];
    expect((await call("/api/evidence", "POST", batch)).status).toBe(201);
    expect(
      (
        await call("/api/evidence", "POST", [
          evidence("c", "No source"),
          evidence("a", "Duplicate"),
        ])
      ).status,
    ).toBe(409);
    expect(await (await call("/api/evidence?productId=bag-v2-us")).json()).toHaveLength(2);
    expect(
      (
        await call("/api/evidence/a", "PATCH", {
          status: "reviewed",
          need: "Durability",
          quote: "invented",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await call("/api/evidence/a", "PATCH", {
          status: "reviewed",
          need: "Durability",
          quote: "straps broke",
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await call("/api/evidence/b", "PATCH", {
          status: "reviewed",
          need: "Low weight",
          quote: "lighter straps",
        })
      ).status,
    ).toBe(200);
    const decision = {
      id: "d1",
      productId: product.id,
      title: "Stronger straps",
      hypothesis: "Fewer failures",
      options: ["Current", "Reinforced"],
      supportingIds: ["a"],
      contradictingIds: ["b"],
      owner: "PM",
      successMetric: "Failure rate",
      guardrail: "Weight",
      reversal: "No decrease in failure",
    };
    expect((await call("/api/decisions", "POST", decision)).status).toBe(201);
    expect(await (await call("/api/decisions?productId=bag-v2-us")).json()).toHaveLength(1);
    expect(
      (
        await call("/api/decisions", "POST", {
          ...decision,
          id: "bad",
          options: ["Current", "Current"],
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await call("/api/outcomes", "POST", {
          id: "wrong-arm",
          decisionId: "d1",
          arm: "Unknown",
          period: "2026-11",
          visitors: 100,
          orders: 10,
          revenue: 1000,
          cost: 400,
          returns: 1,
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await call("/api/outcomes", "POST", {
          id: "o1",
          decisionId: "d1",
          arm: "Current",
          period: "2026-11",
          visitors: 100,
          orders: 10,
          revenue: 1000,
          cost: 400,
          returns: 1,
        })
      ).status,
    ).toBe(201);
    expect(await (await call("/api/outcomes?decisionId=d1")).json()).toHaveLength(1);
    expect(
      (
        await call("/api/outcomes", "POST", {
          id: "o2",
          decisionId: "d1",
          arm: "Current",
          period: "2026-11",
          visitors: 100,
          orders: 10,
          revenue: 1000,
          cost: 400,
          returns: 1,
        })
      ).status,
    ).toBe(409);
    expect(
      (
        await call(
          "/api/surveys",
          "POST",
          {
            id: "s1",
            productId: product.id,
            awareness: "no",
            experience: "not-interested",
            need: "Lower weight",
          },
          false,
        )
      ).status,
    ).toBe(201);
    expect(
      (
        await call(
          "/api/surveys",
          "POST",
          {
            id: "s1",
            productId: product.id,
            awareness: "no",
            experience: "not-interested",
            need: "Lower weight",
          },
          false,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await call(
          "/api/surveys",
          "POST",
          { id: "s1", productId: product.id, awareness: "yes", experience: "purchased" },
          false,
        )
      ).status,
    ).toBe(409);
    expect((await call("/api/surveys?productId=bag-v2-us", "GET", undefined, false)).status).toBe(
      401,
    );
    expect(await (await call("/api/surveys?productId=bag-v2-us")).json()).toHaveLength(1);
    expect(
      (
        await handle(
          new Request("http://localhost:8090/api/products", {
            headers: { Origin: "https://untrusted.example", Authorization: `Bearer ${token}` },
          }),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await handle(
          new Request("http://localhost:8090/api/evidence", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: "x".repeat(2_000_001),
          }),
        )
      ).status,
    ).toBe(413);
    db.close();
  });
});
