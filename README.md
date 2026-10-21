# Bộ AI-SDLC cho Phát triển Phần mềm

> 🇻🇳 **Tiếng Việt** (mặc định) · [🇬🇧 English](README.en.md)

> Khung quy trình phát triển phần mềm tăng cường bằng AI (AI-augmented / AI-native SDLC) — tổng hợp, thiết kế từ các nguồn tham khảo hàng đầu, kèm bộ template dùng ngay và một ứng dụng mẫu chạy được để kiểm chứng.

**Phiên bản:** 1.3 · **Ngày:** 2026-10-22

---

## 1. Vì sao cần bộ AI-SDLC này?

AI đã đảo ngược nền kinh tế của phát triển phần mềm:

- **85%** lập trình viên dùng công cụ AI; **41%** mã nguồn trên GitHub do AI tạo ra — nhưng chỉ **1/5** doanh nghiệp có governance trưởng thành (ai-sdlc.io).
- Nghiên cứu METR: dev kỳ cựu dùng AI **chậm hơn 19%** trong khi tin mình **nhanh hơn 20%** — khoảng cách nhận thức 39 điểm.
- DORA: mỗi +25% mức áp dụng AI tương ứng **−7,2%** độ ổn định delivery.
- Faros AI: PR merged **+98%**, kích thước PR **+154%**, thời gian review **+91%** → **review là nút thắt mới**.

**Kết luận:** viết code không còn là điểm nghẽn — *xác minh (verification), governance và đo lường* mới là. Toàn bộ kit được thiết kế xoay quanh thực tế đó, và đã được kiểm chứng thực hành qua một ứng dụng mẫu chạy được (mục 6).

## 2. Thiết kế tổng thể: "3 lớp — 6 giai đoạn — 1 vòng lặp"

```
┌─────────────────────────────────────────────────────────────────┐
│                   LỚP 1: VÒNG ĐỜI (LIFECYCLE)                   │
│                                                                 │
│   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
│   │ PLAN │→ │DESIGN│→ │BUILD │→ │ TEST │→ │DEPLOY│→ │MAINT.│
│   └──────┘   └──────┘   └──────┘   └──────┘   └──────┘   └──┬───┘
│        ↑          ↑          ↑          ↑          ↑         │
│      DoR        DoR        DoR       Quality    Deploy    metric
│     gate        gate       gate       gates     gates     lệch
│        ↑          ↑          ↑          ↑          ↑       band
│   ═════════════ LỚP 3: QUALITY GATES ═════════════════  ┌────┴────┐
│                                                        │intent.md│
│  ┌─────────────────────────────────────────────────┐   │  MỚI    │
│  │     LỚP 2: ĐIỀU PHỐI (ORCHESTRATION)            │   └─────────┘
│  │  Routing theo độ phức tạp · Mức tự chủ L0–L3 ·  │
│  │  Orchestrator + Worker agents · Cross-harness   │
│  │  review · Human-in-the-loop                     │
│  └─────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

- **Lớp 1 — Vòng đời:** Plan → Design → Build → Test → Deploy → Maintain, khép kín bằng vòng phản hồi từ production (metric lệch band → intent mới).
- **Lớp 2 — Điều phối:** ai làm gì (human/agent), ở mức tự chủ nào, review thế nào.
- **Lớp 3 — Nền tảng tin cậy:** quality gates 3 cấp, metrics 5 nhóm, knowledge-as-code, zero-trust.

## 3. Quy ước ngôn ngữ

| Thành phần | Ngôn ngữ |
|---|---|
| `README.md` (file này) | **Tiếng Việt** — mặc định |
| [`README.en.md`](README.en.md) | Tiếng Anh — bản song song, nội dung tương đương |
| `docs/vi/` (11 hướng dẫn) | Tiếng Việt, mỗi file có liên kết sang bản Anh |
| `docs/en/` (11 guides) | Tiếng Anh |
| `templates/` + `examples/` | **Tiếng Anh** — đây là artifact dùng thật trong repo dự án (code, PR, spec, policy) |

## 4. Cấu trúc thư mục

```
ai-sdlc/
├── README.md                  ← bạn đang ở đây (Tiếng Việt, mặc định)
├── README.en.md               # bản tiếng Anh
├── docs/
│   ├── vi/                    # 11 hướng dẫn tiếng Việt
│   └── en/                    # 11 English guides
│       01 nghiên cứu · 02 khung lõi · 03 tổ chức & tự chủ
│       04 gates & chính sách · 05 metrics · 06 công cụ
│       07 lộ trình · 08 bảo mật & DevSecOps
│       09 discovery & UX · 10 vận hành giao hàng · 11 portfolio
├── templates/                 # 13 file dùng ngay — TIẾNG ANH
│   ├── intent.md · spec.md · plan.md · AGENTS.md · evals.md
│   ├── quality-gates.yml · autonomy-policy.yml · pipeline.yml
│   ├── pr-template.md · threat-model.md · priority-scorecard.md
│   └── adr.md · postmortem-to-intent.md
└── examples/
    ├── mini-todo-api/         # ví dụ "chạy lần đầu" (EN)
    └── money-web-app/         # ví dụ nặng bảo mật: auth + dữ liệu tiền (EN)
        └── app/               # ỨNG DỤNG CHẠY ĐƯỢC (npm start / npm test)
