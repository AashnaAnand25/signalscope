import { createFileRoute } from "@tanstack/react-router";
import { PortfolioWorkspace } from "@/components/portfolio-workspace";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Voice-of-Customer Product Renewal | SignalScope" }] }),
  component: PortfolioWorkspace,
});
