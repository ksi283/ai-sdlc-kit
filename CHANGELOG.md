# Changelog

Mọi thay đổi đáng chú ý của ai-sdlc-kit được ghi tại đây. Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/), phiên bản theo [Semantic Versioning](https://semver.org/lang/vi/).

Git tag `v1.7.1` đánh dấu bản phát hành này. Các bản 1.5.0 đến 1.7.0 chưa có tag; ngày của chúng là ngày của commit phát hành, dựng lại từ lịch sử git.

**Plugin Claude Code:** plugin theo dõi commit (SHA), không theo số phiên bản này. Khi kit có bản phát hành mới, hook SessionStart hỏi người dùng có muốn cập nhật dự án không; hook không tự cập nhật. Chi tiết xem [docs/vi/14-plugin-distribution.md](docs/vi/14-plugin-distribution.md) §10.

## [Unreleased]

### Thêm
- Command `/ai-sdlc-kit:init <dir> [--skills …] [--force]`: khởi tạo dự án ngay trong Claude Code, ở chế độ plugin (`init --plugin`). Command chạy `--dry-run` trước, liệt kê những gì sẽ ghi, và chỉ ghi sau khi người dùng xác nhận. Không tự thêm `--force`; nếu thư mục không rỗng, command dừng và hỏi.

### Sửa lỗi
- `init --plugin --dry-run` in `skill (local)` thay vì `skill (plugin)`. Bản xem trước giờ khớp với lần chạy thật.

## [1.7.1] - 2026-11-04

### Thêm
- Đóng gói thành plugin Claude Code: `.claude-plugin/plugin.json` và marketplace một plugin ở gốc repo. Plugin không khai `version`, nên theo commit.
- Command `/ai-sdlc-kit:sdlc-check`: báo cáo wiring của dự án, chỉ đọc, không ghi file.
- Hook SessionStart (`hooks/hooks.json`) chạy `ai-sdlc-kit notify`. Nếu dự án được dựng bằng bản kit cũ, hook hiện yêu cầu người dùng quyết định có chạy `update` hay không. Hook không tự chạy `update`.
- `ai-sdlc-kit notify [dir]`: lệnh mà hook gọi. Im lặng trừ khi dự án cũ hơn bản kit hiện tại.
- `ai-sdlc-kit init --plugin` (chỉ `claude`): không copy skill nội bộ. Routing dùng tên `ai-sdlc-kit:<pack>`, và manifest ghi `"mode": "plugin"`.
- Hỗ trợ Gemini CLI (`--agent gemini`, thư mục `.gemini/skills/`) và GitHub Copilot (`--agent copilot`, thư mục `.github/skills/`). Với Gemini, kit tạo `GEMINI.md` có dòng `@AGENTS.md`, vì Gemini không đọc `AGENTS.md` mặc định.
- CI: kiểm tra vòng khứ hồi cho chế độ plugin, các dòng routing và `notify`.

### Thay đổi
- Template skill chuyển từ `skills/_template/` sang `templates/skill/SKILL.md`. Khi tạo skill mới, hãy copy từ đường dẫn mới. Claude Code nạp mọi thư mục dưới `skills/` như một skill, nên template phải chuyển ra ngoài.
- Kiểm tra version trong CI: `package.json` và CLI phải khớp nhau, và `plugin.json` không được khai `version`.
- Routing trong `AGENTS.md` ghi đường dẫn cụ thể tới `SKILL.md` của từng pack (ví dụ `.cursor/skills/<pack>/SKILL.md`). Agent nào đọc `AGENTS.md` cũng mở được file đó, kể cả khi agent không tự nạp skill.
- Ánh xạ thư mục theo agent được gom vào một chỗ trong CLI; `skill` không còn định nghĩa lại.
- `skills/install.sh` là lớp bọc mỏng gọi `ai-sdlc-kit skill`, nên không còn hai bản triển khai có thể lệch nhau. Cần Node ≥ 18.
- `check` cảnh báo khi `CLAUDE.md` tồn tại mà không có dòng `@AGENTS.md`, vì Claude Code khi đó bỏ qua `AGENTS.md`.
- CI kiểm tra từng agent (`claude`, `cursor`, `codex`, `zcode`): thư mục skill, đường dẫn trong routing, và `install.sh` cho cùng kết quả.
- README CLI có bảng các agent, kèm mức xác minh của từng agent.

### Sửa lỗi
- `ai-sdlc-kit skill <pack>` không còn làm mất các dòng routing của pack đã cài trong dự án.
- Routing liệt kê cả pack đã có trên đĩa, kể cả khi dự án không có `.ai-sdlc-kit.json`, nên `AGENTS.md` không còn thiếu pack.

## [1.7.0] - 2026-10-22

### Thêm
- `ai-sdlc-kit update [dir] [--dry-run] [--force]`. File dự án chưa chỉnh sửa được cập nhật; file đã chỉnh sửa được giữ nguyên; file thiếu được khôi phục; skill được làm mới; block routing trong AGENTS.md được nối lại.
- `init` ghi `.ai-sdlc-kit.json`: phiên bản kit, agent, danh sách skill và hash gốc của từng file do kit quản lý.
- `check` báo dự án đang cũ hơn bản kit. Đây chỉ là thông tin, không làm lệnh thất bại.
- CI: kiểm tra hồi quy cho `update`. File bị bỏ qua giữ nguyên chỉnh sửa, `--force` ghi đè, và lần chạy thứ hai hội tụ.

### Sửa lỗi
- Đặt lại hash gốc của file bị bỏ qua thành hash của dự án có thể khiến lần `update` sau ghi đè chỉnh sửa cục bộ. Hash gốc nay luôn tham chiếu phiên bản kit.

## [1.6.0] - 2026-10-22

### Thay đổi
- **Phá vỡ tương thích:** `--ai` đổi thành `--agent` trên `init`, `skill` và `skills/install.sh`. `--ai` vẫn chạy như alias đã ngừng khuyến nghị.
- Khi không truyền cờ agent, CLI in thông báo rõ ràng rằng mặc định là `claude`.

## [1.5.1] - 2026-10-22

### Thêm
- Registry skill pack (`skills/registry.yml`) với routing tự kích hoạt được ghi vào AGENTS.md.
- Skill `spec-review` (cổng Definition-of-Ready).
- Hướng dẫn onboarding (`docs/en/12`, `docs/vi/12`) và roadmap v2 (`docs/*/13`).

### Sửa lỗi
- Cách dùng `npx`: chạy `npx` trần không cài lệnh. Tài liệu nay ghi rõ dạng có tiền tố hoặc cài toàn cục.
- CI của dự án mới được scaffold không còn lỗi khi chưa có `package.json`.
- Nút chuyển ngôn ngữ không dùng emoji cờ nữa, vì Windows hiển thị chúng thành cặp chữ cái.

## [1.5.0] - 2026-10-22

### Thêm
- CLI có phiên bản đầu tiên, không phụ thuộc bên ngoài (Node ≥ 18): `init`, `check`, `skill`.
- Đầu ra CLI song ngữ (`--lang vi|en`).
- CI: gate battery cho ví dụ tham chiếu, và job `cli-smoke` (scaffold rồi check).

Trước 1.5.0, repo chứa tài liệu framework, template và ví dụ ứng dụng, chưa có bản phát hành có phiên bản. Xem `git log` để biết lịch sử đó.
