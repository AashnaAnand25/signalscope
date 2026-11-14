# Public-source research and competitor workbench

Open `/research` from the PERLab research navigation item.

## End-to-end path
1. Enter the exact product/model and region. Use Find competing product sources to get Google-grounded leads, or paste an official source URL.
2. Identify the source as supplier specifications, customer-reported experience, or analyst context. These are researcher labels, not automatic verification.
3. Confirm permission and Capture public page. The server checks robots.txt and retrieves one HTTPS HTML page without executing scripts.
4. Inspect the normalized text, URL, retrieval time and capture method. Truncation limits are visible in the interface.
5. Repeat for two to four competing models. Select the sources and enter comparison criteria.
6. Compare. Google proposes structured cells; the server rejects product omissions/duplication and quotation substrings not present in the corresponding source.
7. Export research brief to preserve sources, the comparison snapshot, priorities, capture timestamps and proposed next test.

The source library is browser-local. Customer evidence counts are not changed by capture or comparison. Use Data workspace's reviewed passage flow for permitted original customer statements.

## Capture boundaries
- Public HTTPS only. No query parameters, URL credentials, IP literals, custom ports, cookies or sign-in bypass.
- DNS results are checked and the HTTPS connection is pinned to a validated public address. Redirect targets are checked again.
- robots.txt is checked on each page host. A 404 is treated as no published robots policy; blocked or unverifiable policy uses the manual-excerpt fallback.
- 1 MB per network response, 12 seconds per request, at most four page hops, text capped at 18,000 characters. Competitor analysis receives at most 12,000 characters per product.
- JavaScript-only pages, bot blocks, PDFs, authenticated content and some IPv6 ranges are deliberately unsupported. Use a permitted excerpt/export.
- This is single-page retrieval, not a bulk crawler or a monitored scraping service. Three-second per-host throttle is local to one server instance.
- Production capture requires `WEB_CAPTURE_ENABLED=true` and authenticated hosting. The prototype's guardrails do not replace deployment authentication, quotas or legal permission.

## Velocity and Kearney apps
The supplied Growth Signals research URL still requires private sign-in. It is linked from the workbench; no private API was invented or connected. Authorized exports/excerpts work through the manual path. The same applies to private Kearney client systems.

The workbench links verified public pages for Velocity AI, Tariff Simulator, Ingredient Compass and AEPD. Descriptions explain proposed manual handoffs, not live integrations. See the positioning report and the teammate's company setup guide.

## Setup
No new scraping-provider key is needed. `cheerio` parses HTML and `robots-parser` checks robots rules on the Node server. Gemini comparison and source discovery use the existing server-side Google configuration. No credential file needs to be inspected or changed for localhost capture.

## Validation scope
Tests cover URL/IP rejection, source parsing, sign-in/captcha fallback, same-origin protection and competitor quote/product validation. Public-site availability and each retailer's policy vary. A successful synthetic fixture is not evidence that a specific retailer permits bulk use or that every dynamic page can be scraped.

Technical references:
- https://github.com/cheeriojs/cheerio
- https://github.com/samclarke/robots-parser

### Verification for this implementation
- Frontend suite: 33 tests across eight files passed.
- Shared company backend suite: one end-to-end test passed with 23 assertions.
- TypeScript, production build and lint passed (eight pre-existing Fast Refresh warnings, zero lint errors).
- HTTP smoke checks passed for the new research route and existing overview, data, company and company-survey pages.
- A live request to Kearney's public page returned the explicit network-unavailable fallback in this restricted execution process. Successful external capture, live competitor discovery and live competitor comparison have not been verified from this process.
- Browser automation is unavailable in this session, so a fresh visual/mobile interaction pass is not claimed.
- Teammate updates through commit `651bfe6` were pulled before implementation; the shared pilot was preserved.
