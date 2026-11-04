# 14 · Đưa kit vào Claude Code dưới dạng plugin — nghiên cứu khả thi

> Trạng thái: **phương án A đã duyệt và triển khai trong working tree** (chưa commit, chưa push). Chưa kiểm chứng cài từ GitHub thật.
> Đối chiếu tài liệu chính thức của Claude Code ngày 2026-11-04, với Claude Code 2.1.296.
> *(English mirror: chưa có — theo quy ước repo, bản `docs/en/` sẽ viết sau khi phương án được duyệt.)*

---

## 1. Kết luận

- **Khả thi, chi phí thấp.** Hai skill hiện có (`skills/intent-review`, `skills/spec-review`) đã đúng format plugin (`<name>/SKILL.md` với `name` + `description`). Không cần viết lại nội dung skill.
- **Repo cần 3 thay đổi nhỏ** (đã làm trong working tree, chưa commit):
  1. Thêm `.claude-plugin/plugin.json` và `.claude-plugin/marketplace.json` ở gốc repo.
  2. Dời `skills/_template/` ra khỏi `skills/` — nếu không, template bị nạp thành skill `_template` (đã kiểm chứng, xem §4).
  3. Thêm `commands/` để gọi CLI qua `${CLAUDE_PLUGIN_ROOT}` (ví dụ `/ai-sdlc-kit:sdlc-check`).
- Prototype của cả 3 thay đổi đã chạy thật: validate pass, cài qua marketplace, slash command chạy end-to-end. Chi tiết ở §5.

## 2. Plugin của Claude Code: đặc tả liên quan

| Thành phần | Vị trí mặc định | Kit dùng? |
|---|---|---|
| Manifest | `.claude-plugin/plugin.json` — chỉ `name` là bắt buộc | Có |
| Skills | `skills/<name>/SKILL.md` | Có (2 skill) |
| Commands | `commands/<file>.md` → lệnh `/<plugin>:<file>` | Có (thêm mới) |
| Hooks | `hooks/hooks.json` | Tùy chọn (chưa làm) |
| Executables | `bin/` → lên PATH của Bash tool khi plugin bật | Tùy chọn (đưa `ai-sdlc-kit` vào PATH) |
| Agents, MCP, LSP, output styles | — | Không cần |

Quy tắc đường dẫn trong manifest: phải bắt đầu bằng `./`, nằm trong thư mục plugin, không chứa `..`, không symlink ra ngoài.

Cài đặt và namespace:

```bash
claude plugin marketplace add <owner>/<repo>        # hoặc đường dẫn cục bộ ./path
claude plugin install ai-sdlc-kit@<marketplace>
```

Trong phiên: `/plugin`. Skill và command của plugin được namespace: `/ai-sdlc-kit:<tên>`.

Nguồn: `code.claude.com/docs/en/plugins`, `plugins-reference`, `plugin-marketplaces`, `plugins/components`, `plugins/loading`.

## 3. Đối chiếu với repo hiện tại

| Hạng mục | Hiện trạng | Đánh giá |
|---|---|---|
| Format skill | `SKILL.md` có `name` + `description` ("USE WHEN …") | Khớp, không đổi |
| `skills/_template/` | Có `SKILL.md` placeholder | **Rủi ro**: bị nạp thành skill `_template` (§4) |
| CLI đọc tài nguyên | `cli/ai-sdlc-kit.mjs` đọc `templates/`, `skills/registry.yml`, `skills/<pack>/` theo đường dẫn tương đối | Phải nằm trong cây plugin → plugin root = gốc repo |
| Kích thước | Tracked tree ~1.10 MB, phần lớn là screenshot trong `examples/` | Chấp nhận được khi copy vào cache |
| Số version | Lặp ở 3 chỗ: `package.json`, `const VERSION` trong CLI, `plugin.json` (mới) | Cần một nguồn duy nhất hoặc CI kiểm tra đồng nhất |
| Runtime | CLI cần Node ≥ 18 trên PATH của người dùng | Plugin không bundle Node |

## 4. Ba phương án cấu trúc

**A. Plugin = gốc repo (khuyến nghị).** Marketplace entry `"source": "./"`, không nhân bản file.
- Ưu: một nguồn chân lý; CLI và skill luôn cùng phiên bản; không có bước build.
- Nhược: cache chứa cả `examples/`, `docs/`; `_template` phải dời; mọi file repo đều thành phần của plugin.

