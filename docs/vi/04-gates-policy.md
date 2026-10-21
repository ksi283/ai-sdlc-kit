# 04 · Quality Gates, Chính sách & An toàn

> Lớp 3 của khung: hệ thống gate kiểm soát chất lượng qua từng cổng của vòng đời, mô hình áp dụng 3 cấp (advisory / soft / hard), quy trình đánh giá, các quy tắc an toàn zero-trust cho agent, và ánh xạ tuân thủ. Bảo mật sản phẩm (threat modeling, kiểm thử bảo mật, supply chain, quản lý lỗ hổng) có tài liệu riêng: [`08-security.md`](08-security.md).
> *(English: [`../en/04-gates-policy.md`](../en/04-gates-policy.md))*

---

## 1. Bản đồ gates trên vòng đời

```
 PLAN ────► DESIGN ────► BUILD ────► TEST ────► DEPLOY ────► MAINTAIN
           │            │           │          │
        ┌──┴───┐    ┌───┴──┐   ┌────┴───┐  ┌───┴────┐
        │ DoR  │    │Build │   │Quality │  │Deploy  │
        │ gate │    │Ready │   │ gates  │  │ gates  │
        └──────┘    └──────┘   └────────┘  └────────┘
           │            │           │          │
        issue chưa   PR chưa     PR chưa    release chưa
        sẵn sàng    pass build  qua review  an toàn
        → KHÔNG     → KHÔNG     → KHÔNG     → KHÔNG
        dispatch    vào TEST    merge       deploy
```

| Gate | Đứng ở đâu | Chặn cái gì | Ví dụ quy tắc |
|---|---|---|---|
| **Intent-Ready** | Plan → Design | Intent không đủ mục tiêu/metric | Phải có: vấn đề, bằng chứng, metric thành công, owner |
| **DoR** (Definition of Ready) | Design → Build | Task chưa sẵn sàng cho agent | Acceptance criteria đo được; task ≤ 1 buổi; non-goals rõ; chiến lược test nêu |
| **Build-Ready** | Build → Test | PR chưa đủ điều kiện review | Build pass; test phủ thay đổi; PR ≤ giới hạn mức tự chủ; provenance đầy đủ |
| **Quality gates** | Test → Deploy (merge) | Code chưa đủ tin để merge | Coverage ≥ 80%; 0 lỗi scan nghiêm trọng; ≥ 1 người duyệt (task medium+); evals trong band; attribution AI có hiệu lực |
| **Deploy gates** | Deploy → Maintain | Release chưa an toàn | Người duyệt release đã ký (hook); runbook rollback có; monitoring trỏ metric mới; canary ≤ 5% |

---

## 2. Ba cấp áp dụng (enforcement)

Kế thừa mô hình Sentinel/Gatekeeper của ai-sdlc.io — **logic quy tắc tách rời mức cứng rắn**; cùng một quy tắc có thể chạy ở cấp khác nhau tùy ngữ cảnh:

| Cấp | Hành vi khi fail | Dùng cho | Ví dụ |
|---|---|---|---|
| **Advisory** (khuyến nghị) | Cảnh báo + dashboard, KHÔNG chặn | Chính sách mới đang kiểm chứng, guideline phong cách | "Coverage nên ≥ 70%" trong tháng đầu |
| **Soft-mandatory** (chặn + được vượt) | Chặn, trừ khi người có role phù hợp override kèm giải thích (ghi audit, không tự gia hạn) | Governance hằng ngày | "Cần 1 reviewer" — lead có thể vượt khi gấp |
| **Hard-mandatory** (chặn tuyệt đối) | Chặn, **không ai được vượt**, kể cả admin | Bảo mật, tuân thủ, an toàn production | "Cấm secret trong code", "cần human-review cho thay đổi luồng auth" |

> Quy tắc vàng: **hard-mandatory chỉ dành cho thứ thật sự không thể thương lượng** — lạm dụng sẽ biến gate thành nút tắt cả pipeline. Mặc định bắt đầu ở advisory, nâng cấp lên soft khi ổn định, hard khi đã chứng minh quy tắc đúng.

### 2.1. Quy trình đánh giá một hành động (mô phỏng admission control kiểu Kubernetes)

