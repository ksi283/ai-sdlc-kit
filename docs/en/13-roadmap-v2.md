# 13 · Roadmap v2 — One Kit, Many Hands

> The v2 answer to: *"The whole team uses this kit — how do we work without chaos? How
> does nobody step on anyone's toes?"* Version 1 proved one person can run the lifecycle.
> Version 2 makes the kit **multi-tenant**: many members, many squads, many projects —
> one shared source of truth. *(Tiếng Việt: [`../vi/13-roadmap-v2.md`](../vi/13-roadmap-v2.md))*

---

## 1. Where chaos actually comes from (name it before fixing it)

| # | Conflict source | What goes wrong today (v1) |
|---|---|---|
| C1 | **Template drift** — everyone copied templates once | 6 projects run 6 different intent/spec formats; gates can't check them uniformly |
| C2 | **Silent policy edits** — one person tweaks `quality-gates.yml` locally | Teammates build against different rules; "passed on my machine" returns |
| C3 | **Shared-context collisions** — two people edit one `AGENTS.md` / one intent | Merge conflicts, overwriting each other's conventions |
| C4 | **Parallel work on the same task** — two agents, same worktree/issue | Duplicated PRs, double review, race conditions |
| C5 | **Skill-pack divergence** — everyone installs a different version | Design outputs and checklists stop matching between members |
| C6 | **Ownership ambiguity** — "who reviews what, who owns which gate" | Reviews queue on one person; others idle |
| C7 | **Upgrade shock** — kit changes break in-flight work | No deprecation path; members pin stale copies |

v2 = a mechanism for each row, not a meeting about it.

## 2. The v2 architecture: three repos, not one

```
┌──────────────────────────┐   consumed via template/installer
│  KIT REPO (this one)     │ ────────────────────────────────►  PROJECT REPOS (N)
│  guides · templates ·    │        each squad/project gets      your-app/…
│  skills registry · CI    │        a copy + its own AGENTS.md   ├─ own intents/specs
└───────────┬──────────────┘                                     ├─ own gate battery
            │ referenced by                                      └─ own branch protection
            ▼ (submodule / pinned reference / CODEOWNERS)
┌──────────────────────────┐
│  POLICY REPO (new, v2.1) │  quality-gates.yml · autonomy-policy.yml
│  owned by Policy Council │  CODEOWNERS: security-lead owns hard gates
└──────────────────────────┘
```

- **Kit repo** = doctrine + templates + skill registry (upstream). Changes via PR only.
- **Project repos** = where work happens; each owns its intents, branches, PRs.
- **Policy repo** = the one place gates live; projects reference a **pinned commit**, so
  C2 dies: a gate change is a reviewed, versioned, announced event — never a local edit.

## 3. "Nobody steps on anybody" — the concrete mechanisms

| Conflict | v2 mechanism | Kit doctrine it comes from |
|---|---|---|
| C4 parallel tasks | **1 task = 1 branch = 1 PR** enforced by branch protection; orchestrator allocates an isolated **worktree per task**; intent/spec IDs namespaced (`INT-YYYYMM-NNN-<team>`) | Play discipline + `templates/pipeline.yml` |
| C3 shared context | `AGENTS.md` **per repo** (never shared); shared standards live in the kit as **skills** (read-only imports, not copied text); CODEOWNERS on sensitive paths | P6 knowledge-as-code |
| C6 ownership | RACI made real with **CODEOWNERS** in every repo: Spec Reviewer owns `specs/**`, Security Lead owns `quality-gates.yml` hard rules + `src/auth/**`, EM owns autonomy policy | docs/03 RACI |
| C2 policy drift | policy repo + pinned reference; gates versioned (`v1` → `v1.1`), changes announced in the kit changelog | docs/04 policy-as-code |
| C5 skill divergence | skills registry **pins exact versions** (`ui-ux-pro-max@2.15.0`); upgrades are a PR, not a whim | `skills/registry.yml` (shipped in v1.4) |
| C1 template drift | kit distributed as **GitHub Template Repository**; projects adopt upgrades through a **merge-upstream window** (monthly) — see §5 | — (new in v2) |
| C7 upgrade shock | **deprecation rule**: a template/policy change ships with a migration note and a 2-week dual-run window; in-flight work finishes on the old version | docs/10 §2 versioning |

## 4. Roles in v2 (extends docs/03 §2)

| Role | Owns | V2 addition |
|---|---|---|
| **Kit Maintainer** (1–2 people) | kit repo: templates, docs, CI, registry | versioning (semver), changelog, upgrade windows |
| **Policy Council** (Security Lead + EM + 1 senior) | policy repo | gate changes; quarterly gate review |
| **Agentic Engineer** (per squad) | squad project repos | AGENTS.md, skills usage, task routing |
| **Everyone** | their own intents/branches/PRs | follows the lifecycle; proposes kit changes by PR |

Rule that prevents turf wars: **the kit is changed only by PR to the kit repo; policy only
by PR to the policy repo** — never by local edits, never by chat agreement.

## 5. Versioning & upgrade flow (C1, C7)

```
kit v1.x ──► v2.0 (template repo + installer) ──► v2.1 (policy repo) ──► v2.2+ (below)
                │                                     │
                └────────── projects pin a kit version; upgrade = PR that
                            merges the new tag + resolves the migration notes
```

- Kit releases use **semver**: MAJOR = template/policy format change (migration note
  required), MINOR = new plays/templates, PATCH = fixes.
- **Monthly upgrade window**: one PR per project updating the pinned kit version;
  conflicts resolved by the Agentic Engineer, reviewed by the Kit Maintainer.
- A template change that breaks in-flight specs waits for the next window — the window
  is the buffer that makes "nobody steps on anybody" true over time.

## 6. V2 milestones

| Milestone | Content | Done when |
|---|---|---|
| **v2.0** | Kit published as a GitHub Template Repository (the `init`/`check` CLI already shipped in v1.5); `docs/12` onboarding verified by a second person doing a fresh build | a member nobody coached reaches green gates in < 1 hour |
| **v2.1** | Policy repo extracted; CODEOWNERS everywhere; projects reference pinned policy | a gate change attempt without PR is structurally impossible |
| **v2.2** | Skill registry grows (2–3 packs); kit-authored skills appear (`skills/<name>/SKILL.md`) | two squads produce matching design outputs from the same pack version |
| **v2.3** | Team dashboard: aggregated metrics across projects (docs/05 groups), autonomy reviews per agent | EM sees flow/quality/autonomy for all squads on one panel |
| **v2.4** | Multi-squad pilot on a real product; retrofit lessons into docs | one release cycle with zero "stepped-on" incidents (C1–C7 checklist clean) |

## 7. What does NOT change in v2

The lifecycle stays exactly as documented in `02`: same 6 stages, same gates, same
autonomy earning. v2 adds **topology and ownership around** the lifecycle — it must never
become a second process on top of the first. If a v2 mechanism contradicts docs/02–11,
the mechanism is wrong; fix the mechanism.

---

*Back to [README](../../README.md) · onboarding → [`12-onboarding.md`](12-onboarding.md)*
