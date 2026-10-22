# ai-sdlc-kit CLI

> **Tiếng Việt** (mặc định) · [English](README.en.md)

CLI zero-dependency (Node ≥ 18, chỉ stdlib) giúp **dựng khung project AI-SDLC mới** và
kiểm chứng wiring — để thành viên mới đi từ số 0 tới "gates xanh" bằng một lệnh
(tự động hóa đúng hợp đồng bàn giao trong [`docs/vi/12-onboarding.md`](../docs/vi/12-onboarding.md)).

## Chạy

**Không cần cài — nhưng mỗi lệnh đều phải có tiền tố `npx`** (đây là lỗi hay gặp nhất:
chạy `npx github:…` một lần rồi gọi `ai-sdlc-kit` trực tiếp sẽ báo `command not found`):

```bash
npx github:ksi283/ai-sdlc-kit --help
npx github:ksi283/ai-sdlc-kit --help --lang vi
npx github:ksi283/ai-sdlc-kit init my-app --skills intent-review --ai claude
```

**Hoặc cài lệnh toàn cục một lần** để bỏ tiền tố:

```bash
npm install -g github:ksi283/ai-sdlc-kit
ai-sdlc-kit --help --lang vi
```

**Hoặc từ bản clone của kit:** `node cli/ai-sdlc-kit.mjs --help`.

*(Repo private → npx/npm cài từ GitHub cần quyền truy cập repo của bạn.)*

## Các lệnh

### `init <dir> [--ai …] [--skills …] [--force] [--dry-run] [--lang vi|en]`

Dựng khung project mới: `AGENTS.md`, `docs/templates/` (intent, spec, plan, evals,
threat-model), `docs/intents/`, `specs/`, `evals/`, `policy/` (quality gates +
autonomy), `.github/` (PR template, CODEOWNERS, CI workflow), rồi dây skill
auto-activation vào `AGENTS.md`.

```bash
ai-sdlc-kit init my-app --skills intent-review,ui-ux-pro-max --ai claude
```

- `--skills` là danh sách phẩy tách từ [`skills/registry.yml`](../skills/registry.yml);
  pack lạ bị từ chối **trước khi** ghi bất kỳ file nào (quy tắc registry-first).
- Pack `local` được copy từ repo kit; pack `external` in ra lệnh installer đã pin version.
- Chạy lại là idempotent (block AGENTS.md làm mới, không bao giờ nhân đôi).

### `check [dir]`

Báo cáo wiring 10 điểm (AGENTS.md + skills block, intents, specs, policy, CI,
PR template, CODEOWNERS, evals). **Exit 1 khi chưa đủ** — dùng được như bước CI.

### `skill <pack> <dir> [--ai …]`

Cài một pack vào project có sẵn (cùng quy tắc registry với
[`skills/install.sh`](../skills/install.sh) — CLI này phản chiếu logic đó).

## Ghi chú phạm vi

- CLI dựng **project**; bản thân kit repo không phải là package để cài (`private: true`
  trong package.json — việc publish npm là quyết định có chủ đích của v2, xem
  `docs/vi/13-roadmap-v2.md`).
- Pack `external` cần điều kiện riêng của nó (vd `ui-ux-pro-max` muốn Python ≥ 3.9).
- Thông báo lỗi kỹ thuật giữ nguyên tiếng Anh; `--lang` dịch help và thông báo tiến trình.
