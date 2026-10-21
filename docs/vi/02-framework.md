# 02 · Khung AI-SDLC: Nguyên tắc & 6 Giai đoạn

> Tài liệu lõi của bộ AI-SDLC. Đọc tài liệu này xong là nắm được toàn bộ quy trình: nguyên tắc nền, 6 giai đoạn (mỗi giai đoạn có mục tiêu, phân vai human/AI, artifact, gate), vòng lặp phản hồi và bản đồ "plays" để áp dụng theo mô-đun.
> *(English: [`../en/02-framework.md`](../en/02-framework.md))*

---

## 1. Tổng quan kiến trúc: 3 lớp — 6 giai đoạn — 1 vòng lặp

```
LỚP 1 · VÒNG ĐỜI ──────────────────────────────────────────────
                                                              ┌──────────┐
  PLAN ──► DESIGN ──► BUILD ──► TEST ──► DEPLOY ──► MAINTAIN ─┤ metric   │
 (ý định)  (đặc tả)   (hiện    (xác    (phát      (vận hành)  │ lệch band│
           + kế hoạch) thực)    minh)   hành)                  └────┬─────┘
    ▲          ▲                                                intent.md mới
    │          │                                                      │
    └──────────┴──────────────────────────────────────────────────────┘
                        vòng lặp khép kín (closed loop)

LỚP 2 · ĐIỀU PHỐI ─────────────────────────────────────────────
  • Routing theo độ phức tạp (1–10): ai-with-review / ai-assisted / human-led
  • Mức tự chủ L0–L3 (earn-by-evidence, có demotion tự động)
  • Orchestrator (điều phối) + Worker agents (thực thi) + Reviewer agents (độc lập)
  • Human-in-the-loop: phê duyệt tại gate, nhận escalation

LỚP 3 · NỀN TẢNG TIN CẬY ──────────────────────────────────────
  • Quality gates (DoR/DoD/Deploy) — 3 cấp áp dụng: advisory / soft / hard
  • Metrics 5 nhóm + attribution (AI vs human) + hạch toán chi phí
  • Knowledge-as-code: AGENTS.md, skills, evals — tất cả có phiên bản trong Git
  • Zero-trust: sandbox, credential ngắn hạn, provenance từng artifact
```

Ba lớp này độc lập với công cụ: lớp 1 là quy ước làm việc, lớp 2 là quy ước phân quyền, lớp 3 là quy ước kiểm soát. Bạn có thể triển khai bằng Claude Code, Codex, Copilot hay agent tự viết — xem `06-toolchain.md`.

---

## 2. Bảy nguyên tắc nền tảng

Mỗi nguyên tắc dưới đây là hiện thực hóa một yêu cầu thiết kế (R1–R7) đã chốt ở `01-research-synthesis.md`:

| # | Nguyên tắc | Nội dung |
|---|---|---|
| **P1** | **Intent-first** | Mọi thay đổi bắt đầu bằng `intent.md` ngắn, có phiên bản trong Git: *cái gì — vì sao — ràng buộc nào*. Intent là "hợp đồng" giữa người và agent; không có intent thì không có work. |
| **P2** | **Spec-driven (WHAT ≠ HOW)** | Spec mô tả kết quả mong muốn (WHAT); agent tự chọn cách làm (HOW). Spec phải qua **Definition of Ready** trước khi được code. Chỉnh spec rẻ hơn sửa code 10–100 lần. |
| **P3** | **Verification-first** | Nút thắt mới là review/xác minh, không phải viết code. Đầu tư mạnh nhất vào: evals trong CI, review đa mô hình độc lập (cross-harness), scan bảo mật. Kỳ vọng thực tế: chỉ ~27–30% PR của agent được chấp nhận nguyên vẹn ngay lần đầu. |
| **P4** | **Human accountable, agent executable** | Con người chịu trách nhiệm mọi phán đoán (scope, trade-off, rủi ro, phê duyệt); agent đảm nhận mọi việc thực thi (tổng hợp, viết code/test/tài liệu, review lớp 1, giám sát). Không giảm trừ trách nhiệm vì "AI làm". |
| **P5** | **Earned autonomy** | Quyền tự chủ của agent phải **kiếm bằng bằng chứng** (metrics qua thời gian), bắt đầu ở mức thấp nhất đủ dùng; có demotion tự động khi có sự cố. Không cấp quyền bằng cảm tính hay cấu hình tĩnh. |
| **P6** | **Knowledge-as-code** | Tri thức tổ chức (quy ước code, lệnh build, chuẩn review, cảnh báo) sống trong `AGENTS.md`, skills và evals — có phiên bản, được review như code, không sống trong đầu mọi người. |
| **P7** | **Closed loop** | Vòng đời là **vòng lặp**: metric production vượt control band → chẩn đoán → `intent.md` mới → quay lại Plan. Không có đường thẳng "xong là bỏ". |

