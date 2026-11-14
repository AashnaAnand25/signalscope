# Teammate GPT task: SignalScope shared research backend

We are building SignalScope for Kearney × PERLab's Consumer Insights track. It combines reviews, Q&A, discussions, voluntary surveys, and observable events to identify desired outcomes and evidence-backed product opportunities. The fictional campus backpack is a configurable demo product, not the platform's scope.

Frontend is React/TypeScript, TanStack Start, Tailwind. It has a corporate navy/teal workspace, complete routes, local evidence import/export, deterministic synthetic records, and a browser-local survey. Your task is shared data persistence and a small, genuine evidence-extraction pipeline. Do not redesign the app.

## Start here

Read AGENTS.md and inspect:

- `src/lib/types.ts`: domain contract.
- `src/lib/validation.ts`: evidence/import and persistence validators.
- `src/lib/survey.ts`: survey validation and evidence conversion.
- `src/lib/metrics.ts`: record-based metrics and denominators.
- `src/lib/demo-store.tsx`: current provider and state semantics.
- `src/services/insights-service.ts`: local persistence and extraction seam.
- `src/data/products.ts`: product registry.

The current InsightsService is synchronous. A real API is asynchronous: introduce an explicit async remote adapter and loading/error states rather than pretending fetch is synchronous.

## Ownership and boundaries

Own a new `backend/` Python FastAPI service, API documentation, `.env.example` for the service, tests, and new frontend files under `src/services/`. Integrate the adapter with `src/lib/demo-store.tsx` only as necessary. Coordinate before changing metrics, survey contracts, or seed data. Leave styles, navigation, page components, logo, and product illustration alone. Preserve local/offline mode as a selectable, clearly labeled fallback; no silent cross-device-sharing claims.

## Deliverable A: shared survey loop

Implement a minimal FastAPI + SQLite backend (or a permitted existing backend if supplied):

- Health/status endpoint.
- Public validated survey submission endpoint.
- Reviewer-authenticated listing of responses, evidence imports, coding edits, and research state.
- Product ID validation, bounded inputs, idempotent submissions, server timestamps, and clear errors.
- Restrict public survey visitors to survey submissions. They cannot import evidence, change coding, or mark research tested.
- Keep reviewer credentials server-side; use an authenticated session or equivalent server-validated mechanism. Never put secrets or admin keys into browser environment variables.
- Explicit CORS/allowed origins, request-size limits, and a simple submission abuse control suitable for a demo.
- Bind a response to its selected product; preserve origin and provenance.

Make the QR survey work across two browser sessions/devices when deployed to a reachable endpoint. Localhost alone does not establish cross-device functionality. Document the deployment requirement; do not deploy or change access without the user's task authorization.

## Deliverable B: real evidence and extraction

Accept documented, permitted product-specific evidence as JSON or CSV. Collect a small source-backed sample if authorized access is available; otherwise provide the ingestion tooling and clearly state that real data is still needed. Never relabel synthetic backpack records as actual reviews of a real product.

Each imported record keeps text, source link/reference, date if available, product/model, source type, evidence class, and origin. Do not link identities across sites or infer purchase/use status from a venue.

Implement a server-side text-to-desire extraction endpoint if a model API key is available. Extract only source-supported needs, context, explicit price thresholds, importance, fulfillment, trade-offs, barriers, and workarounds. Each proposed coding must cite an exact supporting span or offsets from the input. Validate model output and keep `codingStatus: ai-suggested` until reviewed. Do not fabricate a confidence percentage. Return a useful unavailable status if no API key exists. Do not simulate a live model call.

Backend credentials are optional inputs, never guessed or committed. Respect repository instructions on managed schemas. Do not modify `drizzle/` or `supabase/migrations/` unless explicitly allowed by the applicable instructions; a new independent service avoids that conflict.

## Measurement rules

- Posts, responses, people, orders, and sessions are different units.
- No click does not establish disinterest; no transaction does not establish rejection.
- Ownership/access does not establish use. Ask whether use occurred.
- Unknown fulfillment stays out of a known-fulfillment denominator.
- A stated budget is not demonstrated willingness to pay.
- Journey states may overlap; a one-time survey cannot establish longitudinal conversion or time-to-event.
- Observed, self-reported, inferred, unknown, synthetic, and collected evidence must remain distinguishable.
- A response preferring a desire does not prove it supports a particular proposed solution.

## Acceptance criteria

1. Submit a response in session A and see the correctly labeled record and updated counts in reviewer session B.
2. A public caller cannot access management actions or private raw responses.
3. Invalid and duplicate inputs do not inflate counts.
4. Imported evidence is tied to the correct product and preserves citations.
5. AI extraction is either actually called and validated or honestly unavailable.
6. Existing local demo and its tests still work; backend tests verify auth boundaries and persistence.
7. Provide setup/run commands, environment names without secrets, example requests, validation results, and remaining limitations. Commit your changes on a separate branch; do not force-push or overwrite teammates' work.
