# SignalScope codebase audit — 2026-11-14

## Executive summary

SignalScope is a polished, browser-local hackathon prototype, not a production customer-research platform. It has a clear evidence model and careful warnings about synthetic data. The decisive gaps are shared collection, a real and permitted corpus, reviewer identity, and validation of the proposed product change against observed outcomes. This pass fixed the concrete navigation, counting, import, persistence, and large-list defects listed below. The frozen install, tests, typecheck, build, server startup, and guided storyboard browser flow now pass. No production approval is recommended until the shared-data architecture and research validation are completed.

This audit assumed a live demonstration to several judges and a maximum JSON import of 5 MB / 5,000 records. The standard UI component primitives were scanned for high-risk APIs and their app usage; each generated primitive was not independently penetration tested.

## Architecture and repository discovery

| Aspect | Finding |
| --- | --- |
| Type | TanStack Start full-stack React application; current business state is browser-local |
| Language | TypeScript/TSX, CSS, Bash (new launcher) |
| Runtime | Node 22+ for Nitro production server; Bun for dependency management and scripts |
| Framework | React 19, TanStack Router/Start, Tailwind CSS 4, Nitro Node server |
| Entry points | `src/router.tsx`, `src/routes/__root.tsx`, `src/server.ts`, `src/start.ts` |
| Build | Vite 8 with TanStack Start and Nitro plugins; `bun run build` outputs `.output/` |
| Package manager | Bun, `bun.lock` with frozen install; no npm lockfile |
| Network | Yes, SSR web server. Vite development default is 127.0.0.1:8081; launcher exports `PORT=8081` or next free port for production Nitro |
| State | React context and `window.localStorage`; no database, server API, login, or shared write path |
| External services | Google Fonts CDN; QR generation is local; Lovable sync via Git; no active model or data connector |
| Environment | No `.env.example`, `.env.sample`, `.env.template`, or required runtime env key in source; `PORT` is set by launcher. `LOVABLE_API_KEY` is mentioned only in instructions, not consumed by current code |
| Infrastructure | No Docker, Kubernetes, Terraform, or CI workflow in the tracked repository |

Data flow: synthetic product configuration and evidence plus browser-local imports and survey answers feed `DemoStoreProvider`; metrics and journey functions derive summaries; routes render the views. Imports and responses are validated in the browser, then serialized to localStorage. The survey QR only transfers a URL; it does not share responses across devices.

## Changes in this branch

1. The homepage featured-opportunity link now opens its matching dialog via a validated URL search parameter.
2. Survey preference counts use an immutable response selection, even after a reviewer edits desire tags.
3. The journey counts a respondent who explicitly reports use even without optional written notes.
4. Browser storage failures now surface; survey submission and evidence import persist before claiming success.
5. Imported survey-shaped records are rejected. Collected passages need a source URL or reference, and coding status must match origin. The download example remains explicitly synthetic.
6. Reviewed, collected passages with an unmet or partly met need produce a traceable draft research opportunity. It links supporting passages, counterexamples for the same coded need, missing evidence, and a suggested comparison experiment. This is a draft, not a sales forecast or causal conclusion.
7. Evidence cards render 60 at a time rather than mounting up to 5,000 at once.
8. `run.sh` checks tools, reuses project dependencies, validates environment, handles the default port, builds, and launches the Nitro server.
9. Added targeted tests for survey answer integrity, reported use, imported evidence, calendar dates, and derived opportunities.
10. Corrected the root package name in `bun.lock` to match `package.json`; all declared dependency versions matched in a static comparison.
11. Added a five-scene decision storyboard with three labeled synthetic passages, source-linked need and counterexample, three proposed changes, and a test plan with a reversal condition. Its coding is prewritten for the demo and its effects are unmeasured.

## Critical issues and remaining risks