---

## 3. Sáu giai đoạn — chi tiết

Quy ước chung mỗi giai đoạn: **Đầu vào** (artifact + gate đã qua) · **Hoạt động AI** · **Hoạt động Human** · **Đầu ra + gate ra** · **Sai lầm thường gặp**.

### Giai đoạn 1 · PLAN — "Ghi lại ý định"

Trả lời câu hỏi: *chúng ta giải quyết vấn đề gì, vì sao, và thế nào là thành công?*

| Khía cạnh | Nội dung |
|---|---|
| **Đầu vào** | Bất kỳ nguồn nào: ticket, phàn nàn khách hàng, sự cố production, metric lệch band (từ Maintain), ý tưởng sản phẩm |
| **AI làm** | Trích xuất pain point từ nguồn thô (ticket, log, transcript họp) thành bản nháp intent; gom cụm vấn đề; tìm bằng chứng định lượng |
| **Human làm** | Quyết định *đáng làm hay không*, ưu tiên, scope; xác nhận metric thành công; ký intent (là chủ sở hữu — owner) |
| **Đầu ra** | `intent.md` (≤ 1 trang, có phiên bản) — template: [`templates/intent.md`](../../templates/intent.md) |
| **Gate ra (→Design)** | **Intent-Ready**: có vấn đề + bằng chứng + mục tiêu đo được + ràng buộc + owner. Không có → không vào Design |
| **Sai lầm** | Viết intent thành spec 5 trang (dài = chết); không có metric thành công; không ai đứng tên owner |

> Theo Anthropic: intent.md phải "human readable và machine actionable" — người đọc để phán đoán, máy đọc để hành động.

### Giai đoạn 2 · DESIGN — "Đặc tả + kế hoạch trong một phiên"

Trả lời: *thế giới cần trông như thế nào khi xong, và làm theo các bước nào?*

| Khía cạnh | Nội dung |
|---|---|
| **Đầu vào** | intent.md đã qua gate |
| **AI làm** | Trong **một phiên làm việc với agent**: biến intent thành spec (yêu cầu chức năng + phi chức năng + acceptance criteria) + thiết kế (kiến trúc, API, dữ liệu, bảo mật, chiến lược test) + phân rã task (mỗi task có ước lượng độ phức tạp 1–10 để routing). Dùng công cụ kiểu GitHub Spec Kit (`/specify` → `/plan` → `/tasks`) |
| **Human làm** | Review & duyệt spec (đây là điểm đòn bẩy lớn nhất của con người — sửa ở đây rẻ nhất); chốt trade-off kiến trúc; điều chỉnh độ phức tạp → chế độ làm việc (xem `03-org-autonomy.md`) |
| **Đầu ra** | `spec.md` + `plan.md` + danh sách task có nhãn phức tạp — templates: [`templates/spec.md`](../../templates/spec.md), [`templates/plan.md`](../../templates/plan.md) |
| **Gate ra (→Build)** | **Definition of Ready (DoR)**: acceptance criteria đo được; ranh giới/non-goals rõ; task đủ nhỏ (≤ 1 buổi/lần chạy agent); chiến lược test đã nêu; rủi ro bảo mật đã ghi. Issue không qua DoR **không được dispatch** — đây là cổng quan trọng nhất của cả khung |
| **Sai lầm** | Spec không có acceptance criteria; task to đùng "làm lại module X"; bỏ quên non-goals khiến agent phát triển phạm vi tràn |

