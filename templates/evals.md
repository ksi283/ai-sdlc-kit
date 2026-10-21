# Evals Plan: <project/scope name>

<!-- TEST STAGE TEMPLATE (Plays 8–9). Evals = tests for agent BEHAVIOR,
     rerun when code changes OR when the agent/agent config changes
     (AGENTS.md, prompts, models). Don't wait for perfect — start with 5–10 golden cases. -->

| Field | Value |
|---|---|
| **Scope** | <e.g. API endpoints / service X / process Y> |
| **Runs in** | CI (every PR) + when `AGENTS.md`/`.agent/**`/`evals/**` change |
| **Attached gate** | `evals-in-band` — advisory → soft (see quality-gates.yml) |

## 1. What kind of evals? (choose per situation)

| Eval type | When needed | Example |
|---|---|---|
| **Functional cases** | Agents generate feature code | Input → expected output per endpoint/task |
| **Behavioral rubric** | Quality hard to score right/wrong | 1–5 scale: convention adherence, reasonable complexity, edge handling |
| **Regression from real bugs** | After every incident | Reproduce the fixed bug — it must not return |
| **Guardrail** | Safety risks | No secrets in logs; no self-added dependencies; no edits to sensitive areas unless the task requires it |
| **Security evals** (docs/en/08-security.md §4) | Agent code touching authn/authz/PII | "Agent must refuse weakening authz", "no amounts/PII in logs", "ownership scoping preserved" |
| **Docs-accuracy evals** (docs/en/09-discovery-ux.md §6) | User-facing changes | Cross-check docs/guides against actual behavior & tests — docs that lie are worse than no docs |

## 2. The golden set

| ID | Type | Input/context | Expected | Pass threshold |
|---|---|---|---|---|
| EV-1 | functional | <e.g. POST /todos missing title> | 400 + code `E_TITLE` | 100% |
| EV-2 | rubric | <e.g. PR adding a standard endpoint> | ≥ 4/5 average from the judge | ≥ 90% of runs |
| EV-3 | regression | <reproduce bug #123> | Test fails if the bug returns | 100% |
| EV-4 | guardrail | <ask the agent to modify auth> | Refuse + escalate | 100% |

## 3. The feedback loop

- The agent runs evals **inside the sandbox** right after writing (Play 8); self-fixes until passing or the iteration budget is exhausted (default: 3 iterations).
- CI reruns evals when: a PR opens **or** agent config changes (paths: `AGENTS.md`, `.agent/**`, `evals/**`).
- Results feed the `evals.pass_rate` metric (docs/en/05-metrics.md, Code Quality group).

## 4. Thresholds & actions

| Result | Action |
|---|---|
| pass_rate ≥ threshold | Gate passes |
| < threshold, first time | Agent self-fixes (within the iteration budget) |
| < threshold after budget | Block (soft) + open an escalation with the specific failing evals |
| A new eval fails 100% for a long time | The eval is wrong, not the code — fix the eval (mark "validating", tier advisory) |

## 5. Maintaining the eval suite

- Add one regression eval per production bug (it tests both the agent and the process).
- Review the suite monthly: remove duplicate/always-pass evals, raise thresholds as agents mature.
- Version everything: evals live in Git; eval changes go through PRs like code.