| Severity | Location | Issue and concrete case | Fix or status |
| --- | --- | --- | --- |
| High | `src/services/insights-service.ts`, `src/routes/feedback.tsx` | A judge submits from their phone, but the presenter's browser never sees it. No shared service exists. | Implement the separately scoped shared backend with public submit, reviewer auth, idempotency and persistence. Not implemented in this branch. |
| High | `src/data/campus-backpack.ts` | All seeded passages and five curated opportunities concern a fictional product. A judge cannot verify real customer claims. | Bring a small permitted, cited corpus and preserve the synthetic demo as a separate mode. Not implemented without a supplied corpus/source permission. |
| High | `src/lib/metrics.ts` | Exact normalized need text defines a dynamic group: “stronger straps” and “durable shoulder straps” become separate draft opportunities. This may fragment demand. | Add reviewer-controlled merge/aliasing or a source-grounded extraction proposal; test on real passages. Current grouping is deliberately conservative. |
| Medium | `src/routes/feedback.tsx` | The awareness question appears after the page and product name are visible, so it cannot establish genuinely blind prior awareness in an experiment. | Separate a blind recruitment/awareness entry flow before showing product details. |
| Medium | `src/lib/demo-store.tsx` | Browser-local bookmarks, reviews and tag edits are unauthenticated. Anyone with that browser can change them; this is acceptable only for the local demo. | Reviewer authorization and server validation before shared deployment. |
| Medium | `src/lib/metrics.ts` | Seeded conflicts and opportunities remain curated IDs; newer evidence cannot resolve or overturn them automatically. | Add reviewer resolution and evidence versioning; keep counterexamples visible. |
| Medium | `src/lib/validation.ts` | JSON import validates shape, but cannot prove that a submitted sourceReference exists or that the quoted text supports a coding. | Reviewer confirmation and exact cited spans in the extraction workflow. |
| Medium | `src/services/insights-service.ts` | One malformed localStorage state makes `load()` return null for the whole state, so older valid answers may become inaccessible after schema changes. | Versioned migration and an export/recovery path before changing persistent schemas further. |

## Security review

No credential, token, private key, SQL execution, shell execution, server database query, or application API route was found in tracked app code. React escapes evidence text. The one `dangerouslySetInnerHTML` is in an unused chart primitive that constructs CSS from its config; it is not fed by imported evidence in this app. External evidence links require HTTPS and open with `rel="noreferrer"`. TanStack Start CSRF middleware is present for server functions, but there are no application server functions to exercise.

| Risk | Location | Impact | Remediation |
| --- | --- | --- | --- |
| High on shared deployment | Current browser-only architecture | No server authorization boundary for survey/reviewer roles | Authenticate reviewer operations in the planned backend; public clients only submit validated surveys |
| Medium | `src/routes/data.tsx` | Import text and references are user supplied; truthful provenance cannot be inferred from a valid JSON shape | Keep source citation and reviewer status; verify claims before using results |
| Low | `src/components/ui/chart.tsx` | CSS string is injected by a generic component if future code passes untrusted theme colors | Keep chart config static or validate colors before ever binding user input |
| Operational | `run.sh` | Per the requested behavior, startup forcibly stops the current listener on port 8081, even if unrelated | Run in a dedicated development/demo environment; do not use this launcher on a shared host without changing that behavior |

Dependency vulnerability and deprecation status were not checked against a vulnerability database. The presence of a prerelease Nitro dependency is visible in `package.json`/`bun.lock`; the installed version built and served successfully in this rehearsal.

## API and database review

There are no application-specific API routes, database schemas, migrations, indexes or transactions. `src/server.ts` delegates requests to TanStack Start and normalizes catastrophic SSR errors. The browser import and survey functions are the current input boundaries; they validate JSON shapes but are not network endpoints. API validation/auth/rate limiting and database integrity are therefore **not applicable to current code** and **required for the proposed shared backend**. Do not count absent mechanisms as tested protections.

## Performance findings

| Area | Problem | Impact | Fix |
| --- | --- | --- | --- |
| Evidence UI | Rendering every matching imported passage could mount 5,000 cards | Slow initial render, search and scrolling | Fixed: show 60, then load more |
| Metrics | `coOccurrence` scans all records for each of 45 desire pairs; ten category summaries also rescan | For the 5,000-record cap this is tolerable, but work repeats on updates | Compute one frequency table per record only if profiling at actual load finds a problem |
| Opportunities | Each ranked opportunity rebuilds an ID map of records | Repeated work with many drafts, bounded here to 50 | Share one ID map if this shows up in a profile |
| Browser storage | Whole state is serialized on each edit | Large imports can hit browser quota and synchronous main-thread cost | A shared database or IndexedDB for larger datasets; failure now surfaces |

The production build generated client and Nitro bundles successfully. Bundle size and hydration timings were not profiled against a budget; real network waterfalls and CPU/memory profiles remain unmeasured.

## Testing and DevOps

