import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, FlaskConical, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvidenceCard } from "@/components/pocket/evidence-card";
import { STRAP_SCENARIO } from "@/data/strap-scenario";
import { useDemo } from "@/lib/demo-store";

const scenes = [
  "Evidence arrives",
  "Need emerges",
  "Trade-off appears",
  "Change is proposed",
  "Decision is tested",
] as const;
const options = [
  {
    id: "reinforce",
    name: "Reinforce the straps",
    action: "Prototype stronger strap attachments for heavy-load users.",
    tradeoff: "May increase weight and production cost.",
    metric:
      "Confirmed strap failures per 100 bags after a defined use period, plus choice share among heavy-load participants.",
    reversal:
      "The revision does not reduce failures, or the added weight causes the target group to prefer the original.",
  },
  {
    id: "specs",
    name: "Publish load specifications",
    action: "Show a tested load rating and clear photos of the strap construction.",
    tradeoff: "Clarifies expectations but cannot repair a weak strap.",
    metric: "Correct load-fit judgments and choice share after viewing the revised product page.",
    reversal:
      "Participants still cannot judge fit correctly, or the accurate rating rules out the intended use.",
  },
  {
    id: "warranty",
    name: "Test a strap warranty",
    action: "Show a clear repair or replacement promise for strap failures.",
    tradeoff: "Could increase service cost while leaving the underlying failure untouched.",
    metric:
      "Choice share and trust after viewing the warranty, followed by actual claims per 100 sold bags.",
    reversal:
      "Choice does not improve, or claims and service costs exceed the value of any additional sales.",
  },
] as const;

