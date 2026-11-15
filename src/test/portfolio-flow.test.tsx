import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { PortfolioWorkspace } from "@/components/portfolio-workspace";
import { DemoStoreProvider } from "@/lib/demo-store";
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/research-charts", () => ({
  NeedsChart: () => <div>Needs chart</div>,
  SourceChart: () => <div>Source chart</div>,
  CoOccurrenceChart: () => <div>Co-occurrence chart</div>,
}));
vi.mock("@/components/research-agent", () => ({
  ResearchAgent: () => <div>Research assistant</div>,
}));
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { error: "MODEL_UNAVAILABLE: Configure an accessible model" },
          { status: 503 },
        ),
      ),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("keeps descriptions and the complete guided journey usable when AI fails", async () => {
  render(
    <DemoStoreProvider>
      <PortfolioWorkspace />
    </DemoStoreProvider>,
  );
  for (const name of [
    "Velocity AI",
    "Tariff Simulator",
    "Ingredient Compass",
    "Kearney Ignite",
    "PERLab Design-to-Value",
  ]) {
    fireEvent.click(screen.getByRole("button", { name: new RegExp("^" + name) }));
    expect(screen.getByRole("region", { name: "Product description" })).toHaveTextContent(name);
    expect(screen.getByRole("region", { name: "Product description" })).toHaveTextContent(
      "Demo seed description",
    );
  }
  fireEvent.click(screen.getByRole("button", { name: /^Next: analyze/ }));
  expect(screen.getAllByRole("tab")).toHaveLength(2);
  fireEvent.click(screen.getByRole("tab", { name: "Comment Analysis" }));
  expect(screen.getByText("No verified customer-feedback collection yet.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "Kearney Analysis" }));
  expect(screen.queryByText("Needs chart")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /^Next: product roadmap/ }));
  expect(
    screen.getByRole("heading", { name: "Product improvements supported by evidence" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /^Finish: export/ })).toBeEnabled();
  await waitFor(() => expect(fetch).toHaveBeenCalled());
});
