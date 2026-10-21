# 01 · Tổng hợp nghiên cứu AI-SDLC

> Tài liệu nền tảng: nó tổng hợp và so sánh ba nguồn tham khảo chính, trích xuất số liệu bối cảnh, và chốt thành **7 yêu cầu thiết kế** — input trực tiếp cho khung AI-SDLC ở `02-framework.md`.
> *(English: [`../en/01-research-synthesis.md`](../en/01-research-synthesis.md))*

---

## 1. Bối cảnh: dữ liệu nói gì?

Đây là những con số định hình toàn bộ thiết kế của bộ tài liệu này (nguồn: đặc tả ai-sdlc.io trích dẫn, 2024–2026):

| # | Số liệu | Ý nghĩa thực tiễn |
|---|---|---|
| 1 | 85% dev dùng công cụ AI; ~41% code trên GitHub do AI tạo | AI đã là mặc định — câu hỏi không còn là "dùng không" mà là "quản lý thế nào" |
| 2 | Chỉ 1/5 tổ chức có governance agent trưởng thành | Khoảng trống lớn giữa mức dùng và mức kiểm soát |
| 3 | 45% test-case code do AI viết có lỗ hổng bảo mật | Không thể bỏ qua tầng review/scan chuyên biệt |
| 4 | Tỉ lệ refactor giảm 25% → 10%; code churn tăng 5.5% → 7.9% | AI sinh code nhanh nhưng làm xấu "sức khỏe structural" của codebase nếu không kiểm soát |
| 5 | METR RCT (2025): dev kỳ cựu **chậm hơn 19%** khi dùng AI nhưng tin mình **nhanh hơn 20%** | Cần đo lường khách quan — cảm nhận chủ quan không dùng được để ra quyết định |
| 6 | DORA: mỗi +25% AI adoption ↔ **−7.2%** độ ổn định delivery | Tốc độ đổi lấy ổn định nếu thiếu gates |
| 7 | Faros AI: PR merged +98%, kích thước PR +154%, thời gian review +91% | **Nút thắt dịch chuyển từ "viết code" sang "review code"** |
| 8 | Baseline: tỉ lệ PR AI được chấp nhận nguyên vẹn chỉ ~27–30%; churn của AI-code cao hơn ~0.41 | Kỳ vọng thực tế khi khởi động: agent không "one-shot" được |

**Kết luận cốt lõi của cả 3 nguồn:** *code generation không còn là bottleneck. Bottleneck là verification (review, test, security) và governance (ai được làm gì, dựa trên bằng chứng nào).*

---

## 2. Nguồn 1 — Anthropic: "The AI-native SDLC Playbook" (Claude Academy, 8/2026)

### Tinh thần
Không viết lại SDLC từ góc độ công cụ, mà từ góc độ **con người điều khiển agent**: "công việc quanh tệp code" (quy trình, review, tài liệu, phê duyệt) mới là nơi AI tăng tốc được nhiều nhất. Nhắm đến team/platform/security lead ở doanh nghiệp lớn, có sẵn Claude Code + Git + CI.

### Cấu trúc: 6 giai đoạn × 12 "plays"
Mỗi play có 5 mục thống nhất: *what changes → getting started → implementation → governance → measurement*. Các play có **đồ thị phụ thuộc** rõ ràng; 6 play không cần điều kiện tiên quyết nên có thể bắt đầu ngay:

| Giai đoạn | Play chính | Artifact cốt lõi |
|---|---|---|
| **Plan** | Capture as intent.md | `intent.md` — file ngắn, có phiên bản: cái gì, vì sao, ràng buộc nào; vừa đọc được bởi người vừa xử lý được bởi máy |
| **Design** | Requirements + design gộp thành 1 phiên làm việc với agent | Spec (yêu cầu + thiết kế) |
| **Build** | Plan mode là mặc định; CLAUDE.md; Skills; phiên song song + subagent | `CLAUDE.md`/`AGENTS.md`, skills, plan |
| **Test** | Cho agent vòng phản hồi; **evals liên tục trong CI** | Eval suite, chạy lại khi setup agent đổi |
| **Deploy** | AI review mọi PR; **hooks làm cổng phê duyệt** | PR review layer, hooks giữ release tới khi người phê duyệt |
| **Maintain** | Đóng vòng lặp bằng metrics | Metric vượt control band → **intent.md mới** → quay lại Plan |

