<div align="center">

# AI-SDLC Kit

**Bộ quy trình phát triển phần mềm tăng cường AI — khung lõi, template dùng ngay, CLI và ứng dụng kiểm chứng.**

[![version](https://img.shields.io/badge/version-1.7.0-blue)]() [![license](https://img.shields.io/badge/license-Apache--2.0-green)](LICENSE) [![node](https://img.shields.io/badge/node-%E2%89%A518-339933)]() [![docs](https://img.shields.io/badge/docs-EN%20%7C%20VI-informational)]()

**Tiếng Việt** · [English](README.en.md)

</div>

---

Viết code không còn là điểm nghẽn — *xác minh, governance và đo lường* mới là. Kit này cung cấp một quy trình phần mềm hoàn chỉnh cho thời đại AI: **6 giai đoạn khép vòng · mức tự chủ kiếm bằng bằng chứng · quality gates 3 cấp · bộ metric 5 nhóm**, kèm template áp dụng ngay và một ứng dụng chạy được để chứng minh toàn bộ lý thuyết không nằm trên giấy.

| | |
|---|---|
| **Trạng thái** | Sẵn sàng |
| **Ngôn ngữ** | Hướng dẫn song ngữ EN/VI  |
| **Tính trung lập** | Không ràng buộc vendor — Claude Code / Codex / Cursor / bất kỳ agent nào |

## Mục lục

1. [Vì sao cần kit này](#1-vì-sao-cần-kit-này)
2. [Kiến trúc](#2-kiến-trúc)
3. [Cài đặt](#3-cài-đặt)
4. [Bắt đầu nhanh](#4-bắt-đầu-nhanh)
5. [Có gì trong kit](#5-có-gì-trong-kit)
6. [Bản đồ tài liệu](#6-bản-đồ-tài-liệu)
7. [Cơ chế skill packs](#7-cơ-chế-skill-packs)
8. [Ví dụ minh họa](#8-ví-dụ-minh-họa)
9. [Nguồn tham khảo](#9-nguồn-tham-khảo)
10. [Giấy phép](#10-giấy-phép)

---

## 1. Vì sao cần kit này

Bốn con số định hình toàn bộ thiết kế:

| Dữ kiện | Hệ quả |
|---|---|
| METR: dev dùng AI **chậm hơn 19%** nhưng tin mình **nhanh hơn 20%** | Cảm nhận chủ quan không ra quyết định được — phải đo |
| DORA: +25% áp dụng AI ↔ **−7,2%** độ ổn định | Tốc độ phải đi cùng gates |
| Faros: thời gian review **+91%** | **Review là nút thắt mới**, không phải viết code |
| Chỉ **1/5** tổ chức có governance trưởng thành | Khoảng trống cần lấp bằng cơ chế, không phải công cụ lẻ |

→ Đọc phân tích đầy đủ: [`docs/vi/01-research-synthesis.md`](docs/vi/01-research-synthesis.md).

## 2. Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                   LỚP 1 · VÒNG ĐỜI                             │
│                                                                 │
│   PLAN ─► DESIGN ─► BUILD ─► TEST ─► DEPLOY ─► MAINTAIN ──┐     │
│  (intent) (spec+plan) (agent     (xác   (phát     (giám   │     │
│                          thực)    minh)  hành)     sát)    │     │
│     ▲        ▲         ▲         ▲        ▲               │     │
│   DoR       DoR      Build    Quality   Deploy      metric lệch │
│   gate      gate      Ready    gates     gates           band   │
│     ▲        ▲         ▲         ▲        ▲               │     │
│   ══════════ LỚP 3 · QUALITY GATES (3 cấp) ══════════ ┌───┴───┐ │
│                                                        │intent │ │
│  ┌─────────────────────────────────────────────────┐   │.md MỚI│ │
│  │        LỚP 2 · ĐIỀU PHỐI                        │   └───────┘ │
│  │  Routing theo độ phức tạp (1–10) · Tự chủ L0–L3 │             │
│  │  Cross-harness review · Human-in-the-loop       │             │
│  └─────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

- **Lớp 1 — Vòng đời:** 6 giai đoạn khép kín bằng vòng phản hồi từ production.
- **Lớp 2 — Điều phối:** ai làm gì, ở mức tự chủ nào, review thế nào.
- **Lớp 3 — Nền tảng tin cậy:** gates, policy, metrics, knowledge-as-code.

Chi tiết từng giai đoạn xem tại: [`docs/vi/02-framework.md`](docs/vi/02-framework.md).

## 3. Cài đặt

CLI zero-dependency (Node ≥ 18). Ba cách, chọn một:

```bash
# ① Chạy thẳng — mỗi lệnh đều có tiền tố npx
npx github:ksi283/ai-sdlc-kit init my-app --skills intent-review --agent claude

# ② Cài lệnh toàn cục một lần, sau đó gọi bình thường
npm install -g github:ksi283/ai-sdlc-kit
ai-sdlc-kit init my-app && ai-sdlc-kit check my-app

# ③ Từ bản clone của kit
node cli/ai-sdlc-kit.mjs --help          # thêm --lang vi cho help tiếng Việt
```

| Lệnh / tùy chọn | Chức năng |
|---|---|
| `init <dir>` | Scaffold project |
| `check [dir]` | Báo cáo wiring 10 điểm — **exit 1 khi thiếu** |
| `skill <pack> <dir>` | Cài một pack từ registry vào project |
| `update [dir]` | Nâng project lên phiên bản kit hiện tại (giữ nguyên file project đã chỉnh) |
| `--agent <ide name>` | Chọn thư mục skill của nền tảng nhận cài (`claude` · `cursor` · `codex` · `zcode`) |

Chi tiết: [`cli/README.md`](cli/README.md).

### Cập nhật kit

`init` ghi `.ai-sdlc-kit.json` vào project (phiên bản kit, agent, skills, hash baseline của từng file kit sở hữu) — **commit file này cùng project**. Khi kit phát hành bản mới:

```bash
ai-sdlc-kit update my-app            # xem trước: thêm --dry-run
```

An toàn theo thiết kế: file chưa chỉnh → cập nhật; **file project đã chỉnh → giữ nguyên** (báo `skipped`, tự diff tay hoặc `--force` để ghi đè); file bị xóa → khôi phục; skills làm mới + block `AGENTS.md` nối lại. Chạy lại bao nhiêu lần cũng idempotent.

## 4. Bắt đầu nhanh

**Tải về & chạy thử ứng dụng kiểm chứng:**

```bash
git clone https://github.com/ksi283/ai-sdlc-kit.git && cd ai-sdlc-kit
# đọc đúng 2 tài liệu: docs/vi/02-framework.md + docs/vi/07-adoption.md
cd examples/money-web-app/app && npm install && npm test   # 22/22 test = gate battery
npm start                                                   # → http://localhost:3000
```


## 5. Có gì trong kit

| Thành phần | Nội dung | Vai trò |
|---|---|---|
| `docs/` | 13 hướng dẫn × 2 ngôn ngữ (EN + VI) | Học thuyết: từ nghiên cứu → khung → bảo mật → roadmap v2 |
| `templates/` | 13 file dùng ngay (tiếng Anh) | Artifact dự án thật: intent, spec, plan, gates, threat model… |
| `skills/` | Registry + installer + 2 skill tự viết | Cơ chế skill packs với auto-activation |
| `cli/` | `ai-sdlc-kit` zero-dependency | Scaffold + kiểm chứng wiring |
| `examples/` | 2 ví dụ đi trọn vòng đời, 1 app chạy được | Kiểm chứng bằng thực hành |
| `.github/` | CI 3 jobs | Gate battery + cli-smoke + install.sh round-trip |

## 6. Bản đồ tài liệu

| # | Tài liệu | Trả lời câu hỏi |
|---|---|---|
| 01 | [Nghiên cứu](docs/vi/01-research-synthesis.md) | Vì sao thiết kế như vậy? |
| 02 | [Khung lõi](docs/vi/02-framework.md) | Quy trình vận hành thế nào? |
| 03 | [Tổ chức & tự chủ](docs/vi/03-org-autonomy.md) | Ai làm gì? Agent được quyền gì? |
| 04 | [Gates & chính sách](docs/vi/04-gates-policy.md) | Chặn gì, ở đâu, cứng đến đâu? |
| 05 | [Metrics](docs/vi/05-metrics.md) | Đo gì để ra quyết định? |
| 06 | [Công cụ](docs/vi/06-toolchain.md) | Chọn stack nào, model nào cho pha nào? |
| 07 | [Lộ trình áp dụng](docs/vi/07-adoption.md) | Bắt đầu từ đâu không bị ngợp? |
| 08 | [Bảo mật & DevSecOps](docs/vi/08-security.md) | Bảo mật sản phẩm xuyên suốt vòng đời? |
| 09 | [Discovery & UX](docs/vi/09-discovery-ux.md) | Xây đúng thứ trước khi xây nhanh? |
| 10 | [Vận hành giao hàng](docs/vi/10-delivery-ops.md) | Ước lượng, versioning, tech debt? |
| 11 | [Portfolio](docs/vi/11-portfolio.md) | Ưu tiên gì, quản vendor thế nào? |
| 12 | [Onboarding](docs/vi/12-onboarding.md) | Người mới tự phục vụ được chưa? |
| 13 | [Kế hoạch v2](docs/vi/13-roadmap-v2.md) | Cả team dùng mà không loạn? |

## 7. Cơ chế skill packs

Skill pack = năng lực đóng gói cho AI agent (thiết kế, review chuẩn, quy ước domain). Hai luồng tách bạch:

```
PUBLISH (1 lần, qua PR):  skills/_template/ → skills/<tên>/ → đăng ký registry.yml
INSTALL  (mỗi project):   skills/install.sh <pack> <dir> --agent <nền-tảng>
                          → copy pack + tự sinh bảng routing vào AGENTS.md
                          → agent chủ động nạp đúng pack cho đúng việc
```

Registry hiện có:
- `ui-ux-pro-max`
- `intent-review`
- `spec-review`

## 8. Ví dụ minh họa

| Ví dụ | Tên ứng dụng |
|---|---|
| [`mini-todo-api`](examples/mini-todo-api/) | Todo API — vòng chạy đầu tiên |
| [`money-web-app`](examples/money-web-app/) | PocketLedger — money-tracking web app with auth |

> Cả hai là walkthrough quy trình, **không dùng để deploy production**.

## 9. Nguồn tham khảo

1. **Anthropic — The AI-native SDLC Playbook** (Claude Academy, 2026) — <https://academy.claude.com/courses/ai-native-sdlc-playbook>
2. **Microsoft — An AI-led SDLC** (Azure Blog, 2026) — <https://techcommunity.microsoft.com/blog/appsonazureblog/an-ai-led-sdlc-building-an-end-to-end-agentic-software-development-lifecycle-wit/4491896>
3. **AI-SDLC Framework** (ai-sdlc.io, Apache-2.0) — <https://ai-sdlc.io/docs>

## 10. Giấy phép

Phát hành theo **[Apache License 2.0](LICENSE)** — tự do sử dụng, sửa đổi, phân phối kèm điều khoản ghi nguồn và bảo hộ bằng sáng chế. Kit là tác phẩm độc lập; các nguồn tham khảo chỉ được trích dẫn cho mục đích học tập.
