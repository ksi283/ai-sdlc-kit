# 13 · Kế hoạch v2 — Một Kit, Nhiều Người

> Trả lời v2 cho câu hỏi: *"Cả team cùng dùng bộ kit này — làm sao làm việc không bị loạn? Không ai dẫm chân ai trong quá trình phát triển?"* Version 1 chứng minh một người chạy được vòng đời. Version 2 biến kit thành **multi-tenant**: nhiều thành viên, nhiều squad, nhiều project — một nguồn chân lý chung. *(English: [`../en/13-roadmap-v2.md`](../en/13-roadmap-v2.md))*

---

## 1. Loạn thực sự đến từ đâu (gọi tên trước khi chữa)

| # | Nguồn xung đột | Hỏng thế nào ở v1 |
|---|---|---|
| C1 | **Trôi template** — mỗi người copy templates một lần | 6 project chạy 6 format intent/spec khác nhau; gates không kiểm tra đồng bộ được |
| C2 | **Sửa policy lén lút** — người này sửa `quality-gates.yml` ở máy mình | Đồng đội build theo luật khác; "passed on my machine" quay lại |
| C3 | **Đụng độ context chung** — hai người sửa cùng một `AGENTS.md` / một intent | Conflict khi merge, ghi đè quy ước của nhau |
| C4 | **Làm việc song song trên cùng task** — hai agent, cùng worktree/issue | PR trùng lặp, review kép, race condition |
| C5 | **Skill pack lệch version** — mỗi người cài một version | Output thiết kế và checklist không còn khớp giữa các thành viên |
| C6 | **Mơ hồ sở hữu** — "ai review cái gì, ai sở hữu gate nào" | Review dồn lên một người; người khác ngồi không |
| C7 | **Sốc nâng cấp** — kit đổi làm gãy việc đang dở | Không có đường deprecation; thành viên pin bản cũ nằm im |

v2 = một cơ chế cho từng dòng, không phải một cuộc họp về nó.

## 2. Kiến trúc v2: ba repo, không phải một

```
┌──────────────────────────┐   tiêu thụ qua template/installer
│  KIT REPO (repo này)     │ ────────────────────────────────►  PROJECT REPOS (N)
│  guides · templates ·    │        mỗi squad/project nhận       your-app/…
│  skills registry · CI    │        một bản + AGENTS.md riêng    ├─ intents/specs riêng
└───────────┬──────────────┘                                     ├─ gate battery riêng
            │ tham chiếu qua                                     └─ branch protection riêng
            ▼ (submodule / pinned reference / CODEOWNERS)
┌──────────────────────────┐
│  POLICY REPO (mới, v2.1) │  quality-gates.yml · autonomy-policy.yml
│  sở hữu: Policy Council  │  CODEOWNERS: security-lead sở hữu hard gates
└──────────────────────────┘
```

- **Kit repo** = học thuyết + templates + skill registry (nguồn thượng nguồn). Chỉ đổi qua PR.
- **Project repos** = nơi việc diễn ra; mỗi repo sở hữu intents, branches, PR của mình.
- **Policy repo** = nơi duy nhất chứa gates; các project tham chiếu **commit được pin** —
  C2 chết tại đây: đổi gate là sự kiện được review, có phiên bản, được công bố — không bao
  giờ là sửa tại chỗ.

## 3. "Không ai dẫm chân ai" — cơ chế cụ thể

| Xung đột | Cơ chế v2 | Học thuyết gốc |
|---|---|---|
| C4 task song song | **1 task = 1 branch = 1 PR** cưỡng chế bằng branch protection; orchestrator cấp **worktree riêng mỗi task**; ID intent/spec có namespace (`INT-YYYYMM-NNN-<team>`) | Kỷ luật Play + `templates/pipeline.yml` |
| C3 context chung | `AGENTS.md` **theo repo** (không dùng chung); chuẩn chung sống trong kit ở dạng **skills** (import chỉ-đọc, không copy text); CODEOWNERS cho path nhạy cảm | P6 knowledge-as-code |
| C6 sở hữu | RACI thành thật bằng **CODEOWNERS** mọi repo: Spec Reviewer sở hữu `specs/**`, Security Lead sở hữu rule hard trong `quality-gates.yml` + `src/auth/**`, EM sở hữu autonomy policy | docs/vi/03 RACI |
| C2 policy trôi | policy repo + tham chiếu pin; gates có phiên bản (`v1` → `v1.1`), thay đổi công bố qua changelog của kit | docs/vi/04 policy-as-code |
| C5 skill lệch | registry **pin đúng version** (`ui-ux-pro-max@2.15.0`); nâng cấp là một PR, không phải cảm tính | `skills/registry.yml` (có từ v1.4) |
| C1 template trôi | kit phân phối như **GitHub Template Repository**; project nhận nâng cấp qua **cửa sổ merge-upstream** (hằng tháng) — xem §5 | — (mới ở v2) |
| C7 sốc nâng cấp | **quy tắc deprecation**: đổi template/policy phải kèm migration note và cửa sổ chạy song song 2 tuần; việc đang dở chạy nốt trên bản cũ | docs/vi/10 §2 versioning |

