# SignalScope

Customer evidence. Clearer decisions.

A corporate consumer-intelligence workspace for the Kearney × PERLab Consumer Insights challenge. Reviews, product questions, discussions, and survey responses connect to customer desires, evidence gaps, and product experiments. The campus backpack is a fictional demonstration product.

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

Production output: `.output/` (Nitro Node server). No database or API key is required for the local demo.

## What works

- Chart-led overview with computed counts, source mix, evidence history, need pairs, and fulfillment gaps.
- Dark/light/system themes, high contrast, larger text, reduced motion, and a collapsible desktop sidebar.
- Plain-language chart explanations and an on-demand research glossary.
- Ten desire categories, source filtering, supporting records, and counterexamples.
- Journey coverage with measured vs unavailable metrics.
- Evidence search, reviewer tag edits, and side-by-side conflicts.
- Opportunities with supporting/contradicting records, bookmarks, and research status.
- Two-step voluntary survey, actual-use question, validated local persistence, copy link and generated QR.
- Data workspace with validated JSON imports and evidence/metric exports.

All seeded evidence is synthetic. Survey responses and imports persist only in the same browser. A QR code opens the URL on another device but does not create a shared backend. The name is a working product name, not a trademark availability claim.

## Import evidence

Open Data workspace, download its example, replace it with permitted evidence, and import the JSON array. Keep stable unique IDs and the selected product ID. Preserve source/origin/coding classifications. Public source URLs must use HTTPS. Import does not verify claims or grant permission to reuse text. Retain citations and use only permitted sources.

## Architecture graph

Open [interactive code graph](graphify-out/graph.html) or [graph report](graphify-out/GRAPH_REPORT.md). It uses Graphify AST extraction without an LLM. Rebuild with `python scripts/code-graph.py` after installing `graphifyy==0.9.108`. Project-local Loop Coding and Graphify instructions live under `.agents/skills/`.

## Teammate work

See [backend/data handoff](docs/TEAMMATE_BACKEND_PROMPT.md) for the separate shared-persistence and extraction task. A server-side Gemini integration is included. See [AI and Google Cloud setup](docs/AI_SETUP.md). Live inference requires your server key; shared persistence is still a separate task.