```
1. AUTHENTICATION  → đây là người, agent (AgentRole nào), hay bot/service?
2. AUTHORIZATION   → mức tự chủ của agent có cho phép hành động này?
3. MUTATING GATES  → tự động đệm request: gán nhãn, provenance, reviewer mặc định
4. VALIDATION      → schema/định dạng của request
5. ENFORCING GATES → chạy mọi QualityGate; 1 hard fail = chặn cả hành động
6. ADMISSION       → cho qua, HOẶC từ chối kèm danh sách đầy đủ các gate fail
```

### 2.2. Quy tắc override (chỉ tồn tại ở soft-mandatory)

- Kiểm tra role người vượt (`requiredRole`).
- Bắt buộc giải thích khi `requiresJustification: true` (mặc định bật).
- Ghi audit **bất biến**: gate nào, ai, role gì, giải thích, thời điểm, resource nào.
- Override chỉ hiệu lực **một lần đánh giá** — chu kỳ sau gate fail lại thì phải xử lý tận gốc, không "gian lận bằng cách override thường trực".

---

## 3. Năm loại quy tắc gate

| Loại | Cơ chế | Ví dụ |
|---|---|---|
| **Metric-based** | So sánh ngưỡng số | coverage ≥ 0.80; churn ≤ ngưỡng; pass-rate eval ≥ 0.9 |
| **Tool-based** | Chạy công cụ, so kết quả theo severity | SAST/SAST scan: 0 critical, ≤ 5 medium; dependency audit pass |
| **Reviewer-based** | Số/cấu trúc người duyệt | ≥ 1 reviewer (medium+); 2 reviewer nếu chạm auth/payment; reviewer ≠ tác giả PR |
| **Documentation-based** | Tài liệu tồn tại khi file đổi | Đổi API → CHANGELOG + docs cập nhật; module mới → README |
| **Provenance-based** | Truy xuất nguồn gốc | Mọi PR có attribution AI/human (model, promptHash, thời điểm); AI-authored → bắt buộc human-review record |

Điểm nâng cao (tùy chọn): viết quy tắc bằng Rego (OPA) cho kiểm tra chéo resource, hoặc CEL cho biểu thức nhẹ; tham chiếu policy ngoài thay vì nhúng.

**Ngưỡng khắt khe hơn cho AI:** cùng một gate có thể đặt ngưỡng khác nhau theo `authorTypes` (vd: AI-code cần 2 reviewer, human-code 1 reviewer; AI-code bị chặn ở các path security-sensitive khi agent < L2) — không cần định nghĩa gate riêng.

---

## 4. An toàn zero-trust cho agent

Bối cảnh: 45% mẫu code AI trong thử nghiệm có lỗ hổng bảo mật (ai-sdlc.io); reviewer phải độc lập với bên triển khai — "review chạy ở nơi implementer không với tới được".

### 4.1. Sandbox & cách ly

- Agent thực thi trong **container/sandbox riêng**, mỗi task một **worktree + branch cô lập** (`ai-sdlc/issue-{n}` theo quy ước ai-sdlc.io, hoặc `feat/task-{id}`).
- Môi trường test tự chứa (Docker) — không chạm network/staging trừ khi cấp rõ.
- Không cho agent chạy lệnh tương tác, không GUI, mọi thứ khai báo.

### 4.2. Credential theo phạm vi & thời gian

- Cấp **scoped, short-lived**: TTL ngắn, tự thu hồi khi task xong; nguyên tắc least privilege cho từng AgentRole.
- Không bao giờ nhét long-lived token vào môi trường agent.
- Ghi mọi lượt dùng credential vào usage ledger.

### 4.3. Provenance & attribution

Mọi artifact (PR, review, deploy) mang metadata bắt buộc: `model` (mô hình nào), `tool` (agent/harness nào), `promptHash` (SHA-256), `timestamp`; tùy chọn: `humanReviewer`, `reviewDecision`. Gate `requireAttribution` kiểm tra trước khi chấp nhận. **Mục tiêu: mọi dòng code trả lời được câu hỏi "ai/máy gì tạo ra, dựa trên prompt nào, ai đã duyệt".**

### 4.4. Bảo mật cụ thể của workflow agent

