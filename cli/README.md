<div align="center">

# ai-sdlc-kit CLI

**Dựng khung và kiểm chứng dự án AI-SDLC bằng một lệnh — zero-dependency, Node ≥ 18.**

**Tiếng Việt** · [English](README.en.md)

</div>

---

CLI này tự động hóa hợp đồng bàn giao trong [`docs/vi/12-onboarding.md`](../docs/vi/12-onboarding.md): thành viên mới đi từ số 0 tới "gates xanh" mà không cần ai chỉ.

## Chạy

```bash
# ① Chạy thẳng — mỗi lệnh đều có tiền tố npx
npx github:ksi283/ai-sdlc-kit --help
npx github:ksi283/ai-sdlc-kit init my-app --skills intent-review --agent claude

# ② Cài lệnh toàn cục một lần, sau đó gọi bình thường
npm install -g github:ksi283/ai-sdlc-kit
ai-sdlc-kit --help --lang vi

# ③ Từ bản clone của kit
node cli/ai-sdlc-kit.mjs --help
```

> Bẫy hay gặp nhất: chạy `npx github:…` một lần rồi gọi `ai-sdlc-kit` trực tiếp sẽ báo `command not found` — npx là chạy-một-lần, không cài lệnh.

## Các lệnh

| Lệnh / tùy chọn | Chức năng |
|---|---|
| `init <dir>` | Scaffold project: AGENTS.md, templates, policy, CI, CODEOWNERS + auto-activation skills |
| `init <dir> --plugin` | (chỉ `claude`) không copy skill nội bộ: skill lấy từ plugin Claude Code `ai-sdlc-kit`, routing dùng tên `ai-sdlc-kit:<pack>` |
| `notify [dir]` | Hook SessionStart của plugin: nhắc khi dự án dựng bằng kit cũ hơn; im lặng khi không cần |
| `check [dir]` | Báo cáo wiring 10 điểm — **exit 1 khi thiếu**, dùng được như bước CI |
| `skill <pack> <dir>` | Cài một pack từ [`skills/registry.yml`](../skills/registry.yml) vào project |
| `update [dir]` | Đưa project lên phiên bản kit hiện tại: file chưa chỉnh được cập nhật, **file đã chỉnh được giữ nguyên**, file thiếu khôi phục, skills làm mới |
| `--agent <ide name>` | Chọn thư mục skill của nền tảng nhận cài (`claude` · `cursor` · `codex` · `zcode` · `gemini` · `copilot`) — không truyền sẽ mặc định `claude` kèm thông báo |
| `--lang vi\|en` | Đổi ngôn ngữ help + thông báo tiến trình (lỗi kỹ thuật giữ tiếng Anh) |
| `--skills <list>` | Danh sách pack phẩy tách; pack lạ bị chặn **trước khi** ghi file |
| `--force` / `--dry-run` | Scaffold đè vào thư mục có sẵn / chỉ xem sẽ tạo gì |

## Agent được hỗ trợ

`--agent` chọn thư mục skill của agent. Routing trong `AGENTS.md` ghi đường dẫn cụ thể tới `SKILL.md` của từng pack, nên agent đọc `AGENTS.md` vẫn mở được file kể cả khi không tự nạp skill.

| Agent | Thư mục skill | Đọc `AGENTS.md` | Mức xác minh |
|---|---|---|---|
| Claude Code (`claude`) | `.claude/skills/` | Có, khi không có `CLAUDE.md` (Claude Code v2.1.277 trở lên). Nếu có `CLAUDE.md`, thêm dòng `@AGENTS.md` vào đó | Đã xác minh: [tài liệu memory](https://code.claude.com/docs/en/memory), [tài liệu skills](https://code.claude.com/docs/en/skills) |
| Codex (`codex`) | `.agents/skills/` | Có, ở gốc thư mục Git (Codex đi từ gốc xuống thư mục hiện tại) | Đã xác minh: [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [Codex skills](https://learn.chatgpt.com/docs/build-skills.md) |
| Cursor (`cursor`) | `.cursor/skills/` (cũng đọc `.agents/skills/`, `.claude/skills/`, `.codex/skills/`) | Có, ở gốc thư mục; cũng hỗ trợ thư mục con | Đã xác minh: [Cursor rules](https://cursor.com/docs/context/rules), [Cursor skills](https://cursor.com/docs/skills) |
| ZCode (`zcode`) | `.zcode/skills/` | Có, ở gốc thư mục, tương tự Claude Code (xác nhận bởi maintainer) | **Chưa xác minh** thư mục skill. Routing vẫn trỏ đúng đường dẫn file |
| Gemini CLI (`gemini`) | `.gemini/skills/` | Không mặc định. Kit tạo `GEMINI.md` có dòng `@AGENTS.md`, nên Gemini đọc được routing | Đã xác minh: [Gemini CLI skills](https://geminicli.com/docs/cli/skills), [GEMINI.md](https://geminicli.com/docs/cli/gemini-md.md) |
| Copilot (`copilot`) | `.github/skills/` | Có, ở gốc thư mục: coding agent, Copilot CLI và code review trên GitHub.com (vị trí gốc theo xác nhận của maintainer) | Đã xác minh: [Copilot skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills), [custom instructions](https://docs.github.com/en/copilot/reference/custom-instructions-support) |

## Ghi chú

- **Idempotent**: chạy lại `init`/`skill`/`update` không nhân đôi block AGENTS.md.
- **`.ai-sdlc-kit.json`** (do `init` ghi) lưu phiên bản kit + hash baseline — commit file này; `update` dùng nó để không bao giờ đè chỉnh sửa của project.
- **Chế độ plugin** (`init --plugin`): `.ai-sdlc-kit.json` ghi `"mode": "plugin"`; `update` và `skill` không copy skill nội bộ nữa. Dự án cũ không có trường `mode` được coi là `copy`.
- **Registry-first**: chỉ cài pack đã đăng ký trong `skills/registry.yml` (qua PR).
- Repo đang private → npx/npm cài từ GitHub cần quyền truy cập repo của bạn.
- Bản thân kit không phải package để import (`private: true`); publish npm là quyết định của v2.