> Mẹo từ Microsoft: ở bước lập kế hoạch, chọn **mô hình reasoning cao + temperature thấp (≈0.2)** để giảm "code ảo"/hallucination ở giai đoạn suy nghĩ.

### Giai đoạn 3 · BUILD — "Agent hiện thực hóa, người giữ vô-lăng"

Trả lời: *hiện thực hóa spec thành code + test như thế nào an toàn?*

| Khía cạnh | Nội dung |
|---|---|
| **Đầu vào** | Task đã qua DoR; `AGENTS.md` của repo đã cập nhật |
| **AI làm** | Bắt đầu bằng **plan mode** (agent phải trình bày kế hoạch trước khi sửa code); phân tích repo hiện có trước khi viết (không phá quy ước); viết code + test song song; chạy test trong môi trường cách ly (container/sandbox); **1 task = 1 branch = 1 PR**; dùng subagent cho việc khảo sát rộng và các phiên song song cho task độc lập |
| **Human làm** | Duyệt kế hoạch của agent (lần đầu/đoạn quan trọng); trả lời escalation; giữ `AGENTS.md` và skills luôn đúng (đây là cách "lập trình" agent của bạn) |
| **Đầu ra** | Branch + PR chứa code/test/tài liệu, kèm **provenance** (mô hình nào, prompt hash, thời điểm — xem `templates/pr-template.md`) |
| **Gate ra (→Test)** | **Build-Ready**: build pass, test mới phủ thay đổi, lint sạch, PR ≤ giới hạn theo mức tự chủ (L1 ≤ 200 dòng…) |
| **Sai lầm** | Để agent "tự đổi hướng" khỏi plan; nhận code không có test; PR phình to vì gộp nhiều task; cập nhật `AGENTS.md` một lần rồi bỏ quên |

> Theo DORA/churn: code AI có churn cao hơn ~0.4 — đánh giá PR nên có gate chống "code bỏ đi sau 2 tuần".

### Giai đoạn 4 · TEST — "Xác minh là Bottleneck — hãy trả tiền cho nó"

Trả lời: *làm sao TIN được thứ agent vừa làm?*

| Khía cạnh | Nội dung |
|---|---|
| **Đầu vào** | PR qua Build-Ready |
| **AI làm** | **Lớp review 1 (máy):** ≥ 2 mô hình/agent **độc lập với bên triển khai** cùng review (cross-harness), chấm điểm, phát hiện bug/bảo mật/anti-pattern; agent có quyền sửa trực tiếp rồi chạy lại; chạy bộ **evals** trong CI (evals chạy lại cả khi agent setup thay đổi — không chỉ khi code đổi); scan bảo mật + phụ thuộc + license |
| **Human làm** | **Lớp review 2 (người):** chỉ tập trung phần regulated/critical/security theo routing; phê duyệt có ghi chú; override gate phải có giải thích (được audit) |
| **Đầu ra** | PR đã qua review phân tầng + kết quả evals + báo cáo scan; mọi kết luận gắn được về "review đã chạy trên đúng diff này" (proof of execution) |
| **Gate ra (→Deploy)** | **Quality gates**: coverage ≥ ngưỡng, 0 lỗi scan nghiêm trọng, reviewer tối thiểu, evals trong band, attribution đầy đủ — chi tiết 3 cấp áp dụng ở `04-gates-policy.md` |
| **Sai lầm** | Một mô hình vừa viết vừa tự review (mất độc lập); chỉ chạy test khi code đổi mà quên evals khi agent đổi; coi "AI nói OK" là bằng chứng |

### Giai đoạn 5 · DEPLOY — "Phát hành có cổng phê duyệt"

Trả lời: *đưa thay đổi ra production an toàn thế nào khi phần lớn code do agent viết?*