```

## 5. Đọc gì trước?

| Bạn là ai / cần gì | Đọc gì trước |
|---|---|
| Cần hiểu bối cảnh & vì sao | `docs/vi/01-research-synthesis.md` |
| Muốn nắm khung quy trình (~20 phút) | `docs/vi/02-framework.md` |
| Bắt đầu pilot ngay tuần này | `docs/vi/07-adoption.md` + copy `templates/intent.md`, `templates/AGENTS.md` |
| Chuẩn hóa review & chất lượng | `docs/vi/04-gates-policy.md` + `templates/quality-gates.yml` |
| Dashboard / báo cáo lãnh đạo | `docs/vi/05-metrics.md` |
| Chọn công cụ, kiến trúc hệ thống | `docs/vi/06-toolchain.md` |
| Bảo mật sản phẩm (threat model, vuln, DevSecOps) | `docs/vi/08-security.md` + `templates/threat-model.md` |
| Quyết định xây gì trước Plan (research, UX, khả thi) | `docs/vi/09-discovery-ux.md` |
| Ước lượng, versioning, môi trường, tech debt | `docs/vi/10-delivery-ops.md` |
| Ưu tiên hóa, năng lực, quản trị vendor/mô hình | `docs/vi/11-portfolio.md` + `templates/priority-scorecard.md` |
| Xem dự án nhỏ chạy đủ vòng đời | `examples/mini-todo-api/` |
| Xem vòng đời nặng bảo mật + app chạy thật | `examples/money-web-app/` |

**Đường dẫn nhanh nhất (30 phút):** đọc `docs/vi/02-framework.md` → copy `templates/intent.md` + `templates/AGENTS.md` vào repo của bạn → chạy thử 1 feature nhỏ theo 6 giai đoạn.

## 6. Chạy thử ứng dụng mẫu (kiểm chứng thực hành)

```bash
cd examples/money-web-app/app
npm install && npm start     # → http://localhost:3000 (web app quản lý tiền, có auth)
npm test                     # 22 test = "gate battery": FR-1..3, SR-1..6, evals
```

Kết quả chạy thật và đối chiếu từng yêu cầu xem tại [`examples/money-web-app/app/RUN-REPORT.md`](examples/money-web-app/app/RUN-REPORT.md) — bao gồm 3 bug thật mà bộ test bắt được trong quá trình chạy.

## 7. Nguồn tham khảo chính

1. **Anthropic — The AI-native SDLC Playbook** (Claude Academy, 2026): 12 plays trên 6 giai đoạn; artifacts `intent.md`, `CLAUDE.md`/`AGENTS.md`, skills, hooks, evals. <https://academy.claude.com/courses/ai-native-sdlc-playbook>
2. **Microsoft — An AI-led SDLC** (Azure Blog, 2026): kiến trúc end-to-end: GitHub Spec Kit → coding agent → AI code review đa mô hình → CI/CD → SRE agent → observability → vòng phản hồi. <https://techcommunity.microsoft.com/blog/appsonazureblog/an-ai-led-sdlc-building-an-end-to-end-agentic-software-development-lifecycle-wit/4491896>
3. **AI-SDLC Framework** (ai-sdlc.io, Apache-2.0): đặc tả governance mở — Pipeline/AgentRole/QualityGate/AutonomyPolicy, mức tự chủ L0–L3, policy 3 cấp, metrics 5 nhóm. <https://ai-sdlc.io/docs>

Tổng hợp, so sánh và nguồn bổ trợ: `docs/vi/01-research-synthesis.md`.

## 8. Nguyên tắc áp dụng

- Bộ tài liệu **không ràng buộc vendor** — luôn có lựa chọn thay thế tương đương ở `docs/*/06-toolchain.md`.
- Áp dụng **theo mô-đun**: bắt đầu từ các "play" không điều kiện tiên quyết (`docs/*/07-adoption.md`).
- Mẫu trong `templates/` đều có **ghi chú hướng dẫn** (đoạn `<!-- ... -->`) — xóa khi dùng thật.

---

*Hai file README này được giữ đồng bộ nội dung: [🇻🇳 Tiếng Việt](README.md) · [🇬🇧 English](README.en.md). Tài liệu phục vụ học tập và áp dụng nội bộ; số liệu trích dẫn có nguồn đầy đủ trong `docs/vi/01-research-synthesis.md`.*