export function DecisionStoryboard() {
  const { product, records, importRecords } = useDemo();
  const [scene, setScene] = useState(0);
  const [choice, setChoice] = useState<(typeof options)[number]["id"]>("reinforce");
  const [error, setError] = useState("");
  const evidence = STRAP_SCENARIO.map((sample) => records.find((r) => r.id === sample.id));
  const loaded = evidence.every(Boolean);
  const selected = options.find((o) => o.id === choice)!;

  if (product.id !== STRAP_SCENARIO[0]!.productId) return null;

  function loadScenario() {
    if (!loaded) {
      try {
        importRecords(STRAP_SCENARIO.filter((sample) => !records.some((r) => r.id === sample.id)));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not import the scenario.");
        return;
      }
    }
    setError("");
    setScene(1);
  }

  return (
    <section
      aria-labelledby="story-title"
      className="overflow-hidden rounded-3xl border-2 border-navy bg-paper shadow-soft"
    >
      <div className="bg-navy px-5 py-6 text-navy-foreground sm:px-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sage">
          <Layers3 className="size-4" aria-hidden /> Guided decision story
        </div>
        <h2 id="story-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
          Would stronger straps win more customers?
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-navy-foreground/80">
          Walk through five scenes, from customer passages to a testable product decision. Every
          passage in this example is fictional; no sales effect has been measured.
        </p>
      </div>

      <ol
        className="grid grid-cols-2 gap-2 border-b p-4 sm:grid-cols-5 sm:px-8"
        aria-label="Story scenes"
      >
        {scenes.map((name, index) => (
          <li key={name}>
            <button
              type="button"
              disabled={index > 0 && !loaded}
              onClick={() => setScene(index)}
              aria-current={scene === index ? "step" : undefined}
              className={`flex h-full w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition sm:text-sm ${
                scene === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-primary-soft"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="shrink-0 tabular">{index + 1}.</span> {name}
            </button>
          </li>
        ))}
      </ol>

      <div className="space-y-5 p-5 sm:p-8" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="navy">Scene {scene + 1} of 5</Badge>
          <span className="text-sm font-semibold">{scenes[scene]}</span>
          {loaded && (
            <Badge variant="sage">
              <Check className="size-3" /> Scenario loaded
            </Badge>
          )}
        </div>

        {scene === 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Three customers. Three different signals.</h3>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Import an owner complaint, a non-buyer objection, and a satisfied light-load user.
              These are synthetic records for the live demo and remain labeled as such everywhere.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {STRAP_SCENARIO.map((r) => (
                <div key={r.id} className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs font-bold uppercase text-primary">{r.id}</p>
                  <p className="mt-2 text-sm">“{r.text}”</p>
                </div>
              ))}
            </div>
            <Button onClick={loadScenario}>
              {loaded ? "Continue with loaded evidence" : "Import fictional evidence"}{" "}
              <ArrowRight />
            </Button>
          </div>
        )}

        {scene === 1 && loaded && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Need: confidence carrying a heavy load</h3>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Two passages point to the same need. The owner reports an actual failure; the
              non-buyer reports uncertainty about construction. Those are different problems and
              neither passage establishes how common the need is.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {evidence.slice(0, 2).map((r) => r && <EvidenceCard key={r.id} record={r} compact />)}
            </div>
            <p className="rounded-xl bg-butter/50 p-4 text-sm">
              The need tags are pre-coded for this fictional demo. A live extraction service is not
              connected.
            </p>
          </div>
        )}

        {scene === 2 && loaded && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">A stronger build has a trade-off</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border-2 border-sage-strong/30 bg-sage/40 p-4">
                <p className="font-semibold">Heavy-load group</p>
                <p className="mt-2 text-sm">
                  The owner reports failed straps. The non-buyer wants evidence of load capacity
                  before choosing.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sources: STORY-OWNER-01, STORY-NONBUYER-02
                </p>
              </div>
              <div className="rounded-xl border-2 border-lavender-strong/30 bg-lavender/40 p-4">
                <p className="font-semibold">Light-load group</p>
                <p className="mt-2 text-sm">
                  A satisfied user says extra padding or weight would make the bag less appealing.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Source: STORY-LIGHT-03</p>
              </div>
            </div>
            {evidence[2] && <EvidenceCard record={evidence[2]} compact />}
            <p className="text-sm text-muted-foreground">
              Added weight and cost are design risks to test, not measured effects in this dataset.
            </p>
          </div>
        )}

        {scene === 3 && loaded && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Which change should the company test?</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={choice === o.id}
                  onClick={() => setChoice(o.id)}
                  className={`rounded-xl border-2 p-4 text-left transition ${choice === o.id ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary"}`}
                >
                  <span className="font-semibold">{o.name}</span>
                  <span className="mt-2 block text-sm">{o.action}</span>
                  <span className="mt-3 block text-xs text-muted-foreground">
                    Trade-off: {o.tradeoff}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selecting a proposal creates a test plan. It does not claim the change already
              increased sales.
            </p>
          </div>
        )}

        {scene === 4 && loaded && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-5 text-primary" />
              <h3 className="text-xl font-semibold">Test: {selected.name}</h3>
            </div>
            <p className="text-sm">
              Create a concept for this change: {selected.action} Compare it with the current bag.
              Recruit both heavy-load and light-load participants. Randomize which concept they see
              first, then record their choice and reason.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-sage/50 p-4">
                <p className="text-xs font-bold uppercase">Success metric</p>
                <p className="mt-2 text-sm">{selected.metric}</p>
              </div>
              <div className="rounded-xl bg-butter/50 p-4">
                <p className="text-xs font-bold uppercase">Reverse the decision if</p>
                <p className="mt-2 text-sm">{selected.reversal}</p>
              </div>
              <div className="rounded-xl bg-lavender/50 p-4">
                <p className="text-xs font-bold uppercase">Current result</p>
                <p className="mt-2 text-sm">
                  Not measured. A concept choice is stated preference; actual sales require a later
                  controlled launch test.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {loaded && scene > 0 && (
          <div className="flex justify-between border-t pt-5">
            <Button variant="outline" onClick={() => setScene((n) => n - 1)}>
              <ArrowLeft /> Back
            </Button>
            {scene < 4 && (
              <Button onClick={() => setScene((n) => n + 1)}>
                Next scene <ArrowRight />
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
