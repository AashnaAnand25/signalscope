import { BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
const terms = [
  ["Record", "One saved passage or survey answer. Records are not necessarily different people."],
  [
    "Need / desire",
    "Something a person wants the product to do or be, such as fit a laptop or cost less.",
  ],
  [
    "Mention count",
    "How many records discuss a need. Repeating the same need in one record still counts once.",
  ],
  [
    "Percentage",
    "A count divided by the eligible group, multiplied by 100. 3 out of 10 is 30%. Always check how many records sit behind it.",
  ],
  [
    "Denominator",
    "The total group used for a percentage. In 3 / 10, the denominator is 10. No eligible group means no meaningful percentage.",
  ],
  [
    "Unmet need",
    "A record explicitly reports that a requirement is not satisfied. Silence about it does not mean it is unmet.",
  ],
  [
    "Known assessment",
    "A record says a need is met, partly met, or unmet. Unknown and conflicting assessments are left out of the gap percentage.",
  ],
  [
    "Must-have / dealbreaker",
    "A person explicitly says a requirement is essential or would stop them choosing the product. The app does not assume this from negative wording.",
  ],
  [
    "Workaround",
    "An extra step someone reports taking because the product or information does not meet their needs.",
  ],
  [
    "Trade-off",
    "Someone explicitly accepts less of one benefit to get another. Two needs appearing together alone do not prove a trade-off.",
  ],
  [
    "Conflicting accounts",
    "Evidence points in different directions. Different preferences are not automatically incorrect claims. New research is needed to understand the difference.",
  ],
  [
    "Journey coverage",
    "Which parts of choosing, buying and using a product are visible in the evidence. Missing data cannot reveal how many customers left.",
  ],
  [
    "Observed / self-reported / inferred",
    "Observed means directly recorded behavior. Self-reported means someone says it happened. Inferred means an analyst interpreted it. Unknown means the evidence does not establish it.",
  ],
  [
    "Opportunity",
    "A proposed improvement to investigate. Supporting records make it worth testing, not proven demand or guaranteed revenue.",
  ],
  [
    "Sample / market",
    "The sample is the evidence collected here. The market is everyone who might buy or use the product. This app cannot treat the sample as the whole market.",
  ],
];
export function MetricGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <BookOpen size={16} />
          Understand the numbers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogTitle>Research, in plain English</DialogTitle>
        <DialogDescription>
          No statistics background needed. Each chart also has its own explanation.
        </DialogDescription>
        <dl className="space-y-4">
          {terms.map(([term, meaning]) => (
            <div key={term}>
              <dt className="font-semibold text-sm">{term}</dt>
              <dd className="mt-1 text-sm text-muted-foreground leading-relaxed">{meaning}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
