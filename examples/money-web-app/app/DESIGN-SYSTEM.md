# PocketLedger Design System

> Knowledge-as-code (principle P6, `docs/en/02-framework.md`): this file is the single
> source of truth for the app's visual system. Generated with the **ui-ux-pro-max**
> skill (MIT, <https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>), decided by a
> human review of its search results. Changes ship via PR like any code.

## Provenance

| Step | Tool | Result |
|---|---|---|
| Style search | `python .claude/skills/ui-ux-pro-max/scripts/search.py "personal finance expense tracker dashboard"` | 3 candidates: data-dense-dashboard, inclusive-design, bento-box-grid |
| Palette search | `… -d color "fintech expense tracker money management"` | Fintech/Crypto palette ("gold trust + purple tech") |
| Typography search | `… -d typography "fintech dashboard numbers data"` | "Dashboard Data" — Fira Code + Fira Sans |
| Auto design-system | `… --design-system --persist` | Generated MASTER.md — **overridden, see note** |

> Reasoning note: the auto-generated MASTER.md picked a handwritten/lifestyle style
> (Caveat + Quicksand) — an anti-match for a financial data product. The domain-specific
> searches above were treated as authoritative instead. This is exactly the skill's
> intended usage: it provides searchable intelligence; a human (or reasoning layer)
> makes the final call.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Style | **data-dense-dashboard** (primary) | KPI cards + data tables is what the product is |
| Overlay | **inclusive-design** | The kit's own a11y doctrine (WCAG AA, SR-x) |
| Palette | Fintech/Crypto: bg `#0F172A`, card `#222735`/`#1C2537`, border `#334155`, primary `#F59E0B`, accent `#8B5CF6`, income `#4ADE80`, expense `#F87171`, muted `#94A3B8` | Dark-first per skill ("avoid pure white"); all text pairs ≥ 4.5:1 |
| Typography | **Fira Code** for amounts/numbers (tabular-nums), **Fira Sans** for body/labels | Numbers align in columns; sans keeps prose readable |
| Radius / depth | 12px cards, 16px panels, soft `0 4px 14px` shadow | Consistent, low-cost (no heavy blur/glass) |

## Pre-delivery checklist (from the skill — enforced per PR)

- [x] No emojis as icons — wallet logo is inline SVG
- [x] `cursor: pointer` on all clickable elements
- [x] Hover states with 160ms transitions
- [x] Text contrast ≥ 4.5:1 (pairs verified in `layout.js` token comments)
- [x] Focus states: 3px amber `:focus-visible` ring (keyboard nav)
- [x] `prefers-reduced-motion` respected (transitions/animations disabled)
- [x] Responsive at 375px / 768px / 1280px (screenshots in `docs/screenshots/`)

## Usage rules for agents

- Build new screens **only** from these tokens — never hardcode hex values in views.
- Amounts always render through `money()` inside a `.amount` cell (mono, tabular).
- Semantic colors: green = income, red = expense, amber = primary action, violet = accents. Never color-only meaning (inclusive-design rule) — income/expense also carry text.
