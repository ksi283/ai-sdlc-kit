# 05 · Metrics & Đo lường

> Lớp đo lường của khung. Vì cảm nhận chủ quan lệch tới **39 điểm** (METR: người dùng AI nghĩ mình nhanh hơn 20%, thực tế chậm hơn 19%), mọi quyết định trong AI-SDLC — thăng cấp tự chủ, mở rộng phạm vi agent, đầu tư công cụ — phải dựa trên số liệu khách quan có attribution.
> *(English: [`../en/05-metrics.md`](../en/05-metrics.md))*

---

## 1. Cấu trúc: 5 nhóm metric

Chuẩn hóa theo đặc tả metrics của ai-sdlc.io (mở rộng OpenTelemetry GenAI semantic conventions, prefix `ai_sdlc.*`). Triển khai tối thiểu cần 3 nhóm đầu.

### Nhóm 1 · Task Effectiveness — "Agent có xong việc không?"

| Metric | Định nghĩa | Ngưỡng tham khảo |
|---|---|---|
| `task.success_rate` | Task hoàn thành thành công / task giao | ≥ 0.7 (khởi động), hướng tới ≥ 0.9 |
| `task.completion_time` | Thời gian từ giao → xong (giây/phút), theo complexity tier | Theo SLA team |
| `task.time_vs_baseline` | Thời gian agent / baseline người cho task tương đương | < 1.0 là có lãi |
| `task.resolution_time` | Từ lúc tạo issue → đóng | Theo tier |

Dimension khuyến nghị: agent, complexity_tier, task_type.

### Nhóm 2 · Human-in-the-Loop — "Con người phải can thiệp nhiều không?"

| Metric | Định nghĩa | Ý nghĩa |
|---|---|---|
| `human.intervention_rate` | Task cần người can thiệp / tổng | Phải **giảm dần** theo thời gian — đây là chỉ số "học" của hệ thống |
| `human.escalation_count` | Số lần agent vượt lên hỏi người | Bất thường tăng = spec kém hoặc agent thiếu context |
| `human.override_rate` | Gate bị override / tổng lần đánh giá | > 10% = gate đặt sai chỗ (chặn oan) — xem lại policy |

### Nhóm 3 · Code Quality — "Chất lượng thứ agent viết?"

| Metric | Định nghĩa | Baseline nghiên cứu |
|---|---|---|
| `code.acceptance_rate` | PR được chấp nhận **nguyên vẹn** / tổng PR | AI ~0.27–0.30 — đừng kỳ vọng one-shot |
| `code.defect_density` | Lỗi / KLOC, tách theo author_type | So sánh AI vs human trong repo mình |
| `code.churn_rate` | Dòng bị sửa/xóa trong 14 ngày sau commit / tổng | AI cao hơn human ~0.41 — cần gate chống churn |
| `code.security_pass_rate` | Tỉ lệ pass scan bảo mật, theo author_type | 45% mẫu AI có lỗ hổng → không được thiếu gate |

**Attribution là linh hồn của nhóm này:** mọi metric phải tách được `author_type ∈ {ai-agent, human}` — không tách được thì không đánh giá đúng tác động của AI.

### Nhóm 4 · Economic Efficiency — "Chi phí bao nhiêu?"

| Metric | Định nghĩa |
|---|---|
| `cost.per_task` / `cost_per_line` / `tco_per_feature` | Toàn bộ chi phí một đơn vị sản xuất (token + compute + review) |
| `model_usage_mix` | Tỉ lệ gọi mô hình rẻ vs đắt — mục tiêu: routing majority về mô hình rẻ, chỉ việc khó lên mô hình đắt |
| `token_*`, `cache_hit_rate`, `cache_savings` | Hạch toán token đầu vào/ra/cache theo model, agent, stage |
| `human_review_cost` | Giờ review × đơn giá reviewer — review là bottleneck, phải hiện diện trong TCO |
| `budget_consumed` / `budget_remaining` / `retry_waste` | Vượt budget phải tự ABORT (ví dụ $50/task) |

Quy tắc: **mỗi lần gọi mô hình đều được hạch toán** (usage ledger). Không có hạch toán thì không có tối ưu.

### Nhóm 5 · Autonomy Trajectory — "Hệ thống đang tự chủ hơn chưa?"

| Metric | Định nghĩa |
|---|---|
| `autonomy.level` | Mức hiện tại (0–3) của từng agent |
| `autonomy.complexity_handled` | Phân bố độ phức tạp task agent tự xử |
| `autonomy.intervention_trend` | Trung bình trượt của intervention_rate — **phải giảm theo thời gian** |
| `autonomy.time_to_promotion` | Thời gian từ L(n) → L(n+1) |

Nhóm này là input trực tiếp của xét thăng/giáng cấp ở `03-org-autonomy.md`.

---

## 2. Thêm thước đo giao hàng (DORA + throughput thời AI)

Bộ AI-SDLC không thay DORA mà bổ sung góc nhìn "khi AI viết phần lớn code":