**B. Thư mục `plugin/` do CI build** (copy `cli/`, `templates/`, `skills/` vào).
- Ưu: cache gọn.
- Nhược: nhân bản → dễ trôi nguồn. Đi ngược nguyên tắc single-source đã nêu ở [`docs/vi/13-roadmap-v2.md`](13-roadmap-v2.md) (C2, C5).

**C. Repo plugin riêng**, đồng bộ bằng CI.
- Nhược: thêm một repo phải bảo trì, và cùng vấn đề nhân bản như B.

**Chọn A.** Lý do chính: kit tự mô tả mình là "một nguồn chân lý, đổi qua PR"; nhân bản sẽ tái tạo đúng loại trôi phiên bản mà kit sinh ra để chống.

### Vì sao cần `skills` allowlist và dời `_template`

Đã kiểm chứng trực tiếp:

- `claude --plugin-dir <gốc-repo>` → nạp cả `ai-sdlc-kit:_template`.
- Cài qua marketplace có `"skills": ["./skills/intent-review", "./skills/spec-review"]` → **không** nạp `_template`.

Hai đường cài cho kết quả khác nhau, nên allowlist không đủ. Cách sạch là dời template khỏi `skills/` (đề xuất `templates/skill/SKILL.md`), đồng thời cập nhật 4 chỗ đang trỏ tới `skills/_template/`: `README.md:162`, `README.en.md:161`, `skills/README.md` (dòng 40, 61), `skills/registry.yml` (dòng 57, 75).

## 5. Prototype đã kiểm chứng

Vị trí: `/tmp/ai-sdlc-kit-proto` (commit `8d56ffb`, scratch — **không** merge). Repo chính không bị đổi.

File prototype:

`.claude-plugin/plugin.json`
```json
{
  "name": "ai-sdlc-kit",
  "version": "1.7.0",
  "description": "AI-SDLC gates, intent/spec review skills and project wiring checks (ai-sdlc-kit CLI) for Claude Code",
  "author": { "name": "ksi283" },
  "license": "Apache-2.0",
  "keywords": ["ai-sdlc", "sdlc", "governance", "skills", "gates"]
}
```

`.claude-plugin/marketplace.json`
```json
{
  "name": "ai-sdlc-kit-marketplace",
  "owner": { "name": "ksi283" },
  "plugins": [
    {
      "name": "ai-sdlc-kit",
      "source": "./",
      "description": "Intent and spec review skills plus wiring checks for AI-SDLC projects",
      "skills": ["./skills/intent-review", "./skills/spec-review"]
    }
  ]
}
```

`commands/sdlc-check.md` — chạy CLI qua `${CLAUDE_PLUGIN_ROOT}`, chỉ đọc, không ghi file:
```markdown
---
description: Report AI-SDLC wiring for a project (ai-sdlc-kit check)
argument-hint: "[project-dir]"
allowed-tools: Bash(node:*)
---
!`node "${CLAUDE_PLUGIN_ROOT}/cli/ai-sdlc-kit.mjs" check $ARGUMENTS`
```

Kết quả:

| Kiểm tra | Kết quả |
|---|---|
| `claude plugin validate` (plugin và marketplace) | ✔ Passed |
| `claude plugin validate --strict` | ✔ Passed (chỉ có một gợi ý về README, không ảnh hưởng verdict) |
| Cài marketplace cục bộ trong `CLAUDE_CONFIG_DIR` cô lập | ✔ Nạp 3 component: `intent-review`, `spec-review`, `sdlc-check`; không có `_template` |
| Mô phỏng cache (xuất `git archive` ra thư mục khác, chạy CLI từ đó) | ✔ `init` tạo skill local; `check` đạt 10/10 |
| `claude -p "/ai-sdlc-kit:sdlc-check <dir>"` với `--plugin-dir` | ✔ `${CLAUDE_PLUGIN_ROOT}` và `$ARGUMENTS` được thay thế đúng; kết quả 10/10 |
| `--plugin-dir` trỏ vào gốc repo | ✘ Nạp `ai-sdlc-kit:_template` (lỗi đã biết, cần dời template) |

**Chưa kiểm chứng:**
- Cài từ GitHub, tức là copy thật vào cache. `file://` không được chấp nhận làm nguồn marketplace; cần remote thật. Việc push là hành động công khai nên chưa làm.
- Hooks, `bin/`, giao diện `/plugin`, cài trên máy thứ hai.
- Repo private: cần xác nhận người dùng cài được qua git auth. Tài liệu có mục "Host and maintain a marketplace" về private repo, nhưng chưa đọc.

