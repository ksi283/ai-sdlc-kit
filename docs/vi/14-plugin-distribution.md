# 14 · Đưa kit vào Claude Code dưới dạng plugin — nghiên cứu khả thi

> Trạng thái: **(a), (b), (c) đã quyết định.** Nhánh `feat/claude-plugin` có 4 commit đầu; thay đổi cho (b) và (c) đang ở working tree, chưa commit. Chưa push. Chưa kiểm chứng cài từ GitHub thật.
> Đối chiếu tài liệu chính thức của Claude Code ngày 2026-11-04, với Claude Code 2.1.296.
> *(English mirror: chưa có — theo quy ước repo, bản `docs/en/` sẽ viết sau khi phương án được duyệt.)*

---

## 1. Kết luận

- **Khả thi, chi phí thấp.** Hai skill hiện có (`skills/intent-review`, `skills/spec-review`) đã đúng format plugin (`<name>/SKILL.md` với `name` + `description`). Không cần viết lại nội dung skill.
- **Các thay đổi đã làm:**
  1. `.claude-plugin/plugin.json` và `marketplace.json` ở gốc repo. `plugin.json` **không** khai `version`, nên plugin theo commit SHA (§8b, §10).
  2. Dời `skills/_template/` ra khỏi `skills/`. Nếu không, template bị nạp thành skill `_template` (§4).
  3. `commands/sdlc-check.md` gọi CLI qua `${CLAUDE_PLUGIN_ROOT}`.
  4. `hooks/hooks.json`: hook SessionStart gọi `notify`, để nhắc người dùng khi dự án đang ở bản kit cũ.
  5. CLI: `init --plugin` không copy skill nội bộ (§8c). Đã sửa một lỗi có sẵn: `skill <pack>` làm mất dòng routing của các pack khác.
- Kiểm chứng đầy đủ ở §9.

## 2. Plugin của Claude Code: đặc tả liên quan

| Thành phần | Vị trí mặc định | Kit dùng? |
|---|---|---|
| Manifest | `.claude-plugin/plugin.json` — chỉ `name` là bắt buộc | Có |
| Skills | `skills/<name>/SKILL.md` | Có (2 skill) |
| Commands | `commands/<file>.md` → lệnh `/<plugin>:<file>` | Có (`sdlc-check`) |
| Hooks | `hooks/hooks.json` | Có: SessionStart → `notify` (§10) |
| Executables | `bin/` → lên PATH của Bash tool khi plugin bật | Chưa (có thể đưa `ai-sdlc-kit` vào PATH) |
| Agents, MCP, LSP, output styles | — | Không cần |

Quy tắc đường dẫn trong manifest: phải bắt đầu bằng `./`, nằm trong thư mục plugin, không chứa `..`, không symlink ra ngoài.

Cài đặt và namespace:

```bash
claude plugin marketplace add <owner>/<repo>        # hoặc đường dẫn cục bộ ./path
claude plugin install ai-sdlc-kit@<marketplace>
```

Trong phiên: `/plugin`. Skill và command của plugin được namespace: `/ai-sdlc-kit:<tên>`.

Nguồn: `code.claude.com/docs/en/plugins`, `plugins-reference`, `plugin-marketplaces`, `plugins/components`, `plugins/loading`, `hooks`.

## 3. Đối chiếu với repo hiện tại

| Hạng mục | Hiện trạng | Đánh giá |
|---|---|---|
| Format skill | `SKILL.md` có `name` + `description` ("USE WHEN …") | Khớp, không đổi |
| `skills/_template/` | Có `SKILL.md` placeholder | Đã dời sang `templates/skill/` (§7) |
| CLI đọc tài nguyên | `cli/ai-sdlc-kit.mjs` đọc `templates/`, `skills/registry.yml`, `skills/<pack>/` theo đường dẫn tương đối | Phải nằm trong cây plugin → plugin root = gốc repo |
| Kích thước | Tracked tree ~1.10 MB, phần lớn là screenshot trong `examples/` | Chấp nhận được khi copy vào cache |
| Số version | `package.json` và `const VERSION` trong CLI (CI kiểm tra khớp). `plugin.json` không khai `version` | Plugin theo SHA; số phát hành nằm ở `package.json` |
| Runtime | CLI cần Node ≥ 18 trên PATH của người dùng | Plugin không bundle Node |

## 4. Ba phương án cấu trúc

**A. Plugin = gốc repo (đã chọn).** Marketplace entry `"source": "./"`, không nhân bản file.
- Ưu: một nguồn chân lý; CLI và skill luôn cùng phiên bản; không có bước build.
- Nhược: cache chứa cả `examples/`, `docs/`; `_template` phải dời; mọi file repo đều thành phần của plugin.