| Rủi ro | Biện pháp |
|---|---|
| **Prompt injection** (mã/comment độc khiến agent làm sai) | Đánh dấu nội dung không tin cậy; agent không tin lệnh nhúng trong file/issue/PR description; tách quyền đọc và hành động |
| **Secret lộ trong PR** | Gate hard: secret-scan; sandbox không có secret thật (dùng giá trị giả khi test) |
| **Supply-chain** (dependency độc) | Lockfile bắt buộc; gate audit dependency + license; agent không tự thêm dependency mới không có trong allowlist |
| **Exfiltration dữ liệu** | Egress filter khỏi sandbox; chỉ export qua kênh được khai báo |
| **Lạm dụng quyền merge/deploy** | Hook giữ hành động nhạy cảm; agent < L3 không merge; deploy production luôn do người ký |
| **"Review giả"** (mô hình tự duyệt code mình viết) | Cross-harness review bắt buộc — reviewer khác vendor/harness với implementer |

### 4.5. Proof of Execution

Mỗi kết luận review phải gắn được về **đúng diff đã review** (hash), chạy bởi **harness độc lập** — chống "chấp nhận không review" hay "review cái khác với cái merge".

---

## 5. Bộ gate khởi động khuyến nghị (cho team mới)

Xem bản YAML sẵn dùng: [`templates/quality-gates.yml`](../../templates/quality-gates.yml). Tóm tắt triết lý: *mở ở advisory 2–4 tuần → nâng soft-mandatory → chỉ nâng hard khi dữ liệu nội bộ chứng minh quy tắc bắt đúng vấn đề thật.*

| Gate | Quy tắc | Cấp khởi động | Cấp mục tiêu |
|---|---|---|---|
| DoR | Spec có acceptance criteria + non-goals | soft | soft |
| DoR | Task có complexity score | advisory | soft |
| Build | Build + lint + unit test pass | hard (CI sẵn có) | hard |
| Build | PR size theo mức tự chủ (L1 ≤ 200…) | advisory | soft |
| Quality | Coverage diff ≥ 80% dòng mới | advisory | soft |
| Quality | SAST/dependency: 0 critical | soft | **hard** |
| Quality | ≥ 1 human reviewer (task medium+) | soft | soft (LUÔN mềm để có đường gấp) |
| Quality | Attribution đầy đủ | advisory | soft |
| Quality | Evals trong band (nếu có evals) | advisory | soft |
| Deploy | Human approval qua hook | **hard** | **hard** |
| Deploy | Runbook rollback tồn tại | advisory | soft |

---

## 6. Ánh xạ tuân thủ (compliance mapping)

Nếu tổ chức bạn thuộc phạm vi quy định, gates chính là nơi "code hóa" nghĩa vụ tuân thủ:

| Khung | Yêu cầu cốt lõi | Cơ chế trong AI-SDLC này |
|---|---|---|
| **EU AI Act** | Phân tầng rủi ro; minh bạch về AI | Routing theo phức tạp; attribution + provenance trên mọi PR |
| **NIST AI RMF** | Govern · Map · Measure · Manage | Policy layer (Govern); complexity scoring (Map); metrics 5 nhóm (Measure); autonomy + gates (Manage) |
| **ISO/IEC 42001** | Hệ thống quản lý AI theo PDCA | Toàn khung là vòng Plan-Do-Check-Act: intent→deploy→metrics→intent mới |
| **ISO 12207** | Quy trình lifecycle phần mềm | 6 giai đoạn + artifacts ánh xạ trực tiếp |
| **OWASP ASI** | Bảo mật agentic system | Mục 4 (sandbox, credential, injection, exfil) |
| **CSA Agentic Trust** | Zero-trust cho agent | Autonomy L0–L3 + reviewer independence |

---

## 7. Checklist "policy-as-code" hoàn chỉnh

Trước khi gọi là xong, tổ chức của bạn nên có:

- [ ] Repo trung tâm chứa `quality-gates.yml` + `autonomy-policy.yml` (có review, có phiên bản như code)
- [ ] Mỗi gate có: chủ sở hữu (ai trả lời khi gate fail oan), cấp áp dụng, ngưỡng, và lý do nghiệp vụ
- [ ] Audit trail bất biến cho mọi override/promotion/demotion/merge-do-agent
- [ ] Định kỳ (tháng): rà soát tỉ lệ fail/override từng gate — gate fail 100% hoặc 0% đều đáng xem lại
- [ ] DRILL: thử mô phỏng 1 sự kiện demotion (ai sẽ làm gì, trong bao lâu?) — đặc tả ai-sdlc.io yêu cầu thông báo demotion trong ~1s

---

*Tiếp theo: đo lường → [`05-metrics.md`](05-metrics.md) · Về [README](../../README.md)*
