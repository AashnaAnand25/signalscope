import type { ProductConfig } from "@/lib/types";
export type PortfolioSource = {
  title: string;
  url: string;
  platform: string;
  kind: "provider-claim" | "market-commentary";
};
export type KearneyEntry = {
  id: string;
  name: string;
  category: string;
  description: string;
  industries: string[];
  capabilities: string[];
  source: PortfolioSource;
  searchScope: string;
};
const base = "https://www.kearney.com/web/product-excellence-and-renewal-lab";
export const KEARNEY_CATALOG: KearneyEntry[] = [
  {
    id: "velocity-ai",
    name: "Velocity AI",
    category: "Agentic product development",
    description:
      "A PERLab accelerator connecting research, concept development, simulation, prototyping and validation.",
    industries: ["Consumer products", "Industrial products", "Regulated categories"],
    capabilities: [
      "Customer signal sensing",
      "Concept and requirement generation",
      "Digital-persona simulation",
      "Prototype and sourcing plans",
      "Feasibility documentation",
    ],
    source: {
      title: "Velocity AI | Kearney",
      url: `${base}/what-we-do/velocity-ai`,
      platform: "Kearney.com",
      kind: "provider-claim",
    },
    searchScope:
      "Kearney PERLab Velocity AI agentic product development, not unrelated Velocity products",
  },
  {
    id: "tariff-simulator",
    name: "Tariff Simulator",
    category: "Trade and sourcing scenarios",
    description:
      "A PERLab accelerator for exploring duties, sourcing alternatives and landed-cost scenarios.",
    industries: ["Manufacturing", "Consumer products", "Global supply chains"],
    capabilities: [
      "Import and assembly scenarios",
      "Duty and sourcing cost modeling",
      "Origin and assembly trade-offs",
      "Cost and risk comparisons",
    ],
    source: {
      title: "Tariff Simulator | Kearney",
      url: `${base}/what-we-do/tariff-simulator`,
      platform: "Kearney.com",
      kind: "provider-claim",
    },
    searchScope: "Kearney PERLab Tariff Simulator landed cost sourcing tariff scenario tool",
  },
  {
    id: "ingredient-compass",
    name: "Ingredient Compass",
    category: "Ingredient and reformulation intelligence",
    description:
      "A PERLab tool connecting procurement, BOM and specification information with ingredient-risk and reformulation analysis.",
    industries: ["Food and beverage"],
    capabilities: [
      "Ingredient exposure mapping",
      "Reformulation prioritization",
      "Alternative ingredient analysis",
      "Cost and complexity trade-offs",
    ],
    source: {
      title: "Ingredient Compass | Kearney",
      url: `${base}/what-we-do/ingredient-compass`,
      platform: "Kearney.com",
      kind: "provider-claim",
    },
    searchScope: "Kearney PERLab Ingredient Compass food beverage formulation ingredient risk",
  },
  {
    id: "kearney-ignite",
    name: "Kearney Ignite",
    category: "Customer-led innovation service",
    description:
      "Kearney's customer-led innovation offering combines customer insight, design, data and implementation to develop business concepts.",
    industries: ["Cross-industry"],
    capabilities: [
      "Customer research",
      "Ethnographic insight",
      "Business concept development",
      "Product and experience design",
    ],
    source: {
      title: "Ignite | Kearney",
      url: "https://www.kearney.com/service/strategy-growth/innovation-for-growth/ignite/",
      platform: "Kearney.com",
      kind: "provider-claim",
    },
    searchScope:
      "Kearney Ignite customer-led innovation consulting service, not unrelated Ignite software; DeepFind ownership unverified",
  },
  {
    id: "perlab-design-to-value",
    name: "PERLab Design-to-Value",
    category: "Product renewal service",
    description:
      "PERLab's product-first design and engineering work addresses customer value, product cost and portfolio complexity.",
    industries: ["Consumer products", "Industrial products", "Packaging"],
    capabilities: [
      "Product teardown",
      "Material and component analysis",
      "SKU and portfolio simplification",
      "Design-for-growth and margin trade-offs",
    ],
    source: {
      title: "What we do | PERLab",
      url: `${base}/what-we-do`,
      platform: "Kearney.com",
      kind: "provider-claim",
    },
    searchScope:
      "Kearney PERLab design to value teardown product platforming margin optimization consulting",
  },
  {
    id: "kearney-aepd",
    name: "AEPD",
    category: "Product and design assessment",
    description:
      "A publicly described assessment of product and design excellence within the PERL 2.0 ecosystem.",
    industries: ["Cross-industry"],
    capabilities: [
      "Product and design assessment",
      "Industry benchmarking",
      "Product excellence measurement",
    ],
    source: {
      title: "PERL 2.0 | Kearney PERLab",
      url: "https://perlab2xo.kearney.com/",
      platform: "Kearney.com",
      kind: "provider-claim",
    },
    searchScope: "Kearney AEPD assessment product design excellence, not unrelated acronyms",
  },
];
export const KEARNEY_PRODUCTS: ProductConfig[] = KEARNEY_CATALOG.map((entry) => ({
  id: entry.id,
  name: entry.name,
  shortName: entry.name,
  category: entry.category,
  categoryPlural: "enterprise product and consulting offerings",
  description: entry.description,
  attributes: [
    { label: "Offering", value: entry.category },
    { label: "Target industries (provider positioning)", value: entry.industries.join(", ") },
    ...entry.capabilities.map((value) => ({ label: "Published capability", value })),
  ],
  image: {
    src: "/portfolio-mark.svg",
    alt: "SignalScope product renewal diagram",
    width: 460,
    height: 280,
  },
  hotspots: [],
  evidence: [],
  conflicts: [],
  opportunities: [],
  researchQuestions: [
    {
      id: `${entry.id}-feedback-gap`,
      desire: "reliability",
      question:
        "Which experiences are reported by actual users, and which claims still need independent validation?",
    },
  ],
  desireHints: {
    compatibility: "Integration with the client's systems and data",
    price: "Licensing, engagement scope and total cost",
    quality: "Quality and usefulness of outputs",
    speed: "Implementation effort and time to a useful result",
    reliability: "Repeatability and trust in the result",
    convenience: "Researcher and operator workflow",
    sustainability: "Evidence supporting environmental trade-offs",
    customization: "Industry and client-specific configuration",
    features: "Capabilities users explicitly request",
    appearance: "Clarity of dashboards and exported deliverables",
  },
  survey: {
    discoveryOptions: [
      { value: "colleague", label: "Colleague or professional referral" },
      { value: "demo", label: "Product demo or event" },
      { value: "search", label: "Search or published research" },
    ],
    priceRanges: [{ value: "not-specified", label: "Not specified / request a scoped quote" }],
  },
}));
export function kearneyEntry(id: string) {
  return KEARNEY_CATALOG.find((p) => p.id === id);
}

/** Short verified provider excerpts, never customer reviews or proof of product flaws. */
export const PUBLISHED_CONTEXT: Record<string, string[]> = {
  "velocity-ai": [
    "Decisions lag. Innovation stalls.",
    "Teams duplicate effort and lose time.",
    "Trends outpace your view of demand.",
    "Cost and risk get missed too late.",
  ],
  "tariff-simulator": [
    "Tariff shifts. Origin rule traps. Rising landed costs.",
    "Model duties, sourcing shifts, and total cost impact.",
  ],
  "ingredient-compass": ["Ingredient bans. Tariffs. Rising consumer expectations."],
  "kearney-ignite": [
    "We are customer-led but know that customers will often say one thing and do another.",
  ],
  "perlab-design-to-value": [
    "We cut packaging costs, streamline supply chains, and analyze every screw without compromising quality.",
  ],
  "kearney-aepd": ["Assessment of Excellence in Product and Design."],
};
