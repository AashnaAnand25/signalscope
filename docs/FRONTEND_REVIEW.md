# SignalScope review

Reviewed: November 14, 2026.

## Result
The app now prioritizes counts and charts, explains their meaning on demand, supports accessible appearance controls, and includes a server-side Gemini research integration. It remains a browser-local research prototype. No market-wide findings are claimed.

## Changes
- Higher-contrast navy/teal interface with semantic light and dark tokens.
- Bottom settings: light, dark, system, high contrast, larger text, reduced motion. Choices persist locally.
- Collapsible desktop sidebar with icons, accessible names, hover labels and saved state. Mobile keeps horizontally scrollable navigation.
- Chart-led overview: need mentions, source mix, dated record counts, paired needs, fulfillment gaps.
- Beginner guidance: three-step starting path, chart-specific explanations, examples beside ratios, and a global plain-English glossary.
- Detailed need sections collapse until requested. Evidence and research limitations remain available.
- Application source and all seven rendered route responses contain zero em dashes. Imported source passages are not rewritten on ingestion.
- Conflict summaries now respect the selected evidence scope.
- Research assistant: passage tagging, questions over selected evidence, and Google Search-grounded research.
- A merged evidence-to-decision storyboard preserves the new guided demo and rule-based opportunity candidates.
- AI extraction must return exact supporting quote substrings. A user selects suggestions before a passage enters the dataset. Tags remain AI-suggested until separately reviewed.
- Synthetic records are excluded from AI evidence questions by default.
- Server credentials stay outside browser requests and source control. The local credential file was created, then not opened or inspected.
- Google Cloud container recipe and configuration guide included. No cloud deployment was performed.

## Numbers and meaning

| Display | Meaning | Boundary |
| --- | --- | --- |
| Evidence collected | Saved passages plus survey records | Not unique customers |
| Need categories found | Categories with one or more mentions, out of ten | Zero mentions does not establish no demand |
| Records with unmet needs | Records with at least one explicitly unmet coding | Not all dissatisfied customers |
| Questions to investigate | Unanswered Q&A plus relevant conflicting accounts | Not an estimated population |
| Demand signals | Records mentioning a category / selected records | Categories overlap |
| Source mix | Records per source type | Volume is not reliability |
| Evidence over time | Dated records grouped by month | Not sales or changing demand; missing dates excluded |
| Paired needs | Records mentioning both categories | Neither causation nor a demonstrated trade-off |
| Fulfillment gaps | Unmet records / records with a known assessment | Unknown and conflicting assessments excluded |

Initial synthetic seed: 26 passages and 6 survey responses. This sample is illustrative, not a researched backpack product.

## Verification

| Check | Outcome | Evidence / limit |
| --- | --- | --- |
| TypeScript | Passed | `bun run typecheck` |
| Automated suite | Passed | 21 tests across five files |
| Lint | Passed with warnings | Zero errors; eight existing Fast Refresh warnings |
| Production build | Passed | TanStack Start + Nitro Node output |
| All seven routes | Passed | Production HTTP 200, route-specific title and main content |
| Em dash scan | Passed | Zero in application TS/TSX/CSS and seven rendered responses |
| Appearance persistence | Passed | Component interaction/remount test; earlier browser reload also confirmed dark/high/large/reduced settings |
| Evidence drill-down | Passed earlier browser check | Compatibility chart navigated to the need and filtered evidence |
| Source and empty filters | Passed earlier browser check | Review source count updated; empty collected filter gave zero counts and explicit empty state |
| Review before AI import | Passed component integration | No collected record until a suggestion was selected and explicitly added; original passage retained |
| Synthetic AI exclusion | Passed component integration | Zero records initially; enabling demo included 32 |
| Unsafe/duplicate imports | Passed unit checks | Invalid URL, duplicate ID and product mismatch rejected |
| Unknown denominators | Passed unit checks | Unknown fulfillment excluded; no fabricated rates |
| AI server boundaries | Passed mocked-provider tests | Missing key, cross-origin rejection, exact quote check, both provider endpoints, upstream failure |
| Live AI request | Blocked by network | Server detected configured credentials, but Google hostname resolution failed with ENOTFOUND. Key validity, model access, extraction and search remain unverified live |
| Current full browser/mobile pass | Incomplete | Browser-control tools became unavailable after environment reconnect. Latest sidebar, glossary and assistant interactions were covered by code/component checks, not a new visual browser pass |
| Shared survey and account flows | Not implemented | Browser-local persistence, no shared authenticated backend |
| Velocity connector | Not connected | Supplied URL redirects to invite-only sign-in; no documented workspace API supplied |