| Khía cạnh | Nội dung |
|---|---|
| **Đầu vào** | PR qua mọi quality gate |
| **AI làm** | Điều phối CI/CD; viết release notes; **agent triage** tự phân loại lỗi build/deploy và thử sửa; hỗ trợ rollback theo runbook |
| **Human làm** | **Hooks = cổng phê duyệt:** hành động nhạy cảm (merge vào main, deploy production, xóa dữ liệu, tăng quyền) bị **giữ lại** tới khi người có vai trò phê duyệt; người quyết định progressive rollout (canary %, feature flags) |
| **Đầu ra** | Bản phát hành + audit trail (ai duyệt gì, khi nào, dựa trên báo cáo nào) |
| **Gate ra (→Maintain)** | **Deploy gates:** kế hoạch rollback có sẵn; monitoring/dashboard đã trỏ metric mới; phases rollout đã cấu hình |
| **Sai lầm** | Cho agent quyền deploy production ngay từ đầu (chỉ L3 mới được deploy staging — xem `03`); không có audit trail phê duyệt; bỏ qua feature flags |

### Giai đoạn 6 · MAINTAIN — "Vòng lặp khép kín"

Trả lời: *sau khi phát hành, ai theo dõi và hệ thống tự chữa thế nào?*

| Khía cạnh | Nội dung |
|---|---|
| **Đầu vào** | Production + observability (metric, log, trace, cảnh báo) |
| **AI làm** | **SRE agent** giám sát liên tục: phân tích cảnh báo, đối chiếu anomalies với commit/PR gần nhất, mở investigation; với lỗi đủ điều kiện: tự mở issue/PR sửa kèm phân tích căn nguyên (root cause); đề xuất tối ưu chi phí/hiệu năng |
| **Human làm** | Xét duyệt hành động SRE agent theo mức tự chủ của nó; quyết định rollback lớn; **chuyển phát hiện thành `intent.md` mới** khi metric vượt control band — chính thức mở vòng đời tiếp theo |
| **Đầu ra** | Issues/PR sửa lỗi + `intent.md` kế thừa (từ postmortem — template: [`templates/postmortem-to-intent.md`](../../templates/postmortem-to-intent.md)) |
| **Gate ra (→Plan)** | **Loop-Ready**: phát hiện có bằng chứng định lượng + assessments tác động + liên kết về intent gốc |
| **Sai lầm** | Cảnh báo tồn thành "bãi rác" không ai xử lý; postmortem không sinh intent mới (vòng lặp đứt); không định nghĩa control band ngay từ Plan |

---

## 4. Ma trận artifact × giai đoạn

| Artifact | Plan | Design | Build | Test | Deploy | Maintain | Template |
|---|:-:|:-:|:-:|:-:|:-:|:-:|---|
| `intent.md` | ⭐ | đọc | | | | sinh ra | [`templates/intent.md`](../../templates/intent.md) |
| `spec.md` | | ⭐ | đọc | | | | [`templates/spec.md`](../../templates/spec.md) |
| `plan.md` + tasks (1–10) | | ⭐ | đọc | | | | [`templates/plan.md`](../../templates/plan.md) |
| `AGENTS.md` / skills | cập | cập | ⭐ | dùng | | cập | [`templates/AGENTS.md`](../../templates/AGENTS.md) |
| Evals | | hoạch | viết | ⭐ | chạy | | [`templates/evals.md`](../../templates/evals.md) |
| PR + provenance | | | ⭐ | review | | | [`templates/pr-template.md`](../../templates/pr-template.md) |
| Quality gates (YAML) | | DoR | Build | ⭐ | Deploy | | [`templates/quality-gates.yml`](../../templates/quality-gates.yml) |
| Metrics / dashboard | định nghĩa | | | thu | thu | ⭐ | `05-metrics.md` |
| Postmortem → intent | | | | | | ⭐ | [`templates/postmortem-to-intent.md`](../../templates/postmortem-to-intent.md) |

⭐ = artifact trung tâm của giai đoạn.

---

## 5. Bản đồ "plays" — áp dụng theo mô-đun

Kế thừa tư duy "play + dependency graph" của Anthropic, điều chỉnh vendor-neutral. **Play in đậm = không cần điều kiện tiên quyết, bắt đầu được ngay** (nhưng vẫn nên đọc `07-adoption.md` trước khi chạy).

