# Implementation Plan: <feature name>

<!-- BUILD STAGE TEMPLATE — the agent writes this plan BEFORE touching code
     (plan-mode-first, Play 5). A human approves this plan before the agent runs. -->

| Field | Value |
|---|---|
| **Originating spec** | link to `spec.md` + intent |
| **Current task** | <T# from the spec — 1 plan = 1 task, no bundling> |
| **Complexity / mode** | <e.g. 4/10 — ai-with-review> |
| **Executing agent** | <agent name/role + harness (e.g. builder-claude)> |
| **Current autonomy level** | <L0/L1/L2/L3> |

## Alignment check (the agent confirms before writing)

- [ ] I (the agent) have read the spec + the files listed below
- [ ] I understand this task's acceptance criteria to be: <short restatement>
- [ ] I must NOT: <add new dependencies / change APIs beyond the spec / touch modules outside the file list>
- [ ] If this task touches a sensitive path (AGENTS.md list) I have: declared it above, and every in-scope SR-x has a named test in the test plan

## Implementation steps

<!-- Present the order; each step names the files to create/modify and how to verify. -->

1. <step> → file(s): <...> → verify: <test/command>
2. …

## Files to be touched

```
path/to/file1.ts   (modify — why)
path/to/file2.ts   (create — why)
```

> If you discover you need to touch files outside this list → STOP and escalate. Do not expand scope on your own.

## Test plan

- New tests to write: <list>
- Existing tests to change: <list + why>
- How to run in the sandbox: <e.g. docker compose -f ci.yml; make test>

## Task completion criteria (task DoD)

- [ ] Every acceptance criterion of the task has a passing test
- [ ] Build + lint clean inside the container
- [ ] PR ≤ the autonomy-level limit (L1 ≤ 200 / L2 ≤ 500 / L3 ≤ 1000 lines)
- [ ] Provenance attached to the PR (templates/pr-template.md)

## Rollback plan

<how to restore if things go wrong after merge: revert PR / migration down / flag off>