### Điểm mạnh / hạn chế
- ✅ Thực dụng nhất: mỗi play là một bước triển khai được, có dependency graph để chọn điểm bắt đầu.
- ✅ Nguyên tắc "human remains accountable for judgment" xuyên suốt; review phân tầng — người chỉ review phần regulated/critical.
- ✅ Đóng vòng lặp đời sống phần mềm (Maintain → Plan) một cách tường minh.
- ⚠️ Gắn chặt hệ sinh thái Claude Code (nhưng mẫu này khái quát hóa dễ — xem `06-toolchain.md`).
- ⚠️ Như Waydev nhận xét: thiếu một lớp **đo lường** hệ thống — bộ tài liệu này bổ sung ở `05-metrics.md`.

---

## 3. Nguồn 2 — Microsoft: "An AI-led SDLC" (Azure Blog, 2026)

### Tinh thần
Một **kiến trúc tham chiếu end-to-end đã chạy thật** — "khởi đầu của một SDLC agentic hoàn toàn tự động" — trong đó agent viết phần lớn code, con người giữ vai trò định hướng và giám sát, và mọi thứ đều có vòng phản hồi.

### Luồng kiến trúc (đường dẫn nhân-quả)
```
GitHub Repo ──► Spec Kit (spec → plan → tasks)          [GIAI ĐOẠN DESIGN]
                    │  configure: mô hình planner, temp 0.2,
                    │  tăng reasoning effort để giảm "code ảo"
                    ▼
            Coding Agent (Codex CLI)                     [GIAI ĐOẠN BUILD]
                    │  · phân tích repo & nhớ "codebase evolution"
                    │  · test trong Docker container
                    │  · tạo branch + PR cho MỖI task
                    ▼
            AI Code Review                              [GIAI ĐOẠN TEST]
                    │  · Claude Sonnet + GPT-5.1 (high) — HAI mô hình
                    │    độc lập cùng review, chấm điểm 1–5
                    │  · AI có quyền sửa trực tiếp
                    ▼
            Human Review (chọn lọc) ──► Merge
                    ▼
            CI/CD + Triage Agent (phân loại lỗi build)   [GIAI ĐOẠN DEPLOY]
                    ▼
            SRE Agent (CodeWatcher/CodeReviewer          [GIAI ĐOẠN MAINTAIN]
                    │  chạy trên GitHub Actions tự hành động)
                    ▼
            Observability (New Relic) ──► Findings ──► Issues mới
                    ▲                                       │
                    └───────── vòng phản hồi ◄──────────────┘
```

### Chi tiết đáng chú ý
- **Model routing theo pha** (bảng đầy đủ ở `06-toolchain.md`): Planner dùng mô hình reasoning cao + temperature thấp; Implementer dùng mô hình trung bình; Reviewer dùng **hai mô hình khác họ** để bắt lỗi nhau.
- **Branching kỷ luật:** 1 task = 1 branch = 1 PR.
- **Agent tự sửa trong review:** reviewer AI không chỉ nhận xét mà sửa được trực tiếp, người review chọn lọc phần quan trọng.
- **SRE agent chủ động:** không chỉ cảnh báo mà tự mở PR sửa, phân loại lỗi, quyết định rollback.
- **Luôn "trong mọi khoảnh khắc đều có người giám sát"** (human-in/on-the-loop).

### Điểm mạnh / hạn chế
- ✅ Chỉ rõ công nghệ, mô hình, tham số — dùng được như blueprint kỹ thuật.
- ✅ Chứng minh mô hình **đa mô hình theo pha** và **vòng phản hồi production → issue**.
- ⚠️ Có định hướng Azure/GitHub; cần "dịch" sang stack trung lập (đã làm ở `06-toolchain.md`).
- ⚠️ Governance/autonomy được mô tả nhẹ — không có hệ thống cấp quyền theo bằng chứng như nguồn 3.

---

## 4. Nguồn 3 — AI-SDLC Framework (ai-sdlc.io, Apache-2.0)

### Tinh thần
Đây là **đặc tả chuẩn mở cho governance**, không phải công cụ: "Kubernetes cho quy trình phát triển của bạn" — khai báo trạng thái SDLC mong muốn bằng YAML, các controller đưa hoạt động thực tế về đúng trạng thái khai báo. Nằm trên MCP (agent↔tool), A2A (agent↔agent) và AGENTS.md (hướng dẫn theo repo).

