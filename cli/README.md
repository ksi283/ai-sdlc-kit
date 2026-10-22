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
| `check [dir]` | Báo cáo wiring 10 điểm — **exit 1 khi thiếu**, dùng được như bước CI |
| `skill <pack> <dir>` | Cài một pack từ [`skills/registry.yml`](../skills/registry.yml) vào project |
| `--agent <ide name>` | Chọn thư mục skill của nền tảng nhận cài (`claude` · `cursor` · `codex` · `zcode`) — không truyền sẽ mặc định `claude` kèm thông báo |
| `--lang vi\|en` | Đổi ngôn ngữ help + thông báo tiến trình (lỗi kỹ thuật giữ tiếng Anh) |
| `--skills <list>` | Danh sách pack phẩy tách; pack lạ bị chặn **trước khi** ghi file |
| `--force` / `--dry-run` | Scaffold đè vào thư mục có sẵn / chỉ xem sẽ tạo gì |

## Ghi chú

- **Idempotent**: chạy lại `init`/`skill` không nhân đôi block AGENTS.md.
- **Registry-first**: chỉ cài pack đã đăng ký trong `skills/registry.yml` (qua PR).
- Repo đang private → npx/npm cài từ GitHub cần quyền truy cập repo của bạn.
- Bản thân kit không phải package để import (`private: true`); publish npm là quyết định của v2.
