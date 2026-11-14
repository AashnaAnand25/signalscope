import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OpportunityNote, OpportunityDialog } from "@/components/pocket/opportunity";
import { DecisionStoryboard } from "@/components/pocket/decision-storyboard";
import { PageIntro } from "@/components/pocket/page-intro";
import { useDemo } from "@/lib/demo-store";
import { derivedOpportunities, rankOpportunities } from "@/lib/metrics";
import type { Opportunity } from "@/lib/types";
export const Route = createFileRoute("/opportunities")({
  validateSearch: (search: Record<string, unknown>): { open?: string } =>
    typeof search["open"] === "string" ? { open: search["open"] } : {},
  head: () => ({ meta: [{ title: "Opportunities · SignalScope" }] }),
  component: Opportunities,
});
function Opportunities() {
  const { product, records, bookmarks, opportunityStatus } = useDemo();
  const navigate = useNavigate();
  const { open } = Route.useSearch();
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [filter, setFilter] = useState("all");
  const allOpportunities = [...product.opportunities, ...derivedOpportunities(records)];
  const ranked = rankOpportunities(allOpportunities, records).filter(
    ({ o }) =>
      filter === "all" ||
      (filter === "saved" ? bookmarks.includes(o.id) : opportunityStatus(o.id) === filter),
  );
  return (
    <div className="space-y-7">
      <PageIntro
        eyebrow="Decision workspace"
        title="From evidence to experiments"
        description="Prioritize product hypotheses with supporting evidence, counterexamples, and a concrete next test."
      />
      <DecisionStoryboard />
      <div className="workspace-notice">
        These are research hypotheses, not proven revenue opportunities. Ranking uses
        supporting-record counts within this collection.
      </div>
      <label className="block text-sm">
        Research status
        <select
          className="ml-3 rounded-md border bg-white p-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All opportunities</option>
          <option value="saved">Bookmarked</option>
          <option value="investigate">Investigate</option>
          <option value="ready-to-test">Ready to test</option>
          <option value="tested">Tested</option>
        </select>
      </label>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ranked.map(({ o }, i) => (
          <OpportunityNote key={o.id} o={o} index={i} onOpen={() => setSelected(o)} />
        ))}
      </div>
      {ranked.length === 0 && (
        <p className="workspace-notice">No opportunities match this filter.</p>
      )}
      <OpportunityDialog
        o={selected ?? allOpportunities.find((o) => o.id === open) ?? null}
        onClose={() => {
          setSelected(null);
          if (open) void navigate({ to: "/opportunities", search: {}, replace: true });
        }}
      />
    </div>
  );
}
