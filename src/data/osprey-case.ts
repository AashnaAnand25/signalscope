import { campusBackpack } from "./campus-backpack";
import image from "@/assets/osprey-daylite-plus.jpg";
import raw from "./cases/osprey-daylite-plus.json";
import { evidenceSchema } from "@/lib/validation";
import type { ProductConfig } from "@/lib/types";
export const PUBLIC_CASE_ID = "osprey-daylite-plus-public";
export const PUBLIC_CASE_SPECS =
  "https://www.osprey.com/mx/en/daylite-plus-dayltpluss21-795?color=Tan%2520Concrete";
export const PUBLIC_CASE_IMAGE_SOURCE = "https://packhacker.com/travel-gear/osprey/daylite-plus/";
export const ospreyCase: ProductConfig = {
  ...campusBackpack,
  id: PUBLIC_CASE_ID,
  name: "Osprey Daylite Plus / public feedback case",
  shortName: "Osprey Daylite Plus · real sources",
  description:
    "A real 20L daypack, analyzed through a curated public-source snapshot. Owner comments, retailer reviews and editorial tests remain separately attributed. Posts cover different revisions and use contexts. Tags and renewal ideas are initial AI interpretations, not verified product defects or representative customer estimates.",
  attributes: [
    { label: "Capacity", value: "20L / manufacturer-listed" },
    {
      label: "Laptop sleeve",
      value: "15-inch claim on referenced regional page; version-dependent",
    },
    {
      label: "Manufacturer context",
      value: "Hydration sleeve, compression straps, removable hipbelt",
    },
    { label: "Corpus", value: "Public passages and labeled summaries / checked 15 Nov 2026" },
  ],
  image: {
    src: image,
    alt: "Osprey Daylite Plus, older model photographed by Pack Hacker. Image is illustrative of that tested revision.",
    width: 1200,
    height: 800,
  },
  evidence: evidenceSchema.array().parse(raw),
  hotspots: [
    {
      id: "straps",
      label: "Straps & access",
      description: "Excess webbing and zipper obstruction",
      desires: ["convenience", "quality"],
      x: 66,
      y: 36,
    },
    {
      id: "main",
      label: "Capacity & silhouette",
      description: "Room for travel without extra bulk",
      desires: ["convenience", "appearance", "customization"],
      x: 49,
      y: 64,
    },
    {
      id: "laptop",
      label: "Hydration & laptop fit",
      description: "Bladder clip and everyday equipment compatibility",
      desires: ["compatibility", "features"],
      x: 48,
      y: 27,
    },
    {
      id: "fabric",
      label: "Rain & durability",
      description: "Reported conditions and protective workarounds",
      desires: ["reliability", "quality"],
      x: 43,
      y: 47,
    },
    {
      id: "price",
      label: "Value & purchase context",
      description: "Discounted colors and a second-hand purchase",
      desires: ["price", "appearance"],
      x: 52,
      y: 82,
    },
  ],
  conflicts: [
    {
      id: "ODP-COMFORT",
      title: "Comfort depends on load",
      issue:
        "A commuter reports comfortable loaded carry, while an editorial test criticizes comfort at heavier loads. Conditions and product revisions differ.",
      sideA: { label: "Comfortable commute", recordIds: ["ODP-07"] },
      sideB: { label: "Heavy-load discomfort", recordIds: ["ODP-23"] },
      desires: ["quality"],
    },
    {
      id: "ODP-HYDRATION",
      title: "Hydration compatibility varies",
      issue:
        "One contributor warns of clip differences; other owners report successful non-Osprey bladder use. Test the exact revision and bladder.",
      sideA: { label: "Third-party bladders reported working", recordIds: ["ODP-04", "ODP-09"] },
      sideB: { label: "Clip-dependent setup", recordIds: ["ODP-03"] },
      desires: ["compatibility"],
    },
    {
      id: "ODP-CAPACITY",
      title: "Compactness vs travel volume",
      issue:
        "One tester wants no more than 20L; another moved to an expandable 26+6L. Different needs can justify different variants.",
      sideA: { label: "Keep the 20L format", recordIds: ["ODP-13"] },
      sideB: { label: "More capacity for travel", recordIds: ["ODP-11", "ODP-12"] },
      desires: ["convenience", "appearance"],
    },
  ],
  opportunities: [
    {
      id: "odp-strap-keepers",
      title: "Prototype integrated strap keepers",
      improvement: "Prototype a reversible keeper for excess webbing and check zipper clearance.",
      supportingIds: ["ODP-13", "ODP-14", "ODP-20", "ODP-04"],
      contradictingIds: ["ODP-22"],
      missing: [
        "Exact pack revision of each report",
        "Load and fit testing with target users",
        "Manufacturing cost and durability results",
      ],
      hypothesis: "Keeping loose webbing clear may improve access without changing the 20L format.",
      experiment:
        "Compare the existing setup and a keeper prototype on the same pack and load. Measure timed compartment access and strap interference; verify adjustment range.",
      desires: ["convenience", "customization"],
      defaultStatus: "ready-to-test",
    },
    {
      id: "odp-clip-guide",
      title: "Publish a tested hydration-clip guide",
      improvement: "Document clip revisions and photograph tested bladder combinations.",
      supportingIds: ["ODP-01", "ODP-03"],
      contradictingIds: ["ODP-04", "ODP-09"],
      missing: ["Physical tests for each bladder and pack revision"],
      hypothesis:
        "A revision-specific guide could reduce uncertainty without unnecessary hardware changes.",
      experiment:
        "Ask participants to select compatible bladders with and without the guide, then verify selected combinations physically.",
      desires: ["compatibility"],
      defaultStatus: "investigate",
    },
    {
      id: "odp-load-guide",
      title: "Test comfort at explicit carrying loads",
      improvement:
        "Evaluate common commuting and hiking loads and report fit guidance by body size.",
      supportingIds: ["ODP-23", "ODP-11"],
      contradictingIds: ["ODP-07", "ODP-05"],
      missing: ["Controlled load, torso measurements and revision-matched packs"],
      hypothesis: "Comfort guidance and a harness variant may help people select a suitable pack.",
      experiment:
        "Compare comfort ratings across defined load conditions, record torso fit, and check whether added padding increases unwanted weight.",
      desires: ["quality", "convenience"],
      defaultStatus: "investigate",
    },
    {
      id: "odp-modular-sleeve",
      title: "Explore a removable sleeve option",
      improvement: "Prototype a removable laptop sleeve for travelers prioritizing clothing space.",
      supportingIds: ["ODP-16"],
      contradictingIds: ["ODP-08", "ODP-19"],
      missing: ["Demand beyond one review", "Laptop protection and retention testing"],
      hypothesis:
        "A removable sleeve could serve distinct travel and equipment needs without removing protection for users who need it.",
      experiment:
        "Test packing capacity and equipment retention with removable versus fixed sleeve prototypes.",
      desires: ["customization", "compatibility"],
      defaultStatus: "investigate",
    },
    {
      id: "odp-rain-guide",
      title: "Clarify rain exposure and cover use",
      improvement: "Publish tested exposure conditions and cover compatibility.",
      supportingIds: ["ODP-07", "ODP-08"],
      contradictingIds: [],
      missing: ["Controlled water-ingress tests", "Pack revision and fabric treatment history"],
      hypothesis: "Clearer rain guidance could help commuters judge when a cover is needed.",
      experiment:
        "Measure water ingress under defined exposure conditions before revising any protection claim.",
      desires: ["reliability"],
      defaultStatus: "investigate",
    },
  ],
  researchQuestions: [
    {
      id: "odp-q-fit",
      desire: "compatibility",
      question: "Which exact pack revision, bladder clip and equipment dimensions do you use?",
    },
    {
      id: "odp-q-load",
      desire: "quality",
      question: "At what carried weight and duration does comfort change?",
    },
    {
      id: "odp-q-straps",
      desire: "convenience",
      question: "Which strap obstructs access, and under what adjustment and load?",
    },
    {
      id: "odp-q-price",
      desire: "price",
      question:
        "What price would you consider for your actual use case? A past purchase price is not a budget.",
    },
    {
      id: "odp-q-missing",
      desire: "sustainability",
      question:
        "Does repairability or recycled content influence your choice? This corpus does not establish that.",
    },
  ],
  desireHints: {
    ...campusBackpack.desireHints,
    convenience: "Strap management, access and carrying volume",
    quality: "Comfort under stated loads and reported durability",
    compatibility: "Hydration clips, equipment and airline dimensions",
    price: "Stated purchase context, not inferred willingness to pay",
    appearance: "Compactness and color preferences",
    customization: "Removable straps and sleeve options",
    reliability: "Rain exposure and reported support",
    sustainability: "No customer-demand inference from manufacturer material claims",
  },
};
