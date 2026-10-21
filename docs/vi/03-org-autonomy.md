# 03 · Tổ chức, Vai trò & Mức Tự chủ

> Ai làm gì trong AI-SDLC: vai trò mới của con người, trách nhiệm theo từng giai đoạn (RACI), hệ thống mức tự chủ L0–L3 "kiếm quyền bằng bằng chứng", và cơ chế routing công việc theo độ phức tạp.
> *(English: [`../en/03-org-autonomy.md`](../en/03-org-autonomy.md))*

---

## 1. Nguyên tắc phân việc

Hai trục quyết định "ai làm việc này":

```
            Rủi ro / phức tạp CAO
                  │   human-led
                  │   (agent chỉ hỗ trợ tra cứu)
                  │
  ai-with-review │  ai-assisted
  (AI làm,       │  (người làm,
   người duyệt)  │   AI đề xuất)
                  │
                  │   fully-autonomous
                  │   (chỉ L2–L3, task tầm thấp,
            Rủi ro / phức tạp THẤP    audit sau)
```

1. **Theo độ phức tạp của CÔNG VIỆC** (routing 1–10) — mục 4.
2. **Theo mức tự chủ của AGENT** (L0–L3, earn-by-evidence) — mục 3.

Hai trục độc lập: agent L3 vẫn không được nhận task "critical" (điểm 9–10); task tầm thấp vẫn cần người duyệt nếu agent đang ở L1.

---

## 2. Con người: vai trò mới và RACI

### 2.1. Các vai trò

| Vai trò | Trách nhiệm chính trong AI-SDLC | Tương đương truyền thống |
|---|---|---|
| **Owner / Author** | Ký intent, quyết định scope & metric thành công | PO / requester |
| **Spec Reviewer** | Duyệt spec + DoR; chốt trade-off; chấm độ phức tạp task | Tech lead / analyst |
| **Agentic Engineer** ⭐ mới | Thiết kế & vận hành pipeline agent: `AGENTS.md`, skills, evals, gates, model routing; là "kỹ sư của hệ thống agent" thay vì "người gõ code" | Senior dev tiến hóa |
| **Platform Engineer** | Hạ tầng: adapter (repo/CI/tracker), sandbox, credential, dashboard | DevOps/Platform |
| **Security & Compliance Lead** | Định nghĩa hard gates, audit trail, provenance, ánh xạ tuân thủ (ISO 42001, NIST RMF, EU AI Act) | AppSec + GRC |
| **Engineering Manager** | Quản lý AutonomyPolicy: xét thăng/giáng mức tự chủ theo metrics; xử lý override | EM |
| **Operator** (vai khi cần) | Theo dõi luồng qua TUI/dashboard, trả lời câu hỏi hệ thống không tự quyết được (escalation) | on-call nâng cao |

> **Agentic Engineer** là nghề đang hình thành (ai-sdlc.io gọi là "kiến trúc sư chiến lược của hệ thống giao hàng thông minh") — giỏi feedback loop, orchestration và policy chứ không chỉ code.

### 2.2. RACI theo giai đoạn

R = thực hiện, A = chịu trách nhiệm/chốt, C = tham vấn, I = được thông báo.
(**AE** = Agent — thực thi phần việc AI; các chữ còn lại là người.)

| Hoạt động | Owner | Spec Rev. | Agentic Eng. | Plat. Eng. | Sec Lead | EM | AE |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Viết & ký intent.md | **A/R** | C | I | – | I | I | R (nháp) |
| Duyệt spec + DoR | C | **A** | C | I | C | I | R (soạn) |
| Viết code + test (theo task) | I | – | C | – | – | – | **R** |
| Giữ `AGENTS.md`/skills | I | C | **A/R** | C | C | I | – |
| Review lớp 1 (AI, đa mô hình) | – | I | C | – | C | – | **R** |
| Review lớp 2 (người, critical) | I | **A/R** | R | – | **R** | I | – |
| Merge / phê duyệt deploy | I | C | C | R | C (hard gate) | I | R (triage) |
| Vận hành SRE agent | I | – | C | R | C | I | **R** |
| Xét thăng/giáng tự chủ | I | C | C | I | C | **A** | – |
| Postmortem → intent mới | **R** | C | R | C | C | **A** | R (dữ liệu) |