| Thước đo | Câu hỏi | Cảnh báo từ dữ liệu |
|---|---|---|
| Deployment frequency / Lead time | Giao nhanh hơn chưa? | Phải nhanh hơn — nếu không, bottleneck đang ở chỗ khác (review/gate) |
| Change failure rate | Ổn định không? | DORA: +25% AI adoption ↔ −7.2% stability nếu thiếu gates |
| **Review throughput** (PR merged/ngày, thời gian trong review) | Review có kịp không? | Faros: PR +98%, review time +91% — đây là meter cái cổ chai |
| **Rework rate** (số vòng sửa/PR) | Chất lượng spec thế nào? | > 1.5 vòng = spec hoặc context kém |
| **% pipeline do agent thực thi end-to-end** | Mức tự động hóa thực | Chân lý cho roadmap `07` |

---

## 3. Từ metric đến quyết định

| Tín hiệu | Nguyên nhân likely | Hành động |
|---|---|---|
| `acceptance_rate` < 0.2 | Spec kém / AGENTS.md thiếu / task quá phức tạp cho agent | Cải DoR; bổ sung context; giảm complexity score của task được dispatch |
| `override_rate` > 10% | Gate chặn oan | Hạ cấp gate (hard→soft→advisory) hoặc sửa ngưỡng |
| `intervention_trend` không giảm sau 1 tháng | Feedback loop hụt (agent không tự sửa được) | Play 8 (feedback loop); đầu tư evals |
| `churn_rate` AI >> human | Agent sinh code bỏ đi; thiếu kiểm soát | Gate anti-churn; review bản kế hoạch (plan mode) kỹ hơn |
| `human_review_cost` tăng nhanh | Review là nút thắt thật sự | Review phân tầng (AI lớp 1) + giới hạn PR size |
| `model_usage_mix` lệch về mô hình đắt | Routing sai | Xem `06-toolchain.md` mục model routing |
| Gate fail 0% hoặc 100% kéo dài | Gate vô nghĩa hoặc mục tiêu sai | Xóa hoặc viết lại quy tắc |

---

## 4. Dashboard & vận hành

### 4.1. Bố cục dashboard 4 panel (gợi ý)

1. **Flow:** task theo giai đoạn (funnel Plan→…→Maintain) + lead time + PR chờ review — *cho EM/lead.*
2. **Quality:** acceptance, churn, defect theo author_type + trạng thái gates — *cho Agentic Engineer.*
3. **Autonomy:** level từng agent + trend intervention + sự kiện thăng/giáng — *cho EM + Security.*
4. **Economics:** cost/task, budget vs actual, model mix — *cho lãnh đạo.*

### 4.2. Traces chuẩn hóa

Bật trace span theo pipeline để debug "tại sao task này chậm": `pipeline.stage → agent.task → gate.evaluation → handoff`, nối thành một trace trọn vòng đời issue (chuẩn ai-sdlc.io). Log bắt buộc có cấu trúc: `gate.failure`, `gate.override` (actor, role, giải thích), `autonomy.promotion/demotion`, `reconciliation.decision`.

### 4.3. Nhịp vận hành

- **Hằng ngày (async):** glance panel Flow + Quality; alert khi metric ngoài band.
- **Hằng tuần:** rà soát override + escalation; ghim 1 "ca học" (gate chặn đúng / agent làm tốt).
- **Hằng tháng:** xét thăng/giáng tự chủ theo bảng điều kiện ở `03`; rà soát bộ gate; báo cáo TCO.
- **Control band:** mỗi metric sản xuất đặt band bình thường ngay từ Plan (trong intent.md) — đây là điều kiện để Maintain tự động sinh intent mới khi lệch band.

### 4.4. Chống "gaming" metric

- Không KPI đơn lẻ (vd chỉ thưởng `task.success_rate` → agent/task được "chọn dễ"); luôn xem bộ 3: hiệu quả × chất lượng × chi phí.
- Thống kê theo **cửa sổ hiện tại** khi xét tự chủ (không dùng thành tích cũ — chuẩn ai-sdlc.io).
- Metric đo ở **điểm trung gian có thể giả** (số dòng, số PR) luôn cặp với outcome (defect, churn, rollback).

---

## 5. Khởi động tối thiểu (tuần đầu)

Không cần hệ thống lớn — bắt đầu với bảng sau trong spreadsheet (Google Sheets/Excel), tự động hóa dần:

| # | Metric khởi động | Thu bằng cách |
|---|---|---|
| 1 | PR theo author_type (AI/human) | Nhãn PR bắt buộc (PR template) |
| 2 | acceptance_rate + rework rate (vòng sửa/PR) | Thống kê PR |
| 3 | Thời gian trong review | GitHub/GitLab API |
| 4 | Cost/task (token & $) | Báo cáo provider API + usage ledger thủ công |
| 5 | Gate fail/override | Log CI |

Khi 5 số này ổn định → chuẩn hóa tên theo `ai_sdlc.*` và đẩy vào hệ thống observability thật.

---

*Tiếp theo: công cụ & kiến trúc tham chiếu → [`06-toolchain.md`](06-toolchain.md) · Về [README](../../README.md)*