## 4. Vai trò ở v2 (mở rộng docs/vi/03 §2)

| Vai trò | Sở hữu | Bổ sung v2 |
|---|---|---|
| **Kit Maintainer** (1–2 người) | kit repo: templates, docs, CI, registry | versioning (semver), changelog, cửa sổ nâng cấp |
| **Policy Council** (Security Lead + EM + 1 senior) | policy repo | thay đổi gate; rà soát gate hằng quý |
| **Agentic Engineer** (mỗi squad) | project repos của squad | AGENTS.md, usage skills, routing task |
| **Mọi người** | intents/branches/PR của mình | chạy đúng vòng đời; đề xuất đổi kit bằng PR |

Quy tắc chống giành giành lãnh địa: **kit chỉ đổi bằng PR vào kit repo; policy chỉ đổi
bằng PR vào policy repo** — không bao giờ sửa tại chỗ, không bao giờ chốt qua chat.

## 5. Versioning & luồng nâng cấp (C1, C7)

```
kit v1.x ──► v2.0 (template repo + installer) ──► v2.1 (policy repo) ──► v2.2+ (bên dưới)
                │                                     │
                └────────── project pin một version kit; nâng cấp = PR merge tag mới
                            + xử lý migration notes
```

- Kit release dùng **semver**: MAJOR = đổi format template/policy (bắt buộc migration note),
  MINOR = thêm plays/templates, PATCH = sửa lỗi.
- **Cửa sổ nâng cấp hằng tháng**: mỗi project một PR cập nhật version kit được pin;
  conflict do Agentic Engineer của project xử lý, Kit Maintainer review.
- Thay đổi template làm gãy spec đang dở thì chờ cửa sổ kế tiếp — cửa sổ chính là bộ đệm
  khiến "không ai dẫm chân ai" đúng cả theo thời gian.

## 6. Các cột mốc v2

| Cột mốc | Nội dung | Xong khi |
|---|---|---|
| **v2.0** | Kit publish thành GitHub Template Repository; `docs/vi/12` được xác minh bởi một người thứ hai build từ đầu | một thành viên không được ai hướng dẫn đạt gates xanh trong < 1 giờ |
| **v2.1** | Tách policy repo; CODEOWNERS mọi nơi; project tham chiếu policy pin | cố đổi gate không qua PR là bất khả thi về cấu trúc |
| **v2.2** | Registry mở rộng (2–3 packs); skill do kit tự viết xuất hiện (`skills/<name>/SKILL.md`) | hai squad cho ra output thiết kế khớp nhau từ cùng version pack |
| **v2.3** | Dashboard team: gộp metrics đa project (nhóm docs/vi/05), review tự chủ theo agent | EM thấy flow/quality/autonomy của mọi squad trên một panel |
| **v2.4** | Pilot đa squad trên sản phẩm thật; retrofit bài học vào docs | một chu kỳ release không vụ "dẫm chân" nào (checklist C1–C7 sạch) |

## 7. Điều KHÔNG đổi ở v2

Vòng đời giữ nguyên như `02`: cùng 6 giai đoạn, cùng gates, cùng kiểu kiếm tự chủ. v2 thêm
**topology và sở hữu quanh** vòng đời — không bao giờ biến thành một quy trình thứ hai chồng
lên quy trình thứ nhất. Nếu một cơ chế v2 mâu thuẫn docs/02–11 thì cơ chế sai; sửa cơ chế.

---

*Về [README](../../README.md) · onboarding → [`12-onboarding.md`](12-onboarding.md)*