## 6. Rủi ro và quyết định cần có

1. **Trùng skill.** `ai-sdlc-kit init --agent claude` copy skill vào `.claude/skills/` và ghi routing vào `AGENTS.md`. Nếu đồng thời cài plugin, sẽ có `intent-review` và `ai-sdlc-kit:intent-review`. Đề xuất: chế độ plugin không copy local pack, routing trong `AGENTS.md` dùng tên đầy đủ. **Cần quyết định.**
2. **Lệnh ghi file từ plugin.** `init`/`update` ghi vào project với quyền người dùng. Khi đưa vào `commands/`, mặc định phải `--dry-run` và xác nhận trước khi ghi.
3. **Version.** Đề xuất: `plugin.json` pin semver khớp release tag, và CI kiểm tra ba nguồn version đồng nhất. Nếu bỏ `version`, người dùng sẽ theo commit SHA, mỗi commit là một bản cập nhật. **Cần quyết định.**
4. **Node ≥ 18** phải có trên máy người dùng.
5. **Repo private** nghĩa là người dùng phải có quyền đọc repo (đã ghi trong `cli/README.md`).
6. **`bin/` không được cài trên claude.ai và Cowork.** Không ảnh hưởng Claude Code.
7. **Không phải "mod".** Mod (xem skill `plugin-authoring`) là plugin có hooks module bằng JS để vẽ panel trong giao diện. Kit không cần điều đó.

## 7. Lộ trình đề xuất (chưa thực hiện, chờ duyệt)

**Đã làm** (working tree, chưa commit):

1. Dời `skills/_template/` → `templates/skill/SKILL.md`; cập nhật 6 chỗ tham chiếu (README hai ngôn ngữ, `skills/README.md`, `skills/registry.yml`).
2. Thêm `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (đã bỏ allowlist `skills`, vì không còn cần), và `commands/sdlc-check.md`.
3. CI job `cli-smoke`: thêm bước kiểm tra version đồng nhất (`cli --version` = `package.json` = `plugin.json`).

**Chưa làm:**

4. CI chạy `claude plugin validate --strict`: cần cài Claude Code trong CI, phải kiểm tra tên gói npm trước.
5. CLI: chế độ plugin cho `init`, không copy skill (xem §8c).
6. Command `init`/`update` với `--dry-run` mặc định (theo §6.2).
7. Cài từ GitHub private trên máy thứ hai, ghi kết quả vào tài liệu này. Validator đề xuất dòng cài đặt cho README: `/plugin install ai-sdlc-kit --marketplace ksi283/ai-sdlc-kit`. Chỉ thêm vào README sau khi bước 7 xác nhận chạy được.
8. Bản `docs/en/14-plugin-distribution.md`.

## 8. Quyết định

- **(a) Đã duyệt:** plugin = gốc repo.
- **(b) Áp dụng mặc định:** `plugin.json` pin `version`, bump cùng release và được CI kiểm tra khớp với `package.json` và CLI. Có thể đổi sang theo commit SHA nếu muốn.
- **(c) Chưa làm, chờ quyết định:** chế độ plugin cho `init` không copy skill. Hiện tại, cài plugin rồi chạy `init --agent claude` sẽ làm skill xuất hiện hai lần. Đây là thay đổi hành vi CLI nên cần duyệt riêng.

## 9. Kiểm chứng (working tree, Claude Code 2.1.296)

| Kiểm tra | Kết quả |
|---|---|
| Replay các bước `cli-smoke` trong `tests.yml` (init/check, help tiếng Việt, update ×5, install.sh, pack lạ bị chặn, version) | ✔ Tất cả pass |
| Gate battery: `npm ci && npm test` trong `examples/money-web-app/app` | ✔ 22/22 |
| `claude plugin validate --strict` ở gốc repo | ✔ Passed |
| Cài marketplace từ working tree trong `CLAUDE_CONFIG_DIR` cô lập | ✔ 3 skill: `intent-review`, `spec-review`, `sdlc-check`; không có `_template` |
| `claude -p "/ai-sdlc-kit:sdlc-check /tmp/proj"` với `--plugin-dir` ở gốc repo | ✔ 10/10 |

Chưa kiểm chứng: cài từ GitHub thật (copy vào cache), hooks, `bin/`, giao diện `/plugin`.
