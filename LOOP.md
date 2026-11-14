# SignalScope verification loop

Goal: keep the app clear to a first-time researcher while preserving source provenance.

## Done when
- `bun run typecheck`, `bun run test`, `bun run lint`, and `bun run build` pass.
- All seven routes return successful HTML from the production server.
- AI input validation, missing-key handling, exact quote checks, and explicit import review pass tests.
- Browser checks cover desktop/mobile, theme persistence, collapsed navigation, survey submission, and evidence drill-down when browser tools are available.
- Report separates verified behavior from unavailable network/browser checks.

## Each iteration
1. Fix one observed failure.
2. Run the relevant test, then the full checks before committing.
3. Record evidence and remaining limitations in `docs/FRONTEND_REVIEW.md`.
4. Stop when checks pass, or report a concrete external blocker after two attempts.

## Guardrails
- Never read `.env`, expose secrets, weaken tests, or rewrite published history.
- No autonomous data scraping, automatic AI imports, or fabricated metrics.
- Source text stays separate from editable tags.
- No scheduled loop or background agent is configured. Run this checklist within the current task only.
