# SignalScope delivery loop

Goal: a source-grounded consumer-insights flow, landing → product → analysis → roadmap, with actionable provider errors and Vercel-compatible execution.

## Verify every increment
- `bun run typecheck`
- `bun run test`
- `bun run build`
- `bun run test:e2e` against localhost; repeat with BASE_URL against verified deployment.

## Guardrails
- Never inspect `.env`, print credentials, invent reviews, or equate missing evidence with negative demand.
- Preserve existing datasets, original feedback, source URLs, reviewer edits and public guest access.
- Use specific provider errors. Never weaken tests to report success.
- Keep model fallbacks explicit and reported; no quota retry loops.
- Deployment and live-provider checks must be reported separately from fixture tests.

## Acceptance
- [ ] Working Gemini or specific actionable error
- [ ] Descriptions for every offering, independent of provider success
- [ ] Automatic cited competitors, no manual competitor fields
- [ ] Cited comparison and coverage charts
- [ ] Guided two-tab analysis and roadmap
- [ ] Responsive/reduced-motion checks, no application console errors
- [ ] Verified deployment URL or exact deployment blocker

Single-agent execution with repository tests and Playwright. Progress: docs/DELIVERY_REPORT.md.
