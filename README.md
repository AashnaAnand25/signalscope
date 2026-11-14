# SignalScope

Customer evidence. Clearer decisions.

A corporate consumer-intelligence workspace for the Kearney × PERLab Consumer Insights challenge. Reviews, product questions, discussions, and survey responses connect to customer desires, evidence gaps, and product experiments. The campus backpack is a fictional demonstration product.

The separate [Kearney PERLab company pilot](docs/COMPANY_SETUP.md) adds shared SQLite data, configurable client product variants, cited evidence review, decision records, outcome entry, and a public survey endpoint. Kearney's public pages provide an offering brief only; real client evidence and deployment decisions are still needed.

## Local setup

Requires Node 22+ and Bun.

```sh
bun install
bun run dev
```

Default URL: http://127.0.0.1:8081/

```sh
bun run typecheck
bun run test
bun run lint
bun run build
bun run start
```

Alternatively, run `./run.sh` from anywhere. It requires Bun and Node, installs from the frozen
lockfile, builds, then starts the Nitro server on port 8081 or the next free port. As requested
for this launcher, it forcibly stops any listener already using port 8081; use it only where
that behavior is appropriate.

Production output: `.output/` (Nitro Node server). No database or API key is required for the local demo.

## What works

- Chart-led overview with computed counts, source mix, evidence history, need pairs, and fulfillment gaps.
- Dark/light/system themes, high contrast, larger text, reduced motion, and a collapsible desktop sidebar.
- Plain-language chart explanations and an on-demand research glossary.
- Ten desire categories, source filtering, supporting records, and counterexamples.
- Journey coverage with measured vs unavailable metrics.
- Evidence search, reviewer tag edits, and side-by-side conflicts.
- Opportunities with supporting/contradicting records, bookmarks, and research status. Reviewed,
  collected passages describing an unmet need also produce a traceable draft opportunity.
- A five-scene guided decision story on Opportunities imports three fictional backpack passages,
  shows the opposing segments, compares three changes, and ends with a metric and reversal rule.
- Two-step voluntary survey, actual-use question, validated local persistence, copy link and generated QR.
- Data workspace with validated JSON imports and evidence/metric exports.

All seeded evidence is synthetic. Survey responses and imports persist only in the same browser. A QR code opens the URL on another device but does not create a shared backend. The name is a working product name, not a trademark availability claim.

## Import evidence

Open Data workspace, download its synthetic example, replace it with permitted evidence, and
import the JSON array. Keep stable unique IDs and the selected product ID. For collected passages,
provide a HTTPS `sourceUrl` or `sourceReference`, set `origin` to `collected`, and use `human-reviewed`
or `ai-suggested` coding status. General imports cannot manufacture survey responses. Import does
not verify claims or grant permission to reuse text. Retain citations and use only permitted sources.

See [the codebase audit](docs/CODEBASE_AUDIT.md) for the current risks and validation limits.

## Architecture graph

Open [interactive code graph](graphify-out/graph.html) or [graph report](graphify-out/GRAPH_REPORT.md). It uses Graphify AST extraction without an LLM. Rebuild with `python scripts/code-graph.py` after installing `graphifyy==0.9.108`. Project-local Loop Coding and Graphify instructions live under `.agents/skills/`.

## Teammate work

See [backend/data handoff](docs/TEAMMATE_BACKEND_PROMPT.md) for the original implementation brief. A server-side Gemini integration is included for the demo routes; see [AI and Google Cloud setup](docs/AI_SETUP.md). The company pilot uses its independent Bun/SQLite API and human review; connecting AI extraction to private company records requires an approved gateway and access design.