### Bốn lớp kiến trúc
1. **Specification** — 5 loại resource (có JSON Schema, versioned `v1alpha1 → v1beta1 → v1`): `Pipeline`, `AgentRole`, `QualityGate`, `AutonomyPolicy`, `AdapterBinding`.
2. **Adapter** — hợp đồng kiểu Terraform provider (IssueTracker, SourceControl, CIPipeline, CodeAnalysis, Messenger, DeploymentTarget): đổi Jira ↔ Linear chỉ đổi 1 field.
3. **Policy** — gate 3 cấp kiểu OPA/Gatekeeper + Sentinel; mức tự chủ chuẩn CSA ATF.
4. **Runtime** — vòng reconciliation kiểu Kubernetes; A2A Agent Cards.

### Năm trụ cột vận hành
| Trụ cột | Vai trò |
|---|---|
| **DoR gate** (Definition of Ready) | Cổng trước khi điều phối: issue chưa "sẵn sàng" thì không được dispatch |
| **Autonomous orchestrator** | Tự chọn issue tiếp theo, cấp worktree riêng, chạy pipeline 2 tầng |
| **Two-tier pipeline** | Tầng điều phối + tầng thực thi (implement → review → deploy) |
| **Cross-harness review** | Review bởi agent **khác hệ/phía triển khai** (3 reviewer song song hoặc staged) |
| **Operator TUI** | Nơi con người theo dõi luồng và trả lời các câu hỏi hệ thống không tự quyết được |

Kèm các khái niệm tin cậy: **Proof of Execution** ("review đã chạy trên đúng diff này"), **reviewer independence** ("review chạy ở nơi implementer không với tới được"), **zero-trust PR verification** (contributor không tin cậy không thể leo thang quyền/exfiltrate/giả mạo), **usage ledger** (mọi lần gọi mô hình đều được hạch toán).

### Mức tự chủ L0–L3 (tóm tắt — chi tiết ở `03-org-autonomy.md`)
| Level | Tên | Có thể | Phê duyệt | Giới hạn PR |
|---|---|---|---|---|
| 0 | Observer/Intern | Chỉ đọc, không tạo artifact | Mọi hành động | — (tối thiểu 2 tuần) |
| 1 | Junior | Draft PR, comment, chạy test | Mọi thay đổi | ≤ 200 dòng (tối thiểu 4 tuần) |
| 2 | Senior | Branch/PR, test/lint/build | Chỉ phần security-critical | ≤ 500 dòng (tối thiểu 8 tuần) |
| 3 | Principal | Merge non-critical, deploy staging | Chỉ thay đổi kiến trúc | ≤ 1000 dòng |

- **Nguyên tắc Least Autonomy:** agent LUÔN bắt đầu ở L0/L1; tự chủ là **kiếm được bằng bằng chứng** (pr-approval ≥ 0.90, rollback ≤ 0.02, security incident = 0…), không phải cấp bằng cấu hình.
- **Demotion tự động & ngay lập tức** khi có sự cố bảo mật nghiêm trọng (về L0) hoặc rollback vượt ngưỡng (lùi 1 cấp) + cooldown.
- **Routing theo độ phức tạp 1–10:** low → fully-autonomous; medium → ai-with-review; high → ai-assisted; critical → human-led.

### Metrics 5 nhóm (tóm tắt — chi tiết ở `05-metrics.md`)
Task Effectiveness · Human-in-the-Loop · Code Quality · Economic Efficiency · Autonomy Trajectory — mở rộng OpenTelemetry GenAI semantic conventions, prefix `ai_sdlc.*`.

### Ánh xạ tuân thủ
EU AI Act (phân tầng rủi ro → routing; minh bạch → provenance) · NIST AI RMF (Govern/Map/Measure/Manage) · ISO 42001 (PDCA) · OWASP ASI · CSA ATF.

### Điểm mạnh / hạn chế
- ✅ Sâu nhất về governance: autonomy có thời hạn, có bằng chứng, có demotion — khớp chuẩn quốc tế.
- ✅ Vendor-neutral, agent-agnostic (adapter layer).
- ⚠️ Đang `v1alpha1/Draft` — một số RFC đang shipping; không nên coi là thành phẩm cứng nhắc mà là **hình mẫu tư duy**.

---

## 5. So sánh chéo 3 nguồn

