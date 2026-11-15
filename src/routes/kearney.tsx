import { createFileRoute } from "@tanstack/react-router";
import { PortfolioWorkspace } from "@/components/portfolio-workspace";
export const Route = createFileRoute("/kearney")({
  head: () => ({ meta: [{ title: "Kearney Product & Portfolio Analysis | SignalScope" }] }),
  component: PortfolioWorkspace,
});
