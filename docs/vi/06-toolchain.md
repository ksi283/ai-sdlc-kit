# 06 · Công cụ & Kiến trúc Tham chiếu

> Bản dịch vendor-neutral của kiến trúc "AI-led SDLC" (Microsoft) kết hợp mô hình orchestration của ai-sdlc.io: kiến trúc tham chiếu end-to-end, bảng chọn công cụ theo giai đoạn, chiến lược model routing, và các pattern tích hợp CI/CD.
> *(English: [`../en/06-toolchain.md`](../en/06-toolchain.md))*

---

## 1. Kiến trúc tham chiếu end-to-end

```
┌─────────────────────────  NGUỒN (SOURCES)  ─────────────────────────┐
│  Issues/Ticket · Sự cố production · Metric lệch band · Ý tưởng      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  PLAN · DESIGN  ───────────────────────────┐
│  intent.md ──► Spec Engine (kiểu GitHub Spec Kit: /specify /plan    │
│  /tasks) ──► spec.md + plan.md + tasks (chấm phức tạp 1–10)         │
│  ► DoR GATE (chặn issue chưa sẵn sàng)                               │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  BUILD  ───────────────────────────────────┐
│  Orchestrator (điều phối): chọn task qua DoR → cấp worktree riêng   │
│      └─► Coding Agent (CLI, trong sandbox/container)                │
│              · phân tích repo · code + test · 1 task = 1 PR         │
│              · feedback loop: chạy test tự sửa trong container      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  TEST · REVIEW  ───────────────────────────┐
│  Lớp 1 (máy):  ≥2 Reviewer AI ĐỘC LẬP (khác harness với builder)   │
│                + evals + SAST/dependency scan                       │
│  Lớp 2 (người): phần critical/regulated theo routing                │
│  ► QUALITY GATES (advisory / soft / hard)                           │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  DEPLOY  ──────────────────────────────────┐
│  CI/CD · Triage Agent (phân loại lỗi build, thử sửa)                │
│  ► DEPLOY GATE: hook giữ release chờ human approval                 │
│  Progressive rollout: canary → % tăng dần (feature flags)           │
└──────────────────────────────────┬───────────────────────────────────┘
                                   ▼
┌─────────────────────────  MAINTAIN  ────────────────────────────────┐
│  Observability (metric/log/trace) · SRE Agent (giám sát, chẩn đoán, │
│  mở PR sửa, đề xuất rollback)                                       │
│  ──► Findings ──► Issues mới ──► intent.md mới ──► (quay lại PLAN)  │
└──────────────────────────────────────────────────────────────────────┘
```

Nguyên tắc kiến trúc rút ra từ 2 nguồn: **mỗi task một nhánh một PR**, **reviewer độc lập với builder**, **mọi pha có vòng phản hồi riêng**, **con người luôn "trong vòng" ở các cổng phê duyệt**.

---

## 2. Chọn công cụ theo giai đoạn

Bộ khung không ràng buộc vendor — mỗi hàng có các lựa chọn tương đương:

| Thành phần | Vai trò | Lựa chọn phổ biến (2026) |
|---|---|---|
| **Coding agent (CLI)** | Build: hiện thực hóa task | Claude Code · Codex CLI · Gemini CLI · OpenCode · Aider |
| **Agent trong IDE** | Build: cặp đôi với người (ai-assisted) | Copilot · Cursor · Windsurf |
| **Spec engine** | Design: spec → plan → tasks | GitHub Spec Kit · template `spec.md`/`plan.md` của bộ này + agent CLI |
| **Orchestrator / pipeline agent** | Điều phối task, worktree, fan-out | ai-sdlc framework (Apache-2.0) · GitHub Actions workflows tự viết · Claude Code hooks/subagents |
| **AI code review** | Test lớp 1 | GitHub Copilot Code Review · CodeRabbit · Claude (GitHub Action) · Axolo — **chạy ≥2 khác họ** |
| **CI/CD** | Deploy + chạy gates | GitHub Actions · Azure DevOps · GitLab CI · Jenkins |
| **Scan bảo mật** | Quality gates tool-based | Semgrep · Snyk · SonarQube · GitHub Advanced Security |
| **Evals** | Test liên tục | promptfoo · OpenAI Evals · Braintrust · tự viết (pytest-style) |
| **Observability** | Maintain | New Relic · Datadog · Grafana/Prometheus + OpenTelemetry GenAI |
| **Model gateway** | Routing + hạch toán | Azure OpenAI · AWS Bedrock · OpenRouter · LiteLLM (self-host, có usage ledger) |

Lưu ý chọn lựa:
- **Reviewer phải khác harness với builder** (cross-harness) — nếu builder là Claude Code thì reviewer nên là GPT hoặc Gemini, và ngược lại.
- **Model gateway có usage ledger** là điều kiện để nhóm metric Economic (`05`) có dữ liệu.
- Sandbox: Docker/Podman đủ cho phần lớn trường hợp; container-per-task như mô hình Microsoft.

---

## 3. Model routing — mô hình nào cho pha nào

Chuẩn hóa từ bài Microsoft (đã kiểm chứng trong thực tế) + nguyên tắc "model economics":

