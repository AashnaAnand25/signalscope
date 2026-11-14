# Connect Google AI

The implementation is ready for a real Google API request. Successful live inference still requires a valid key and model access.

## Local setup
1. Open `.env` yourself. It is ignored by Git and excluded from Docker builds.
2. Set `GEMINI_API_KEY` to your key.
3. Choose the matching provider:
   - Google AI Studio key: `GOOGLE_GENAI_PROVIDER=gemini`.
   - Google Cloud Vertex express-mode key: `GOOGLE_GENAI_PROVIDER=vertex`.
4. Set `GEMINI_MODEL` to a model enabled for your account. Default: `gemini-3.8-flash`.
5. Run `bun run build`, then `bun run start`. The start command loads `.env` at runtime.
6. Open Data workspace > Research assistant.

Do not add a `VITE_` prefix to credentials. The browser calls `/api/research`; only the server calls Google.

## What works when configured
- Tag a passage: structured extraction, exact supporting quotation check, then explicit user selection before importing.
- Ask your evidence: up to 40 eligible records, each capped at 3,000 characters. Synthetic evidence excluded unless selected. Answers are AI drafts, not calculated metrics.
- Search the web: Google Search grounding with returned source links. A response without sources is explicitly labeled ungrounded.

The provider may decline a request, reject the selected model, or require billing/quota. Errors never turn into synthetic results. Tests use mocked provider responses and do not establish live account access.

## Google Cloud hosting
A Dockerfile is included for Cloud Run. A project, billing configuration, deployment identity, and access policy have not been provided, so no cloud resources were created.

Deploy the container to a PRIVATE Cloud Run service. Supply credentials through Secret Manager as runtime environment variables, not Docker build arguments. For this express-key adapter, use `GOOGLE_GENAI_PROVIDER=vertex`. Leave `RESEARCH_AGENT_ENABLED=false` until access controls are configured; set it to `true` only behind authenticated hosting.

The current request cap is per server instance, not distributed. Before public multi-user deployment, add authenticated users, per-user quota enforcement, shared persistent storage, and production ADC/service-account authentication. This prototype does not implement those services.

## Velocity / Growth Signals
The supplied research page redirects to invite-only sign-in. No accessible developer API contract or API credential was supplied. A browser URL is not a scraping API.

Supported now: export/copy permitted original customer passages, paste each into Tag a passage, supply its original source URL, review the proposed tags, then add it. Structured evidence JSON can also use the existing importer. Preserve original quotations and distinguish analyst summaries from customer statements. Do not label an AI summary as a customer quote.

To build a direct connector, obtain the provider's documented API endpoint, authentication method, export schema, and permission to access the relevant workspace. No speculative Velocity endpoint is included.

References:
- https://ai.google.dev/api/generate-content
- https://ai.google.dev/gemini-api/docs/structured-output
- https://ai.google.dev/gemini-api/docs/google-search
- https://cloud.google.com/vertex-ai/generative-ai/docs/start/api-keys

## Test outcome in the coding environment
The application detected configured credentials after restart. The live request could not reach Google because hostname resolution failed (`ENOTFOUND`). This does not establish key validity. Start the app from your normal terminal or a network-enabled hosting environment to validate provider access. The credential file was not inspected during this test.
