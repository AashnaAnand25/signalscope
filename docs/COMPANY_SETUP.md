# Company research pilot

The existing backpack routes are a separate synthetic demonstration. `/company` and `/company-survey` use a new Bun + SQLite service. This is a functional **single-team pilot**, not a multi-tenant enterprise deployment.

## Run locally

1. Install the repository dependencies with `bun install --frozen-lockfile`.
2. Generate a random reviewer token, for example `openssl rand -hex 32`. Set it in your shell as `SIGNALSCOPE_REVIEWER_TOKEN`; do not commit or paste it into source. Copy `backend/.env.example` as a reference for other optional settings. The service does not automatically load an `.env` file.
3. Run `./backend/run.sh` (API on port 8090). The script requires Bun and the token. SQLite data goes to `backend/data/signalscope.sqlite` by default and is ignored by Git.
4. In a second shell run `bun run dev` (web app on port 8081). Open `/company`, enter the token, and connect. The browser keeps the token in memory only.
5. Run `bun test backend/store.test.ts`, `bun run test`, `bun run typecheck`, `bun run lint`, and `bun run build` to verify both parts.

For another frontend port, set `SIGNALSCOPE_ALLOWED_ORIGINS` to its exact origin, e.g. `http://localhost:8082`. The API binds to `127.0.0.1` by default; `SIGNALSCOPE_API_HOST` changes that only when needed behind a trusted proxy. The API URL defaults to the current browser host on port 8090; for hosted use, set `VITE_COMPANY_API_URL` at frontend build time. This is a public API base URL, **not a secret**. Deploy both under HTTPS with a reverse proxy and a managed persistent database volume. A localhost survey link is not accessible to another person's device.

## Workflow

1. Create a product row for each distinct model/version/region. The `attributes` JSON accepts category-specific strings. Do not pool different revisions without a documented mapping.
2. Import an approved JSON array of evidence. Each record needs `id`, `productId`, `sourceType`, `text`, and `sourceReference`. Allowed source types: `review`, `qa`, `discussion`, `support`, `survey`, `return`, `interview`, `observed`. Imports are atomic, at most 500 records / 2 MB per request. Source references are citations supplied by the reviewer, not automatically verified.
3. Review each claim by entering a need and an **exact substring** from the original passage. Reject unsupported records. The service does not infer needs with AI or manufacture confidence scores.
4. Create a decision with reviewed supporting and contradicting IDs, alternatives, owner, success metric, guardrail, and reversal rule. A claim about a product cannot cite another product's evidence.
5. Record outcomes by decision and arm, with visitors, orders, revenue, cost, and returns. Keep periods, units, eligible population, attribution, currency, and collection method consistent. Displayed rates are descriptive; they do not establish causality or significance. Controlled assignment and analysis must be designed before a sales-lift claim.
6. Share `/company-survey?productId=...` from a reachable HTTPS deployment to collect voluntary responses. Survey responses are not automatically transformed into reviewed evidence. The awareness question is shown after product context, so it is not a blind awareness measure.

## Access and boundaries

All reviewer routes require `Authorization: Bearer <token>`. Public callers may submit a survey but cannot list responses or edit research. The token is a single-team secret, not individual identity or SSO. Browser requests must come from an allowed origin; direct API clients need the token. The public survey has a simple **global** 10/minute throttle, suitable for a small demo only. Configure a trusted proxy with proper IP-based abuse protection for a real launch. The API limits request bodies and validates references, product IDs, and count denominators. Database WAL and foreign keys are enabled.

The service currently lacks per-user audit trails, deletion/retention controls, automatic connectors, source rights verification, model extraction, backup automation, recovery drills, scalable rate limiting, experiments/assignment, statistical inference, and enterprise authentication. Those are integration and governance work, not toggles. Do not put sensitive customer data into this pilot until the company's access, privacy, retention, and source-use requirements have been reviewed.

## Inputs needed to make this a real company deployment

- A company sponsor and first product family with model/SKU, variants, revisions, region, and attributes.
- One **permitted** export with source references (reviews, support, returns, or interviews), plus permission/retention terms. Provide a small redacted sample first.
- The systems that hold sales, visitors, costs, returns and product releases; field definitions and a non-production export or API specification.
- Deployment target, company identity provider, security/privacy requirements, data residency and retention policy.
- A research owner to review extracted needs and a product owner to define success metrics and guardrails.
- If AI-assisted extraction is wanted: approved model gateway/credentials and a labeled evaluation set. The repo's Lovable instructions require model calls through its gateway; no live model is connected here.

Credentials and private raw data should be supplied through the approved secret store and transfer channel, never a Git commit or chat paste.
