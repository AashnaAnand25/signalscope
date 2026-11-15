import type { EvidenceClass, EvidenceRecord, JourneyContext, SurveyResponse } from "./types";

export interface JourneyMeasure {
  label: string;
  count: number;
  unit: string;
  source: string;
  evidenceType: EvidenceClass;
}

export interface JourneyNode {
  id: string;
  label: string;
  group: JourneyContext;
  definition: string;
  requiredData: string;
  denominator: string;
  timeWindow: string;
  limitation: string;
  /** Measures available from current data. Empty → not measurable. */
  measures: JourneyMeasure[];
  /** Data sources this node would need but the dataset does not have. */
  unavailable: string[];
  leadsTo: string[];
  repeatable?: boolean;
}

export type Coverage = "measured" | "partly measured" | "not measured";

export function coverageOf(node: JourneyNode): Coverage {
  if (!node.measures.length) return "not measured";
  return node.unavailable.length ? "partly measured" : "measured";
}

export interface JourneyTransition {
  from: string;
  to: string;
  label: string;
  measurable: false | { numerator: number; denominator: number; unit: string; source: string };
  dataNeeded: string;
}

export function buildJourney(records: EvidenceRecord[], responses: SurveyResponse[]) {
  const n = (f: (r: SurveyResponse) => boolean) => responses.filter(f).length;
  const passages = records.filter((r) => r.sourceType !== "survey");
  const stated = (j: JourneyContext) =>
    passages.filter((r) => r.journey === j && r.journeyBasis === "stated").length;
  const reviews = passages.filter((r) => r.sourceType === "review");
  const surveySrc = "Voluntary survey (self-report)";

  const nodes: JourneyNode[] = [
    {
      id: "unaware",
      label: "Unaware before survey",
      group: "discovery",
      definition: "Had not heard of this specific product before taking the survey.",
      requiredData: "Prior-awareness question asked before the product is shown.",
      denominator: "Survey responses who answered the awareness question",
      timeWindow: "At time of survey",
      limitation: "No recorded activity doesn't prove someone is unaware.",
      measures: [
        {
          label: "Said they hadn't heard of it",
          count: n((r) => r.awareness === "no"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Awareness of people outside the survey"],
      leadsTo: ["discovered", "access"],
    },
    {
      id: "discovered",
      label: "Discovered",
      group: "discovery",
      definition: "Encountered the product through a listing, search, post or person.",
      requiredData: "Exposure records (impressions, page visits) or self-reported encounter.",
      denominator: "Survey responses who answered the awareness question",
      timeWindow: "Any time before the survey",
      limitation: "An impression doesn't prove someone noticed the product.",
      measures: [
        {
          label: "Said they'd heard of it",
          count: n((r) => r.awareness === "yes"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Impression / session logs; not in this dataset"],
      leadsTo: ["not-interested", "interested"],
    },
    {
      id: "access",
      label: "Access without buying",
      group: "discovery",
      definition: "Has the product through a gift, borrowing, sharing or a demo.",
      requiredData: "Asking how access was obtained.",
      denominator: "Survey responses",
      timeWindow: "At time of survey",
      limitation: "Access source is often absent from transaction records.",
      measures: [
        {
          label: "Reported access another way",
          count: n((r) => r.experience === "accessed-other"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: [],
      leadsTo: ["activated"],
    },
    {
      id: "not-interested",
      label: "Not interested",
      group: "consideration",
      definition: "Explicitly said the product isn't relevant to them.",
      requiredData: "An explicit statement; ignoring or leaving a page is not enough.",
      denominator: "Survey responses",
      timeWindow: "At time of survey",
      limitation: "No click does not mean not interested.",
      measures: [
        {
          label: "Said it isn't relevant",
          count: n((r) => r.experience === "not-interested"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: [],
      leadsTo: ["interested"],
      repeatable: true,
    },
    {
      id: "interested",
      label: "Interested",
      group: "consideration",
      definition: "Showed interest: clicked, saved, asked for information.",
      requiredData: "Click/save events or self-reported interest.",
      denominator: "People who discovered the product",
      timeWindow: "Defined window after discovery",
      limitation:
        "Actions are indicators, not proof of intent. A public question doesn't establish purchase status.",
      measures: [
        {
          label: "Public product questions asked",
          count: passages.filter((r) => r.sourceType === "qa").length,
          unit: "Q&A passages",
          source: "Q&A (inferred signal)",
          evidenceType: "inferred",
        },
      ],
      unavailable: ["Click / save events; not in this dataset"],
      leadsTo: ["considering"],
    },
    {
      id: "considering",
      label: "Considering",
      group: "consideration",
      definition: "Comparing, reading specs or reviews, or stating they're considering it.",
      requiredData: "Comparison activity or stated consideration.",
      denominator: "Eligible exposed people",
      timeWindow: "Defined window after discovery",
      limitation: "Browsing can have other purposes.",
      measures: [
        {
          label: "Said they considered it",
          count: n((r) => r.experience === "considered"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
        {
          label: "Passages written while considering",
          count: stated("consideration"),
          unit: "passages",
          source: "Reviews & discussion",
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Comparison / spec-view events"],
      leadsTo: ["not-purchased", "purchased"],
      repeatable: true,
    },
    {
      id: "not-purchased",
      label: "Not purchased",
      group: "consideration",
      definition: "Considered but no linked purchase within a defined period.",
      requiredData: "Linked consideration and order records for the same people.",
      denominator: "People who considered",
      timeWindow: "e.g., 7 days after consideration",
      limitation: "No purchase record does not mean rejection; they could buy later or elsewhere.",
      measures: [],
      unavailable: ["Linked order records"],
      leadsTo: ["considering", "competitor"],
      repeatable: true,
    },
    {
      id: "purchased",
      label: "Purchased",
      group: "purchase",
      definition: "Completed an order or payment.",
      requiredData: "Order / payment records.",
      denominator: "People who entered the chosen starting stage",
      timeWindow: "Defined purchase window",
      limitation: "Purchase doesn't establish actual use.",
      measures: [
        {
          label: "Said they purchased it",
          count: n((r) => r.experience === "purchased"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Order records; not in this dataset"],
      leadsTo: ["activated", "unused"],
    },
    {
      id: "competitor",
      label: "Chose another product",
      group: "purchase",
      definition: "Bought a different product instead.",
      requiredData: "Follow-up survey or permitted linked purchase data.",
      denominator: "People who didn't purchase",
      timeWindow: "Defined follow-up window",
      limitation: "Leaving a page doesn't establish a competitor purchase.",
      measures: [],
      unavailable: ["Follow-up survey of non-buyers"],
      leadsTo: [],
    },
    {
      id: "activated",
      label: "Activated / in use",
      group: "use",
      definition: "Started using the product; reported first use or ongoing use.",
      requiredData: "A first-use milestone, usage diaries or follow-up surveys.",
      denominator: "People with the product",
      timeWindow: "Defined window after access",
      limitation: "Physical-product use usually requires self-report.",
      measures: [
        {
          label: "Passages describing use",
          count: stated("use"),
          unit: "passages",
          source: "Reviews & discussion",
          evidenceType: "self-reported",
        },
        {
          label: "Respondents reporting use",
          count: n(
            (r) =>
              r.usedProduct === "yes" &&
              (r.experience === "purchased" || r.experience === "accessed-other"),
          ),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Usage diaries or follow-ups of all owners"],
      leadsTo: ["support", "feedback"],
      repeatable: true,
    },
    {
      id: "unused",
      label: "Unused",
      group: "use",
      definition: "Has the product but never started using it.",
      requiredData: "Owner follow-up asking about first use.",
      denominator: "Buyers with complete follow-up",
      timeWindow: "Defined window after purchase",
      limitation: "Missing data can look like non-use.",
      measures: [],
      unavailable: ["Owner follow-up"],
      leadsTo: ["activated", "returned"],
    },
    {
      id: "support",
      label: "Support needed",
      group: "support",
      definition: "Had a problem or needed help.",
      requiredData: "Support requests or reported unresolved problems.",
      denominator: "Active users",
      timeWindow: "Defined usage period",
      limitation: "Many people never contact support.",
      measures: [
        {
          label: "Passages describing a problem needing help",
          count: stated("support"),
          unit: "passages",
          source: "Reviews",
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Support tickets; not in this dataset"],
      leadsTo: ["activated", "churned"],
      repeatable: true,
    },
    {
      id: "feedback",
      label: "Left feedback",
      group: "feedback",
      definition: "Submitted a review or comment; positive, mixed or negative.",
      requiredData: "Submitted feedback, classified by text.",
      denominator: "Confirmed users eligible to respond",
      timeWindow: "Defined period after use",
      limitation: "Ratings can contain mixed experiences; keep mixed separate.",
      measures: [
        {
          label: "Positive reviews",
          count: reviews.filter((r) => r.tone === "positive").length,
          unit: "reviews",
          source: "Review collection",
          evidenceType: "observed",
        },
        {
          label: "Mixed reviews",
          count: reviews.filter((r) => r.tone === "mixed").length,
          unit: "reviews",
          source: "Review collection",
          evidenceType: "observed",
        },
        {
          label: "Negative reviews",
          count: reviews.filter((r) => r.tone === "negative").length,
          unit: "reviews",
          source: "Review collection",
          evidenceType: "observed",
        },
        {
          label: "Said they posted feedback",
          count: n((r) => r.posted === "posted-publicly"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Count of eligible users (needed for a feedback rate)"],
      leadsTo: ["advocate"],
    },
    {
      id: "silent",
      label: "Silent user",
      group: "feedback",
      definition: "Uses the product but gives no feedback.",
      requiredData: "Confirmed use plus absence of feedback within a defined period.",
      denominator: "Eligible confirmed users",
      timeWindow: "Defined feedback window",
      limitation: "No review does not mean satisfaction; they may comment elsewhere or not at all.",
      measures: [
        {
          label: "Users who said they didn't post",
          count: n((r) => r.posted === "no"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Owner list to identify silent users beyond the survey"],
      leadsTo: ["repeat"],
    },
    {
      id: "advocate",
      label: "Recommended it",
      group: "after",
      definition: "Recommended, referred or shared the product with someone.",
      requiredData: "Tracked referral, recommendation question or permitted public recommendation.",
      denominator: "Users",
      timeWindow: "Defined period",
      limitation: "A positive review alone doesn't establish advocacy.",
      measures: [
        {
          label: "Said they told someone",
          count: n((r) => r.posted === "told-someone"),
          unit: "survey responses",
          source: surveySrc,
          evidenceType: "self-reported",
        },
      ],
      unavailable: ["Referral tracking"],
      leadsTo: ["repeat"],
    },
    {
      id: "repeat",
      label: "Repeat purchase",
      group: "after",
      definition: "Bought again or upgraded.",
      requiredData: "Another purchase linked to the same customer.",
      denominator: "Customers with sufficient follow-up",
      timeWindow: "Defined repeat window",
      limitation: "Shared accounts and gifts complicate interpretation.",
      measures: [],
      unavailable: ["Linked order history"],
      leadsTo: ["activated"],
      repeatable: true,
    },
    {
      id: "returned",
      label: "Returned",
      group: "after",
      definition: "Returned or refunded; separate from resold or given away.",
      requiredData: "Return / refund records; ask separately about resale or gifting.",
      denominator: "Eligible fulfilled orders",
      timeWindow: "Return window",
      limitation: "Return, resale and gifting are different outcomes.",
      measures: [],
      unavailable: ["Return records"],
      leadsTo: [],
    },
    {
      id: "churned",
      label: "Stopped using",
      group: "after",
      definition: "Reported stopping, or inactive beyond a product-specific threshold.",
      requiredData: "Reported stopping or follow-up after a defined period.",
      denominator: "Users at start of period",
      timeWindow: "Product-specific threshold",
      limitation: "Temporary non-use isn't always churn.",
      measures: [],
      unavailable: ["Owner follow-up"],
      leadsTo: [],
    },
  ];

  const aware = responses.filter((r) => r.awareness === "yes");
  const transitions: JourneyTransition[] = [
    {
      from: "discovered",
      to: "considering",
      label: "Heard of it → considered, purchased or has one",
      measurable: {
        numerator: aware.filter((r) =>
          ["considered", "purchased", "accessed-other"].includes(r.experience),
        ).length,
        denominator: aware.length,
        unit: "respondents who'd heard of it",
        source: "Voluntary survey (self-report)",
      },
      dataNeeded: "Available within the survey sample only.",
    },
    {
      from: "considering",
      to: "purchased",
      label: "Considering → purchased",
      measurable: false,
      dataNeeded: "Consideration events and orders linked to the same people within a set window.",
    },
    {
      from: "purchased",
      to: "activated",
      label: "Purchased → activated",
      measurable: false,
      dataNeeded: "Buyers with complete follow-up about first use.",
    },
    {
      from: "activated",
      to: "feedback",
      label: "Using → left feedback",
      measurable: false,
      dataNeeded: "A list of confirmed users eligible to give feedback, plus their submissions.",
    },
    {
      from: "activated",
      to: "support",
      label: "Using → needed support",
      measurable: false,
      dataNeeded: "Support requests linked to confirmed users.",
    },
    {
      from: "feedback",
      to: "advocate",
      label: "Positive review → recommended",
      measurable: false,
      dataNeeded: "Referral tracking or a recommendation question for reviewers.",
    },
    {
      from: "purchased",
      to: "returned",
      label: "Purchased → returned",
      measurable: false,
      dataNeeded: "Return records ÷ eligible fulfilled orders.",
    },
    {
      from: "repeat",
      to: "activated",
      label: "Repeat purchase → next cycle",
      measurable: false,
      dataNeeded: "Linked order history per customer.",
    },
  ];

  if (responses.length === 0) {
    for (const node of nodes) {
      const hadSurvey = node.measures.some((m) => m.source === surveySrc);
      node.measures = node.measures.filter((m) => m.source !== surveySrc);
      if (hadSurvey) node.unavailable.push("No participant survey responses collected yet");
    }
  }
  return { nodes, transitions };
}

export const MISSING_PERSPECTIVES = [
  {
    id: "unmeasured-awareness",
    title: "People whose awareness was never measured",
    gap: "Our sources only include people who wrote something or took the survey. Everyone else's awareness is unknown; not zero.",
    reach: "Ask the prior-awareness question to a broader, recruited sample.",
  },
  {
    id: "non-buyers",
    title: "Unobserved non-buyers",
    gap: "People who looked and chose not to buy rarely post. There are no linked visit or order records here, so their reasons are invisible.",
    reach: "Add an exit question for people who considered it, or a follow-up survey.",
  },
  {
    id: "silent-owners",
    title: "Owners who never gave feedback",
    gap: "Reviews come from a self-selected few. Silence is not satisfaction; these owners' experiences are simply missing.",
    reach: "Invite all owners to a short follow-up, not only those who chose to review.",
  },
  {
    id: "borrowers",
    title: "Gift recipients and borrowers",
    gap: "People who received or borrowed the bag don't appear in purchase-linked sources at all.",
    reach: "The survey's “I have one another way” option reaches some of them.",
  },
] as const;