Mocked-provider tests verify app behavior around a response. They do not prove that Google accepts a credential or model configuration.

## Contrast checks
Computed from CSS token hex values using relative luminance. These checks cover the listed text/surface pairs, not a complete WCAG certification.

| Pair | Ratio |
| --- | ---: |
| Light body / white paper | 15.61:1 |
| Light secondary / white paper | 6.75:1 |
| Light link / white paper | 6.85:1 |
| Dark body / dark paper | 13.84:1 |
| Dark secondary / dark paper | 9.42:1 |
| Dark link / dark paper | 9.27:1 |

Heatmap shading was reduced to keep text legible in dark mode. Counts and labels accompany color. Latest mobile, zoom and full keyboard coverage still require a connected browser.

## What is distinctive
These are product judgments, not claims of first-in-the-world novelty.

1. **Missing voices as an explicit output.** Showing what cannot be learned from reviewers gives this a stronger story than another sentiment dashboard.
2. **Evidence to experiment.** Supporting records, counterexamples and a next research question can lead to a decision a judge can understand.
3. **Reviewed extraction with quotation checks.** The assistant proposes tags, preserves original text and waits for a person to accept evidence. A quote match establishes traceability, not correctness of every interpretation.
4. **Explainable sample boundaries.** Accessible language and visible denominators make the research usable beyond a statistics audience.

## What is ordinary or weak
- Generic KPI cards, a donut, dark mode and an AI text box are useful, but not the core innovation.
- Synthetic examples do not demonstrate a real consumer insight. This is the largest remaining demo weakness.
- Product-specific opportunity/conflict cards remain curated. The merged changes also derive rule-based opportunity candidates from new evidence, but do not establish validated commercial demand.
- The monthly chart shows corpus collection dates, not a business outcome. Keep it secondary in the pitch.
- A copied survey link or QR code does not provide shared storage or cross-device collection.
- No validated extraction-quality benchmark or representative consumer sample exists yet.

## Strongest demo sequence
1. Show a source-backed need in plain language.
2. Open its original quotation and a counterexample.
3. Reveal whose perspective is missing.
4. Add a permitted real passage, review AI suggestions and show the calculated count update.
5. Turn the evidence into one concrete product experiment.

Avoid presenting a tour of every chart. The story is: identify a need, inspect evidence, expose uncertainty, choose the next test.

## Next priorities
- Run the current build in an unrestricted local process and verify one extraction, one evidence answer and one search with real provider access.
- Replace the sample with a small permitted real corpus. Keep source URLs and original dates; do not convert AI summaries into customer quotes.
- Obtain a documented Velocity API/export contract before building a direct connector.
- Add shared storage and authenticated review before using the survey with other devices.
- Run the final mobile/keyboard browser pass, then compare tag quality against independently labeled passages.

## Design references
- [21st.dev dashboard collection](https://21st.dev/community/components/explore/ui-dashboard): sidebar, concise metrics and chart hierarchy references. The implementation uses the project's own components and Recharts, not copied dashboard source.
- [Awwwards data visualization gallery](https://www.awwwards.com/websites/data-visualization/): requested as a reference, but retrieval timed out. No claim of having inspected the live gallery or copied its designs.

## Architecture and tooling
Graphify generated an interactive source graph and JSON using local AST extraction. It excludes semantic analysis of documents and does not prove runtime correctness. See `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.html`.

Loop Coding and Graphify instructions were imported project-locally under `.agents/skills/`. Global personal-skill installation was unavailable, so these are repository instructions rather than a claimed account-wide installation. No background loop, scheduled job or delegated agent was launched.

## Live extraction follow-up
After the app was launched from the user's terminal, a follow-up extraction succeeded: HTTP 200 in 10.7 seconds, returning one suggestion for a synthetic laptop-fit test passage. The key file was not opened or inspected. This establishes successful extraction for that request; live evidence-question and web-search modes are not yet verified. An earlier request failed, so failures are intermittent rather than evidence of an invalid key. Browser requests now have a 50-second deadline; server provider timeouts return a specific 504 error after 45 seconds.