| Tiêu chí | Anthropic Playbook | Microsoft AI-led SDLC | AI-SDLC Framework |
|---|---|---|---|
| Trọng tâm | Con người + plays mô-đun | Kiến trúc end-to-end cụ thể | Governance & đặc tả |
| Độ trưởng thành | Thực chiến, dễ bắt đầu | Đã chạy thật (blueprint) | Tiêu chuẩn mở (draft) |
| Giai đoạn | 6 (Plan→Maintain) | Đủ vòng (spec→SRE) | implement→review→deploy + gates |
| Human-in-loop | Phán đoán & phê duyệt | Giám sát + review chọn lọc | DoR, override có kiểm soát |
| Autonomy | Không tường minh | Mức vừa (agent tự sửa) | **L0–L3 earn-by-evidence** |
| Đo lường | Mỗi play có mục đo | Observability sản phẩm | **5 nhóm metric chuẩn hóa** |
| Review | Phân tầng, AI lớp 1 | Đa mô hình độc lập | **Cross-harness + Proof of Execution** |
| Vendor | Claude | Azure/GitHub/OpenAI | Trung lập |

**Ba nguồn bổ khuyết cho nhau:** Anthropic cho *cách bắt đầu và văn hóa*, Microsoft cho *kiến trúc kỹ thuật và model routing*, ai-sdlc.io cho *governance, autonomy và đo lường*.

---

## 6. Bài học → 7 yêu cầu thiết kế cho bộ AI-SDLC của chúng ta

| # | Yêu cầu thiết kế (design input) | Nguồn gốc |
|---|---|---|
| R1 | **Intent-first:** mọi thay đổi bắt đầu bằng intent.md có phiên bản, đọc được bởi cả người và máy | Anthropic (Plan) |
| R2 | **Spec-driven, tách WHAT/HOW:** spec được gate kiểm tra (DoR) trước khi code; dùng công cụ kiểu Spec Kit | cả 3 (Microsoft, ai-sdlc.io, Anthropic Design) |
| R3 | **Verification-first:** đầu tư lớn nhất vào review đa mô hình (cross-harness), evals trong CI, scan bảo mật — vì đó là bottleneck mới | Anthropic + Microsoft + số liệu Faros |
| R4 | **Earned autonomy:** cấp quyền theo bằng chứng metrics (L0–L3), có demotion tự động; bắt đầu ở mức thấp nhất đủ dùng | ai-sdlc.io (AutonomyPolicy) |
| R5 | **Routing theo độ phức tạp:** không phải task nào cũng cho agent tự làm — chấm điểm 1–10, chia 4 chế độ làm việc | ai-sdlc.io + Microsoft |
| R6 | **Closed loop:** Maintain sinh intent mới khi metric lệch control band — vòng đời là vòng lặp, không phải đường thẳng | Anthropic (Maintain) + Microsoft (SRE→issues) |
| R7 | **Đo lường khách quan + kinh tế:** dashboard 5 nhóm metric, phân biệt AI/human attribution, hạch toán chi phí per-task — vì cảm nhận chủ quan lệch tới 39 điểm | ai-sdlc.io (metrics) + METR + Waydev |

Bảy yêu cầu này được hiện thực hóa ở `02-framework.md` (7 nguyên tắc tương ứng) và các tài liệu thành phần.

---

## 7. Nguồn bổ trợ (đọc thêm)

- **GitHub Spec Kit** — công cụ spec-driven workflow (`/specify`, `/plan`, `/tasks`) dùng ở giai đoạn Design: <https://github.com/github/spec-kit>
- **METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity"** — RCT cho thấy gap 39 điểm giữa cảm nhận và thực tế.
- **DORA Report** — tương quan giữa AI adoption và delivery stability.
- **CSA Agentic Trust Framework** (2/2026) — chuẩn zero-trust cho agent, cơ sở của các mức autonomy.
- **NIST AI RMF · ISO/IEC 42001 · EU AI Act** — khung tuân thủ được ánh xạ ở `04-gates-policy.md`.
- **OWASP Agentic Security Initiative (ASI)** — checklist bảo mật cho agent.
- Phản biện mở rộng cho playbook Anthropic: [Draftt — Extending the playbook](https://www.draftt.io/post/extending-anthropics-ai-native-sdlc-playbook-what-it-takes-to-make-maintain-autonomous) · [Waydev — A missing layer: measurement](https://waydev.co/anthropics-ai-native-sdlc-playbook-has-a-missing-layer-measurement) · [Mabl — Fixing the Verification Gap](https://www.mabl.com/blog/fixing-the-verification-gap-in-the-adlc)

---

*Liên kết nội bộ: [`02-framework.md`](02-framework.md) · [`03-org-autonomy.md`](03-org-autonomy.md) · [`04-gates-policy.md`](04-gates-policy.md) · [`05-metrics.md`](05-metrics.md) · [`06-toolchain.md`](06-toolchain.md) · [`07-adoption.md`](07-adoption.md) · [Về README](../../README.md)*
