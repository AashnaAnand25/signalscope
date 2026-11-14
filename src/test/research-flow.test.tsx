import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DemoStoreProvider, useDemo } from "@/lib/demo-store";
import { ResearchAgent } from "@/components/research-agent";
function Counts() {
  const { records } = useDemo();
  return (
    <p data-testid="collected-count">{records.filter((r) => r.origin === "collected").length}</p>
  );
}
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("requires selection before importing original text and AI suggestions into metrics", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ configured: true, provider: "gemini", model: "test-model" }),
    )
    .mockResolvedValueOnce(
      Response.json({
        suggestions: [
          {
            desire: "reliability",
            need: "Keep contents dry",
            quote: "waterproof",
            importance: "unknown",
            fulfillment: "unknown",
          },
        ],
      }),
    );
  vi.stubGlobal("fetch", fetchMock);
  render(
    <DemoStoreProvider>
      <ResearchAgent />
      <Counts />
    </DemoStoreProvider>,
  );
  await waitFor(() => expect(screen.getByText("gemini · test-model")).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText("Original passage"), {
    target: { value: "I need a waterproof bag." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Suggest need tags" }));
  await waitFor(() =>
    expect(screen.getByText("reliability: Keep contents dry")).toBeInTheDocument(),
  );
  expect(screen.getByTestId("collected-count")).toHaveTextContent("0");
  expect(screen.getByRole("button", { name: "Add passage with 0 selected tags" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Source URL (or reference below)"), {
    target: { value: "https://example.com/research/test-passage" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Add passage with 1 selected tags" }));
  await waitFor(() => expect(screen.getByTestId("collected-count")).toHaveTextContent("1"));
  expect(localStorage.getItem("the-missing-pocket:v1")).toContain("ai-suggested");
  expect(localStorage.getItem("the-missing-pocket:v1")).toContain("I need a waterproof bag.");
});
it("excludes synthetic records from evidence questions unless explicitly enabled", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ configured: true, provider: "gemini", model: "test-model" }),
      ),
  );
  render(
    <DemoStoreProvider>
      <ResearchAgent />
    </DemoStoreProvider>,
  );
  await waitFor(() => expect(screen.getByText("gemini · test-model")).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "Ask your evidence" }));
  fireEvent.change(screen.getByLabelText("Research question"), {
    target: { value: "What is missing?" },
  });
  expect(screen.getByText("0 records will be sent")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Run research" })).toBeDisabled();
  fireEvent.click(screen.getByLabelText("Include synthetic demo records"));
  expect(screen.getByText("32 records will be sent")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Run research" })).toBeEnabled();
});
