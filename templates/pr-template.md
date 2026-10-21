<!-- PR TEMPLATE — copy into .github/PULL_REQUEST_TEMPLATE.md
     Goals: a reviewer decides in < 2 minutes; provenance is mandatory. -->

## Task & Intent

- Intent: `INT-YYYYMM-NNN` (link)
- Task: `T#` from the spec (link plan.md) · Complexity: _/10 · Mode: _
- Closes #<issue>

## Summary of changes

<2–4 sentences: WHAT changed (not a line-by-line replay). Which areas were touched.>

## Provenance (mandatory)

| Field | Value |
|---|---|
| Author type | `ai-agent` / `human` / `ai-assisted` |
| Agent & harness | <e.g. builder-claude / Claude Code 2.x> |
| Model | <e.g. glm-4.7 / gpt-5.1 / claude-sonnet-4.6> |
| Prompt ref | <promptHash SHA-256 or a link to the prompt file in the repo> |
| Human reviewers so far | <names / none> |

## Verification

- [ ] Build + lint + unit tests pass (CI green)
- [ ] New tests cover the task's acceptance criteria (list the FR→test mapping)
- [ ] Ran successfully inside the sandbox/container
- [ ] No credentials/secrets in the diff

## Sensitive areas touched

<!-- If you touched anything in AGENTS.md "ALWAYS requires human review" — declare it -->

- [ ] No sensitive areas touched
- [ ] TOUCHED: <auth/payment/migrations/...> → reviewers assigned per CODEOWNERS

## Security & docs (per docs/en/08-security.md & docs/en/09-discovery-ux.md)

- [ ] Threat model updated if trust boundaries / PII / auth changed (link if so)
- [ ] Every SR-x security requirement in scope has a test (list SR→test mapping)
- [ ] User-facing change → docs updated **in this PR** (docs-ship-with-feature gate)
- [ ] UI change → accessibility checklist passed (contrast, keyboard paths, labels)

## Rollback

<revert PR / migration down / flag off — one line>

---

### For the reviewer (adjust per routing)

- Low task (1–3) + agent L2+: quick audit — spec match, evals green, CI green.
- Medium task (4–6): review code as usual + acceptance criteria.
- High/critical task: review every step — the agent assists, the human owns it.