**B. Thư mục `plugin/` do CI build** (copy `cli/`, `templates/`, `skills/` vào).
- Ưu: cache gọn.
- Nhược: nhân bản → dễ trôi nguồn. Đi ngược nguyên tắc single-source đã nêu ở [`docs/vi/13-roadmap-v2.md`](13-roadmap-v2.md) (C2, C5).

**C. Repo plugin riêng**, đồng bộ bằng CI.
- Nhược: thêm một repo phải bảo trì, và cùng vấn đề nhân bản như B.

**Chọn A.** Lý do chính: kit tự mô tả mình là "một nguồn chân lý, đổi qua PR"; nhân bản sẽ tái tạo đúng loại trôi phiên bản mà kit sinh ra để chống.

### Vì sao phải dời `_template`

Đã kiểm chứng: `claude --plugin-dir <gốc-repo>` nạp cả `ai-sdlc-kit:_template`. Allowlist `skills` trong marketplace entry chỉ lọc được khi cài qua marketplace, nên hai đường cài cho kết quả khác nhau. Cách sạch là dời template khỏi `skills/`. Sau khi dời, allowlist không còn cần và đã bỏ.

## 5. Prototype và kết quả

Prototype ban đầu nằm ở `/tmp` (commit `8d56ffb`, scratch). Từ đó, các file đã được đưa vào repo theo §7 nên không còn cần prototype. Kết quả kiểm chứng chính:

| Kiểm tra | Kết quả |
|---|---|
| `claude plugin validate` (plugin và marketplace) | ✔ Passed (sau khi bỏ `version`: passed with warning, xem §10) |
| Cài marketplace cục bộ trong `CLAUDE_CONFIG_DIR` cô lập | ✔ Nạp 3 component: `intent-review`, `spec-review`, `sdlc-check`; không có `_template` |
| Mô phỏng cache (xuất `git archive` ra thư mục khác, chạy CLI từ đó) | ✔ `init` tạo skill local; `check` đạt 10/10 |
| `claude -p "/ai-sdlc-kit:sdlc-check <dir>"` với `--plugin-dir` | ✔ `${CLAUDE_PLUGIN_ROOT}` và `$ARGUMENTS` được thay thế đúng; kết quả 10/10 |
| `--plugin-dir` trỏ vào gốc repo, khi còn `skills/_template/` | ✘ Nạp `ai-sdlc-kit:_template` (lỗi đã biết, đã sửa bằng cách dời template) |

## 6. Rủi ro và quyết định

1. **Trùng skill.** Đã giải quyết bằng `init --plugin` (§8c). Dự án cũ vẫn ở chế độ copy, không đổi.
2. **Lệnh ghi file từ plugin.** `init`/`update` ghi vào project với quyền người dùng. Khi đưa vào `commands/`, mặc định phải `--dry-run` và xác nhận trước khi ghi. Chưa làm (§7).
3. **Version.** Đã quyết định (b): theo SHA cho plugin, số phát hành cho thông báo (§10).
4. **Node ≥ 18** phải có trên máy người dùng.
5. **Repo private** nghĩa là người dùng phải có quyền đọc repo (đã ghi trong `cli/README.md`).
6. **`bin/` không được cài trên claude.ai và Cowork.** Không ảnh hưởng Claude Code.
7. **Không phải "mod".** Mod (xem skill `plugin-authoring`) là plugin có hooks module bằng JS để vẽ panel trong giao diện. Kit không cần điều đó.
8. **Thông báo không có changelog.** Hook nói "có bản mới" nhưng người dùng chưa biết bản đó đổi gì. Repo chưa có `CHANGELOG`. Cần có trước khi phát hành rộng (§7).
9. **`--strict` không dùng được ở chế độ SHA.** Validator coi thiếu `version` là cảnh báo, và `--strict` biến cảnh báo thành lỗi. CI không chạy `--strict`.

## 7. Lộ trình

**Đã làm** (nhánh `feat/claude-plugin`):

1. Commit 1–4: dời template; manifest, marketplace và command; CI kiểm tra version; tài liệu nghiên cứu.
2. Working tree, cho (b): bỏ `version` khỏi `plugin.json`; thêm `hooks/hooks.json` (SessionStart → `notify`); CI kiểm tra plugin không khai `version` và `hooks.json` hợp lệ.
3. Working tree, cho (c): `init --plugin`; `mode` trong `.ai-sdlc-kit.json`; `update`, `skill` và `check` tôn trọng mode; lệnh `notify`.
4. Sửa lỗi có sẵn: `skill <pack>` ghi đè routing của các pack đã cài. Đã tái hiện trước khi sửa, đã kiểm chứng sau khi sửa.

