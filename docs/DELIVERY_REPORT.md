# SignalScope delivery report

## What changed

- New editorial landing page and primary Try now CTA, with an original lazy-loaded Three.js signal sculpture.
- Guided selection → two-tab analysis → roadmap flow. Kearney Analysis includes the comparison matrix; Comment Analysis holds original feedback and ingestion. Progress, Back, Next and export actions connect the steps.
- Reduced main navigation to Home, Workspace and a Resources menu. Existing advanced tools remain available.
- Product descriptions render independently of AI and source capture. Server fallback order: live page → successful capture cached less than 24 hours → authorized user excerpt → visibly labeled demo seed summary. Seed descriptions never count as customer feedback or captured pages.
- Provider diagnostics distinguish missing key, rejected key, quota, model availability, DNS, timeouts and source policy. Old generic-error report cache is invalidated.
- Explicit model access fallback from requested Gemini 2.5 models to `gemini-3.8-flash` on HTTP 404 only. Current model names are returned to the UI. Modern models use thinking level rather than legacy thinking budget.
- AgentProvider routes Gemini, OpenAI, Anthropic and Perplexity. Serper supplies optional live search. Page capture supports native HTTPS, Firecrawl and Serper.
- Research runs remain inside the request on Vercel instead of relying on detached in-memory background work. Long-lived local server jobs retain progress polling.
- Empty customer collections no longer show demand/source/co-mention charts full of zeros. Comparison bars measure evidence coverage rather than invented product quality.

## Observed root causes

1. Actual Google SDK call to requested `gemini-2.5-flash`: HTTP 404, model unavailable to new users in this project. This is not a missing-key failure, although it does not establish access to every other model.
2. Raw DNS lookup used by the original native scraper: `getaddrinfo ENOTFOUND`. The UI previously mislabeled this as a blocked publisher.
3. The runtime HTTPS connection could reach Kearney. The collector now uses that path for a fixed Kearney publisher allowlist, with bounded responses, manual redirects and robots checks. Arbitrary URLs retain DNS/public-address protection.
4. Replacement-model SDK and direct HTTPS test calls timed out in this execution environment. Live Gemini generation is therefore still unverified. A specific timeout is displayed; no demo answers substitute for a failed generation.

Before the fixes, combined provider and capture failures left no evidence for the analysis. Zero records meant zero captured evidence, not zero customer demand or zero unmet needs.

## Verification

| Check | Observed result |
|---|---|
| Unit and DOM integration tests | 50 passing, including all five requested descriptions with a failed provider, two-tab flow, roadmap/export availability, model fallback and source-kind boundaries |
| TypeScript | Passed |
| Production Node build | Passed |
| Vercel build output | Passed, Node 22 function generated |
| Lint | No errors; eight existing Fast Refresh warnings in shared UI/store files |
| Live official page capture | All five requested offering pages captured successfully |
| Live Gemini 2.5 request | Failed with specific model-access HTTP 404 |
| Live replacement-model request | Timed out; not a verified successful generation |
| Local/deployed HTTP | Landing and product workspace return 200; landing and initial description present in HTML |
| Playwright desktop/mobile | Script implemented and attempted with both installed Chrome and bundled Chromium. Both blocked before tests by macOS Mach-port permission denial. No browser pass claimed |
| Lighthouse, console, mobile overflow | Not verified because browser launch is blocked |
| Vercel deployment | Temporary anonymous preview deployed READY; account-backed production deployment blocked by absent Vercel authentication |
| Live competitors for every offering | Not verified. Requires successful search and extraction; no fixed list substituted |
| Live customer feedback | No representative Kearney client-review corpus asserted. Provider pages remain separate from customer comments |

The public preview intentionally contains no server secrets. AI is disabled there until the deployment is claimed and the account owner configures the server variables. Temporary previews expire after about an hour unless claimed. The current preview address is supplied in the conversation, not used as a permanent production domain.

## Keys and deployment

Full variable table, providers, setup URLs and model settings: `docs/AI_SETUP.md`. The Gemini/native path requires only `GEMINI_API_KEY` plus `RESEARCH_AGENT_ENABLED=true` on protected hosting. Optional independent search: `SERPER_API_KEY` and `AGENT_SEARCH_PROVIDER=serper`. Optional page renderer: `FIRECRAWL_API_KEY` with `SCRAPE_PROVIDER=firecrawl`, or Serper with `SCRAPE_PROVIDER=serper`.

No `.env` contents were inspected, committed or uploaded. The prebuilt deployment excludes local credentials. Claim/login and server configuration are still necessary for persistent hosting and live AI. The temporary 60-second function is for UI review; a full research run needs an account-supported duration/queue strategy.

## Remaining limits

- “DeepFind Analytics” remains unverified as a Kearney offering, rather than being invented as one. Ignite is represented as a service.
- Quote matching verifies that the text exists in a captured document, not that a customer's account is true or representative.
- Local derivation badges identify calculations; they do not fabricate external URLs for computed values.
- Public sites may deny automation. No sign-in, robots policy or review-platform restriction is bypassed.
- Server capture cache is process-local. Browser reports cache for 24 hours. Shared durable caching, distributed quotas and authenticated production access remain production work.

## Design references

Original layout and artwork, informed by Awwwards' editorial hierarchy and Three.js showcase: https://www.awwwards.com/websites/three-js/ . No third-party site artwork or layouts were copied.

Budget: Three.js loads after interaction-capable desktop mount, DPR capped at 1.5, rendering capped near 30fps, pauses offscreen/background, and uses static mobile/reduced-motion fallback. Actual frame rate and Lighthouse scores remain unmeasured.
