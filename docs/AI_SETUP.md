# SignalScope server AI setup

Never put keys in browser code or a variable beginning `VITE_`. `.env` stays ignored. Copy `.env.example` for a new environment. Existing `.env` was not inspected during implementation.

## Configuration

| Variable | Required? | Purpose / value | Where to obtain |
|---|---|---|---|
| `GEMINI_API_KEY` | For default AI | Server Google AI Studio API key | https://aistudio.google.com/apikey |
| `GOOGLE_API_KEY` | Optional alias | Alternative name for the same Google credential | Google AI Studio |
| `GOOGLE_GENAI_PROVIDER` | Optional | `gemini` default; `vertex` for Vertex express-mode API key | Google Cloud console for Vertex |
| `GEMINI_MODEL` | Optional legacy alias | Used when task-specific Gemini model is unset | Google model access |
| `GEMINI_FAST_MODEL` | Optional | Requested default `gemini-2.5-flash` | Available model IDs in your Google project |
| `GEMINI_REASONING_MODEL` | Optional | Requested default `gemini-2.5-pro` | Available model IDs in your Google project |
| `GEMINI_FALLBACK_MODEL` | Optional | `gemini-3.8-flash` on model-not-found only; `disabled` to disable fallback | Google model access |
| `AGENT_PROVIDER` | Optional | Default router: `gemini`, `openai`, `anthropic`, `perplexity` | Configuration |
| `AGENT_TAGGING_PROVIDER` | Optional | Override tagging provider | Configuration |
| `AGENT_REASONING_PROVIDER` | Optional | Override synthesis provider | Configuration |
| `AGENT_SEARCH_PROVIDER` | Optional | `gemini`, `serper`, or `perplexity` for web search | Configuration |
| `SERPER_API_KEY` | For Serper | Search and optional scrape credentials | https://serper.dev |
| `FIRECRAWL_API_KEY` | For Firecrawl | Rendered-page capture credentials | https://www.firecrawl.dev |
| `SCRAPE_PROVIDER` | Optional | `native` default, `firecrawl`, or `serper`; policy checks still apply | Configuration |
| `OPENAI_API_KEY` | For OpenAI | Tagging/synthesis credentials | https://platform.openai.com/api-keys |
| `OPENAI_MODEL` | For OpenAI | Explicit accessible model ID | OpenAI console |
| `ANTHROPIC_API_KEY` | For Anthropic | Tagging/synthesis credentials | https://console.anthropic.com |
| `ANTHROPIC_MODEL` | For Anthropic | Explicit accessible model ID | Anthropic console |
| `PERPLEXITY_API_KEY` | For Perplexity | Agent API credentials | https://www.perplexity.ai/settings/api |
| `PERPLEXITY_MODEL` | For Perplexity | Explicit Agent API model ID | Perplexity console |
| `RESEARCH_AGENT_ENABLED` | On hosted AI | `true` enables server-funded AI. Keep deployment access protected and usage monitored | Vercel environment settings |
| `WEB_CAPTURE_ENABLED` | For hosted capture API | `true` enables the separate manual capture endpoint | Vercel environment settings |
| `VERCEL_FUNCTION_MAX_DURATION` | Optional, build-time | `300` normal build; `60` temporary preview limit. Must fit account plan | Vercel plan/function settings |
| `VERCEL` | Automatic | Chooses Nitro Vercel output and request-bound research, not detached background jobs | Set by Vercel |

No additional key is required for the default Gemini + native capture path. Serper is an optional independent live-search route, not a fix for invalid Gemini credentials. Firecrawl is an optional renderer, not a private-platform sign-in bypass.

The existing Google project returned HTTP 404 for the requested 2.5 Flash model. The code now retries that model-access failure once with the explicit fallback. It does not retry rejected keys, quota failures or network timeouts. To skip legacy model checks, set both Gemini model variables to `gemini-3.8-flash`. Actual provider/model names are shown in completed run metadata and connection checks.

## Connection check

Workspace → Analyze → Connection check → Test AI connection. A configured-key badge alone does not establish validity. Only a successful live request does. Errors distinguish missing keys, rejected credentials, quota, unavailable models, DNS, source policy and timeouts. Provider errors never expose raw credential-bearing responses.

## Vercel

1. Authenticate with `vercel login`, or claim the temporary preview in your browser.
2. Add required server variables in project settings. Do not upload `.env` into the source repository.
3. Enable protected access before setting `RESEARCH_AGENT_ENABLED=true`.
4. Deploy: `vercel --prod`. Build uses Nitro's Vercel preset and request-bound research so serverless instances cannot abandon detached jobs.
5. Rerun `BASE_URL=https://your-domain bun run test:e2e`. Fixture mode tests the UI with synthetic API responses. `LIVE_RESEARCH=1` does not stub the API; real competitor/data assertions still require a completed source-backed run.

Server capture cache and localhost job state are process-local. Browser report cache is 24 hours and survives page reloads. A shared durable research cache and queue are future production work. A 60-second temporary preview is for UI review with AI disabled, not a reliable host for the full research pipeline.

## References

- Google SDK: https://github.com/googleapis/js-genai
- Gemini thinking/model migration: https://ai.google.dev/gemini-api/docs/generate-content/thinking
- Anthropic Messages: https://platform.claude.com/docs/en/api/messages
- Perplexity Agent API: https://docs.perplexity.ai/docs/agent-api/quickstart
- Vercel function lifecycle: https://vercel.com/docs/functions/functions-api-reference