| Pha | Nhu cầu mô hình | Cấu hình tham chiếu | Nguyên tắc |
|---|---|---|---|
| **Spec / Plan (Design)** | Reasoning cao, sáng tạo có kiểm soát | Mô hình reasoning cao, temperature ≈ 0.2, tăng reasoning effort | Giảm "code ảo": suy nghĩ kỹ trước khi viết, temp thấp tránh bịa |
| **Implement (Build)** | Tuân thủ kế hoạch, hiệu quả chi phí | Mô hình trung cấp, temperature ≈ 0.1 | Đã có plan rồi — việc cần làm chuẩn, không cần suy luận đắt đỏ |
| **Review (Test)** | Phản biện độc lập, sâu | **2 mô hình khác họ**, reasoning cao, song song | Độc lập = bắt được lỗi lẫn nhau (mô hình cùng họ cùng mù) |
| **Triage lỗi build** | Nhanh, rẻ | Mô hình nhẹ | Việc phân loại cơ học — đừng đốt mô hình đắt |
| **SRE / Maintain** | Phân tích nhân-quả dài chuỗi | Mô hình reasoning cao, context dài | Đối chiếu metric ↔ commit cần suy luận chuỗi |

Nguyên tắc kinh tế (từ `05-metrics.md`): mặc định routing về **mô hình rẻ**, chỉ việc khó mới lên mô hình đắt; theo dõi `model_usage_mix`; đặt **budget trần per-task** (tự abort khi vượt, vd $50).

---

## 4. Pattern tích hợp CI/CD

### 4.1. Evals trong pipeline (Play 9)

```yaml
# Tư tưởng (giản lược) — chạy trên PR và cả khi agent-config đổi
on:
  pull_request:
  push:
    paths: ["AGENTS.md", ".agent/**", "evals/**"]   # setup agent đổi → chạy lại
jobs:
  evals:
    runs-in: sandbox-container
    steps:
      - run: evals run --suite core --fail-below 0.9   # gate quality (soft)
      - run: semgrep --error max                       # scan (hard: critical)
```

### 4.2. Review phân tầng trên PR

```
PR mở
 ├─ (bắt buộc) CI: build + test + lint + scan
 ├─ (bắt buộc) Reviewer A (khác họ builder) → chấm + nhận xét
 ├─ (bắt buộc) Reviewer B (họ thứ ba) → chấm + nhận xét
 ├─ (tùy routing) Human review: task medium+ hoặc chạm path nhạy cảm
 └─ Merge gate: mọi check xanh + approval + provenance hợp lệ
```

### 4.3. Hook phê duyệt trước hành động nhạy cảm (Play 11)

- Claude Code hooks / CI protected environments / deployment approvals: **hành động giữ lại chờ người có role** — không "nhớ lựa chọn" cho lần sau (override một lần, xem `04`).
- Ví dụ scope nhạy cảm: merge→main khi đổi auth/payment, deploy production, xóa dữ liệu, đổi chính sách gate.

### 4.4. Vòng Maintain: observability → issue

```
Alert (metric ngoài control band) → SRE agent: gom ngữ cảnh
   (metric + deploy gần nhất + log + trace)
 → phân loại: (a) tự mở PR sửa (task low, agent ≥ L2)
              (b) mở issue kèm phân tích (task medium+)
 → postmortem (nếu severity cao) → intent.md mới → Plan
```

Tích hợp điển hình: GitHub Actions chạy SRE agent theo lịch/prompt bởi webhook cảnh báo (mô hình Microsoft CodeWatcher/CodeReviewer); New Relic/Datadog webhook → GitHub issue.

---

## 5. Repo layout khuyến nghị cho một dự án áp dụng

```
your-project/
├── AGENTS.md                 # context chuẩn cho mọi agent (template của bộ này)
├── .agent/
│   ├── skills/               # skills: chuẩn review, quy ước domain (Play 6)
│   └── policy/               # symlink/submodule tới repo policy trung tâm
├── docs/
│   └── intents/              # intent-2026-10-XXX-*.md (mọi ý định có phiên bản)
├── specs/
│   └── 2026-10-XXX-todo-api/ # spec.md + plan.md theo từng work
├── evals/
│   └── suites/               # eval cases chạy trong CI
└── .github/
    ├── workflows/            # ci.yml (gates), evals.yml, sre.yml (maintain)
    ├── CODEOWNERS            # path nhạy cảm → reviewer bắt buộc
    ├── PULL_REQUEST_TEMPLATE.md
    └── settings.yml          # protected branch, required checks
```

---

## 6. Checklist tích hợp khi bắt đầu

- [ ] AGENTS.md đặt ở gốc repo, mọi agent CLI đọc được; cập nhật như code (có review)
- [ ] 1 task = 1 branch = 1 PR được enforce (hoặc tối thiểu là quy ước review)
- [ ] CI bắt buộc: build + test + lint + secret-scan trước khi review
- [ ] ≥ 1 reviewer AI độc lập với builder chạy trên mọi PR
- [ ] Deploy production nằm sau approval gate (protected environment)
- [ ] Observability có metric gắn với release (để vòng Maintain hoạt động)
- [ ] Usage ledger bật ở model gateway (chi phí per-task)
- [ ] Policy (gates + autonomy) nằm trong repo có phiên bản, không phải cấu hình tay rải rác

---

*Tiếp theo: lộ trình triển khai → [`07-adoption.md`](07-adoption.md) · Về [README](../../README.md)*