Two Vitest files cover routing recognition and measurement boundaries. This branch adds five focused boundary tests. The five-scene storyboard was exercised interactively in a browser, including import and switching proposals. There is still no automated browser end-to-end test for the featured-opportunity click, survey persistence/reload, mobile layout, JSON upload UI, or multi-device submission. Prioritize those flows before the demo. CI, deployment configuration, rollback, alerting, and monitoring are absent in the tracked repository. `run.sh` is a local launcher, not a deployment/rollback plan.

### Commands executed and result

| Command | Result |
| --- | --- |
| `git fetch origin` and `git rev-list --left-right --count HEAD...origin/main` | Success; `0 0`, already synced at `229904c` before edits |
| `rg --files`, `rg -n ...`, `sed -n ...` and `git diff --check` | Static discovery and diff checks succeeded |
| `bash -n run.sh` | Passed Bash syntax check |
| `bash run.sh` before supplying Bun | Correctly failed with exit 1 and `Missing required tool: bun` |
| Static comparison of `package.json` against `bun.lock` workspace root | All declared dependency versions matched; the stale root package name was corrected |
| `bun install --frozen-lockfile --silent` | Passed using official Bun 1.4.4 downloaded to `/tmp/signalscope-bun`; no global installation |
| `bun run typecheck` | Passed |
| `bun run test` | Passed: 2 files, 12 tests |
| `bun run lint` | Exit 0 with 8 Fast Refresh warnings in UI primitives and the demo store |
| `bun run build` | Passed Vite client/SSR and Nitro production build |
| `PATH=/tmp/signalscope-bun/bun-darwin-aarch64:$PATH ./run.sh` | Passed frozen install and build. First launch used 8081; the updated relaunch could not stop that existing listener and selected 8082, then started Nitro on all interfaces |
| `curl http://127.0.0.1:8082/opportunities` | HTTP 200, rendered HTML including storyboard after final rebuild |
| Browser UI on `/opportunities` | Imported three fictional records, observed source-linked need and counterexample, changed proposal, and saw the corresponding metric and reversal rule |

An npm install attempt in the prior review failed due to a non-writable user cache; a retry with an isolated cache did not resolve packages in that environment and was stopped. Frozen Bun installation now resolves successfully. Red-team cases were reasoned from validators and represented in tests, but live malformed requests, concurrency stress and cross-device behavior were not run.

## Production readiness scorecard (0–10)

| Category | Score | Evidence |
| --- | ---: | --- |
| Security | 4 | Browser validation and CSRF setup; no authenticated shared service yet; no dependency vulnerability scan |
| Reliability | 5 | Frozen install, typecheck, tests, build and local production startup pass; no server persistence or automated end-to-end suite |
| Scalability | 3 | 5,000-record import cap and paged cards; localStorage and synchronous recomputation remain |
| Maintainability | 6 | Domain types, separate metric functions, clear route structure; duplicated scans and large seed file |
| Observability | 2 | Error logging and error page; no metrics, tracing, alerts or production telemetry |
| Test coverage | 4 | Twelve passing unit tests and a manual storyboard browser flow; no automated end-to-end or backend tests |
| Documentation | 7 | README, route guide, teammate handoff and this audit; no production runbook |
| DevOps maturity | 2 | Local launcher and lockfile; no CI, deployment, rollback or monitoring config |

Overall classification: **prototype**. Scores are qualitative judgments from code review, not measured service-level results.

## Prioritized roadmap

**0–24 hours:** Rehearse the home-page opportunity link; test a sourced review import and verify the draft card; run the storyboard on a mobile viewport and fix any resulting runtime regressions. Provide a permitted real sample if the judges expect real research. Complete the shared QR backend only if its separate workstream is ready and tested.

**This week:** Add an end-to-end test for the import-to-opportunity path and survey reload; add a reviewer merge flow for equivalent needs; verify citation spans and distinguish suggestion from reviewed coding; run on mobile.

**This month:** Introduce shared storage, authenticated reviewer operations, migration/versioning, idempotent survey submission, and appropriate deployment controls. Collect enough non-buyer evidence to test whether the suggested change affects choice rather than just review sentiment.

**Long term:** Measure actual intervention outcomes with controlled comparisons, track cost/margin and negative trade-offs, add sampling design and uncertainty, production observability and rollback.

## Final verdict

**Do not approve for production deployment.** The app is a promising, clearly labeled demo with a verified local build and storyboard rehearsal, but has no shared persistence, real verified corpus, or authenticated reviewer boundary. It can be presented as a prototype after a rehearsal with the exact dataset and device flow used on stage.