| # | Play | Giai đoạn | Điều kiện | Mô tả ngắn |
|---|---|---|---|---|
| 1 | **Capture as intent.md** | Plan | — | Mọi thay đổi bắt đầu bằng intent file có phiên bản |
| 2 | Spec-in-one-session | Design | Play 1 | Gộp requirements + design trong 1 phiên với agent |
| 3 | DoR gate | Design | Play 2 | Cổng "sẵn sàng mới được code" |
| 4 | **AGENTS.md/CLAUDE.md làm memory dự án** | Build | — | Context chuẩn cho mọi agent vào repo |
| 5 | **Plan-mode-first** | Build | — | Agent phải trình kế hoạch trước khi sửa |
| 6 | Skills = tri thức tổ chức | Build | Play 4 | Đóng gói chuẩn/review checklist thành skill có phiên bản |
| 7 | Subagents & phiên song song | Build | Play 4, 5 | Tăng throughput khi task độc lập |
| 8 | **Feedback loop cho agent** | Test | — | Cho agent chạy test/eval tự sửa trong sandbox |
| 9 | Evals trong CI | Test | Play 8 | Eval suite chạy lại khi code HOẶC agent setup đổi |
| 10 | Review phân tầng đa mô hình | Test | Play 4 | Lớp 1: ≥ 2 reviewer AI độc lập; lớp 2: người cho phần critical |
| 11 | **Hooks làm cổng phê duyệt** | Deploy | — | Hành động nhạy cảm giữ lại chờ người duyệt |
| 12 | Đóng vòng bằng metrics | Maintain | Play 1, 9 | Metric lệch band → intent mới |

Bắt đầu thực dụng nhất: **1 → 4 → 5 → 8 → 11** (đủ để nâng chất lượng một team trong 2–4 tuần mà chưa cần hạ tầng mới).

---

## 6. Vòng lặp phản hồi — điều làm AI-SDLC khác SDLC truyền thống

Ba vòng phản hồi lồng nhau, chu kỳ ngắn dần:

1. **Vòng giây–phút (Build/Test):** agent viết → chạy test/eval → tự sửa trong sandbox → review AI → người duyệt. Nguyên tắc: *không bao giờ để agent "xong" khi chưa chạy được gì.*
2. **Vòng ngày (Deploy):** quality gate chặn → triage agent phân loại → sửa hoặc escalate → deploy theo phase.
3. **Vòng tuần/tháng (Maintain→Plan):** control band của metric sản xuất bị vượt → SRE agent chẩn đoán → postmortem → **intent.md mới** → quay lại Plan. *Intent cũ và intent mới nối thành chuỗi nhân-quả có thể audit — đây là "vòng đời" theo đúng nghĩa.*

Câu hỏi kiểm tra sức khỏe vòng lặp: *"Lần gần nhất một metric production biến thành một intent.md là khi nào?"* — nếu không trả lời được, vòng lặp đang đứt.

---

## 7. Khung này ánh xạ vào quy trình truyền thống thế nào?

| SDLC truyền thống | Trong AI-SDLC này | Ghi chú |
|---|---|---|
| Hội thảo thu thập yêu cầu | Plan + nguồn dữ liệu thô + agent trích xuất | Nhanh hơn, có bằng chứng |
| Tài liệu spec đội analyst | Design: spec sinh trong 1 phiên, chuẩn hóa bằng template + DoR | Spec là artifact sống có phiên bản |
| Code review từng dòng | Review phân tầng: AI lớp 1 (đa mô hình), người lớp 2 cho phần critical | Người review *quyết định*, không phải *đọc hết* |
| QA cuối chu kỳ | Evals liên tục xuyên suốt Build→Deploy | Test không phải "giai đoạn cuối" |
| Phê duyệt bằng họp | Hooks + gate + audit trail | Phê duyệt bất đồng bộ, có ghi vết |
| Vận hành thủ công | SRE agent + observability + postmortem→intent | Khép vòng |

---

*Tiếp theo: phân vai & mức tự chủ → [`03-org-autonomy.md`](03-org-autonomy.md) · Phủ rộng thêm: [`08-security.md`](08-security.md) (bảo mật sản phẩm) · [`09-discovery-ux.md`](09-discovery-ux.md) (giai đoạn 0: discovery & UX) · [`10-delivery-ops.md`](10-delivery-ops.md) (ước lượng, versioning, môi trường, tech debt) · [`11-portfolio.md`](11-portfolio.md) (ưu tiên hóa & vendor) · Về [README](../../README.md)*