**Chưa làm:**

5. Cài từ GitHub thật, kiểm chứng trên máy thứ hai.
6. `CHANGELOG.md` trước khi phát hành đầu tiên dùng cơ chế thông báo (§6.8).
7. Command `init`/`update` với `--dry-run` mặc định (§6.2).
8. Dòng cài plugin trong README, sau khi bước 5 xác nhận chạy được. Validator đề xuất `/plugin install ai-sdlc-kit --marketplace ksi283/ai-sdlc-kit`, cần kiểm chứng trước.
9. Bản `docs/en/14-plugin-distribution.md`.

## 8. Quyết định

- **(a) Đã duyệt:** plugin = gốc repo.
- **(b) Đã duyệt: theo SHA.** `plugin.json` không khai `version`, nên mỗi commit trên `main` là một bản Claude Code có thể cập nhật. Khi **số phát hành** (`package.json`) đổi, dự án đang ở bản cũ sẽ nhận yêu cầu quyết định qua hook SessionStart (§10). Không ai bị ép cập nhật.
- **(c) Đã duyệt và triển khai: phương án 2.** `ai-sdlc-kit init --agent claude --plugin` không copy skill nội bộ; routing dùng tên `ai-sdlc-kit:<pack>`; manifest ghi `mode: "plugin"`. Mặc định vẫn là copy, nên dự án hiện có không đổi.

## 9. Kiểm chứng

Claude Code 2.1.296, trên working tree.

| Kiểm tra | Kết quả |
|---|---|
| Replay toàn bộ `cli-smoke` trong `tests.yml`, kể cả 4 bước mới (plugin-mode, skill giữ routing, notify, version) | ✔ Tất cả pass |
| Gate battery: `npm ci && npm test` trong `examples/money-web-app/app` (chạy trước các thay đổi CLI cho (c) và (b); không liên quan tới `cli/`) | ✔ 22/22 |
| Bug `skill <pack>` ghi đè routing | ✔ Đã tái hiện trước khi sửa (chỉ còn `spec-review`); sau khi sửa cả hai dòng đều còn |
| `claude plugin validate` (không strict) | ✔ Passed with warning: `No version specified` (kỳ vọng, do theo SHA) |
| Cài từ working tree trong `CLAUDE_CONFIG_DIR` cô lập | ✔ Skills 3, `Hooks (1) SessionStart` |
| Phiên Claude thật (`-p`) mở ở dự án đang ở 1.6.0 | ✔ Hook chạy; Claude nhận `additionalContext` và trích lại nguyên văn |

Chưa kiểm chứng: `systemMessage` có hiện trong giao diện TUI không (chế độ `-p` không hiển thị); cài từ GitHub thật; hooks trên máy thứ hai; `bin/`.

## 10. Cơ chế cập nhật (b)

Có hai kênh cập nhật, tách nhau:

| Kênh | Cập nhật cái gì | Ai quyết định |
|---|---|---|
| Plugin (Claude Code) | Skill, command, hook, CLI — theo SHA | Người dùng chạy `claude plugin update`. Marketplace bên thứ ba không tự cập nhật mặc định |
| Dự án (`ai-sdlc-kit update`) | Template, policy, CI, bản copy skill (mode copy), routing | Người dùng. File đã chỉnh được giữ nguyên |

Luồng yêu cầu quyết định:

1. Maintainer merge commit lên `main`. Người dùng cập nhật plugin theo SHA, không cần tăng version.
2. Maintainer phát hành: tăng `package.json` và `VERSION` của CLI. CI đảm bảo hai nơi khớp.
3. Mở phiên Claude Code trong dự án có `.ai-sdlc-kit.json` cũ hơn. Hook `notify` in `systemMessage` (người dùng thấy) và đưa `additionalContext` cho Claude. Claude được dặn không tự chạy `update`, mà nêu lựa chọn cho người dùng.
4. Người dùng chọn: `npx github:ksi283/ai-sdlc-kit update <dir>` để áp dụng, hoặc bỏ qua.

Hạn chế:

- **Không có changelog.** Thông báo chỉ nói có bản mới (§6.8).
- **Thông báo lặp ở mỗi phiên** cho tới khi dự án được cập nhật. Đây là chủ đích: yêu cầu cần được nhìn thấy. Nhưng có thể gây khó chịu.
- **`npx github:…` không gắn tag**, nên lệnh trong thông báo lấy `main`, không phải bản đã phát hành. Cần cân nhắc gắn tag.
- **Thiếu `version` làm validator cảnh báo**, và `--strict` không dùng được (§6.9).