Nguyên tắc P4 giữ nguyên: **cột A luôn là con người** — agent có thể là R ở nhiều chỗ, không bao giờ là A.

---

## 3. Mức tự chủ của agent: L0–L3

Tiêu chuẩn lấy từ đặc tả ai-sdlc.io (chuẩn CSA ATF + Knight-Columbia), điều chỉnh cho gọn.

### 3.1. Định nghĩa các mức

| | **L0 · Observer** | **L1 · Junior** | **L2 · Senior** | **L3 · Principal** |
|---|---|---|---|---|
| **Được làm** | Đọc mọi resource; không tạo artifact | Draft PR, comment, chạy test suite | Branch + PR, chạy test/lint/build | L2 + merge non-critical + deploy **staging** |
| **Cần người duyệt** | Mọi hành động | Mọi thay đổi trước khi thực hiện | Chỉ phần security-critical | Chỉ thay đổi kiến trúc |
| **Giới hạn PR (khuyến nghị)** | – | ≤ 200 dòng | ≤ 500 dòng | ≤ 1000 dòng |
| **Thời gian tối thiểu ở mức** | 2 tuần | 4 tuần | 8 tuần | Không (validation liên tục) |
| **Chế độ làm việc mặc định** | Quan sát/học | ai-assisted → ai-with-review | ai-with-review | fully-autonomous (task low/medium) |
| **Hình dung** | "Thực tập sinh chỉ đọc" | "Junior mọi PR đều cần duyệt" | "Senior được tự làm, duyệt phần nhạy cảm" | "Principal tự chạy trong domain, validation sau" |

**Nguyên tắc Least Autonomy (bắt buộc):** agent luôn khởi động ở L0/L1; hệ thống phải **từ chối** cấu hình đặt mức khởi tạo > L1. "Tự chủ là kiếm được qua độ tin cậy đã chứng minh, không phải được cấp qua cấu hình."

### 3.2. Điều kiện thăng cấp (thỏa ĐỒNG THỜI)

| Điều kiện | L1→L2 | L2→L3 |
|---|:-:|:-:|
| PR approval rate (cửa sổ hiện tại) | ≥ 0.90 | ≥ 0.95 |
| Rollback rate | ≤ 0.02 | ≤ 0.01 |
| Số vòng sửa trung bình mỗi PR | ≤ 1.5 | ≤ 1.5 |
| Sự cố bảo mật gây ra | = 0 | = 0 |
| Sự cố production gây ra | = 0 | = 0 |
| Coverage duy trì | ≥ 0.80 | ≥ 0.80 |
| Số task tối thiểu ở mức hiện tại | theo chính sách (vd 50) | theo chính sách |
| Thời gian ở mức hiện tại | ≥ 4 tuần | ≥ 8 tuần |
| Phê duyệt con người | EM + Sec Lead ký | EM + Sec Lead ký |

Chỉ tính hiệu suất **ở mức hiện tại** — thành tích mức trước không tính lại. Đánh giá định kỳ (vd tuần), có thông báo và chờ phê duyệt tường minh.

### 3.3. Giáng cấp tự động & ngay lập tức

| Sự kiện | Hành động | Cooldown |
|---|---|---|
| Sự cố bảo mật nghiêm trọng do agent gây ra / bị khai thác | **Về L0** | 4 tuần |
| Cố truy cập ngoài phạm vi quyền | **Về L0** | 4 tuần |
| Rollback rate > 5% trong cửa sổ | Lùi 1 mức | 2 tuần |
| Chất lượng giảm liên tiếp 2 kỳ đánh giá | Lùi 1 mức | 2 tuần |

Khi cooldown: xét thăng cấp tạm dừng, bộ đếm task reset về 0, và **bắt buộc thông báo** (ai, từ mức nào xuống mức nào, vì sự kiện nào, bao lâu).

### 3.4. Ví dụ khai báo chính sách

Xem file sẵn dùng: [`templates/autonomy-policy.yml`](../../templates/autonomy-policy.yml).

---

## 4. Routing công việc theo độ phức tạp (1–10)

### 4.1. Chấm điểm

Mỗi task trong `plan.md` nhận một điểm nguyên 1–10. Nguồn chấm: ước lượng tĩnh (kích thước/số file/số hệ thống chạm tới), agent đánh giá, hoặc lịch sử task tương tự. Ai chấm? **Spec Reviewer chốt** (AI đề xuất).

Tiêu chí tăng điểm: chạm dữ liệu cá nhân/định danh, chạm luồng thanh toán/xác thực, thay đổi schema không backward-compatible, phụ thuộc hệ thống ngoài, yêu cầu quyết định kiến trúc, thiếu test hiện có.

### 4.2. Bảng routing

| Tier | Điểm | Chế độ | AI làm gì | Người làm gì |
|---|:-:|---|---|---|
| Low | 1–3 | **fully-autonomous** | Toàn bộ; chỉ cho agent L2+ | Audit sau (spot-check) |
| Medium | 4–6 | **ai-with-review** (mặc định) | Toàn bộ phần thực thi | Duyệt output trước khi merge |
| High | 7–8 | **ai-assisted** | Đề xuất, soạn nháp, tra cứu | Dẫn dắt, quyết định từng bước |
| Critical | 9–10 | **human-led** | Chỉ hỗ trợ thông tin | Sở hữu toàn bộ; agent KHÔNG tự thay đổi |

Quy tắc an toàn: routing do **con người chốt**, không do agent tự xếp mình vào tier thấp hơn; gate "routing compliance" kiểm tra lại việc này (xem `04-gates-policy.md`).

### 4.3. Ví dụ

| Task | Điểm | Chế độ | Lý do |
|---|:-:|---|---|
| Sửa typo trong UI + test | 2 | fully-autonomous | Rủi ro gần 0, dễ verify |
| Thêm endpoint CRUD có schema mới | 5 | ai-with-review | Chạm API + migration, có acceptance criteria rõ |
| Đổi cơ chế auth sang OIDC | 8 | ai-assisted | Bảo mật + phụ thuộc IdP ngoài |
| Thay DB engine của hệ thống thanh toán | 10 | human-led | Critical: dữ liệu tiền + không thể rollback dễ |

---

## 5. Human-in-the-loop: ba kiểu can thiệp

| Kiểu | Cơ chế | Dùng khi |
|---|---|---|
| **Human-approval gate** (trước) | Hook/gate giữ hành động chờ người duyệt | Merge, deploy, xóa dữ liệu, thay đổi policy — mọi thứ nhạy cảm |
| **Escalation** (giữa) | Agent gặp quyết định nó không đủ quyền/mức tin cậy → dừng và hỏi | Định nghĩa sẵn trong AgentRole: "khi không chắc → hỏi, đừng đoán" |
| **Override có kiểm soát** (sau) | Người có role phù hợp được vượt gate soft-mandatory, bắt buộc giải thích, ghi audit; **không tự gia hạn** | Gate chặn oan, cần đi nhanh — nhưng lần chạy sau gate vẫn chặn lại |

Nguyên tắc thiết kế escalation: *một câu hỏi từ agent phải kèm đủ ngữ cảnh để người trả lời trong < 2 phút* (diff liên quan, điều nó đã thử, các lựa chọn nó cân nhắc).

---

## 6. Team topology gợi ý

- **Bắt đầu (≤ 2 squad):** không cần team riêng — mỗi squad có 1–2 người kiêm vai Agentic Engineer; Platform & Security là vai trò chia sẻ toàn tổ chức.
- **Khi đã scale:** hình thành **platform team agentic** (giữ gates, adapters, dashboards, model routing cho cả org) theo mô hình team-as-platform của Team Topologies; squad tiêu thụ "AI-SDLC as a service".
- Tránh: mỗi squad tự chế policy riêng từ đầu → thiếu nhất quán, khó audit chéo; dùng repo policy trung tâm (xem `templates/quality-gates.yml`).

---

*Tiếp theo: gates & chính sách → [`04-gates-policy.md`](04-gates-policy.md) · Về [README](../../README.md)*
