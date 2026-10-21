# 10 · Vận hành Giao hàng: Ước lượng, Versioning, Môi trường & Tech Debt

> Lớp vận hành kỹ thuật giữ cho việc giao hàng dự đoán được ở tốc độ AI: ước lượng dựa hiệu chuẩn, chiến lược versioning & phát hành, quản lý môi trường/IaC, quản trị nợ kỹ thuật, migration dữ liệu có kỷ luật, và báo cáo stakeholder. *(English: [`../en/10-delivery-ops.md`](../en/10-delivery-ops.md))*

---

## 1. Ước lượng — hiệu chuẩn, đừng đoán mò

Chấm độ phức tạp (1–10, từ `03`) trở thành ước lượng bằng cách **hiệu chuẩn với lịch sử đo được**:

| Tier | Điểm | Chế độ làm việc | Hiệu chuẩn công sức (khởi đầu, tinh chỉnh hằng tháng) |
|---|:-:|---|---|
| Low | 1–3 | fully-autonomous | 0,5–2h giờ agent, ~0 giờ dev người |
| Medium | 4–6 | ai-with-review | 2–8h giờ agent, 0,5–2h người (review/sửa spec) |
| High | 7–8 | ai-assisted | 1–3 ngày người dẫn dắt, agent hỗ trợ |
| Critical | 9–10 | human-led | tính riêng theo từng case bởi Spec Reviewer |

- **Vòng hiệu chuẩn:** `task.completion_time` theo tier (từ `05`) thay thế phỏng đoán ban đầu; sau ~30 task mỗi tier, ước lượng của bạn trở thành kinh nghiệm.
- **Méo mó riêng của agent:** thời gian agent *sinh code* rẻ — chi phí thật nằm ở số vòng review và gate fail. Hãy ước **thời gian chu trình tổng** (dispatch → merged), không phải thời gian viết code.
- **Độ chính xác ước lượng là một metric:** `|ước − thực| / ước` bám theo từng tier; team xuyên suốt đánh giá thấp task medium thì sửa bảng hiệu chuẩn, không sửa con người.
- **Spike:** điều chưa biết thành spike task có time-box và output là tri thức (không bao giờ là code merge) — xem `09` §4.

## 2. Versioning & chiến lược phát hành

- **Semantic versioning** cho artifact: phá vỡ = major, tính năng = minor, sửa = patch. Agent đề xuất bump trong PR; gate lúc merge kiểm tra lại với loại diff.
- **Chính sách version API:** phiên bản tường minh (`/v1/`, `v2/`) kèm chính sách deprecation bằng văn bản: công bố → chạy song song (≥ 2 release hoặc 90 ngày) → ngày tắt được gate cưỡng chế (`documentation-based`: bắt buộc thông báo deprecation).
- **Chế độ phát hành — chọn theo sản phẩm, không theo tâm trạng:**

| Chế độ | Phù hợp | Ghi chú |
|---|---|---|
| Continuous (deploy khi xanh) | SaaS, gate mạnh, feature flag | Mục tiêu mặc định; chỉ khi đã có Deploy gates từ `04` |
| Release train (nhịp cố định) | Phụ thuộc đa team, hợp đồng enterprise | Việc chưa xong trượt sang chuyến sau — không ngoại lệ giữa chuyến |
| Batch định kỳ | Phát hành chịu quy định | Cửa sổ review thêm; gate + ký duyệt chồng lớp |

- **Tự động changelog:** release notes do agent soạn từ chuỗi PR (intent → tasks → thay đổi nhìn thấy); người biên tập giọng văn, không bao giờ tự tổng hợp danh sách tay.
- **Vòng đời feature-flag:** flag có chủ sở hữu + ngày hết hạn; "nghĩa địa flag" là một khoản nợ kỹ thuật (mục 4) — báo cáo gate hằng tháng liệt kê flag già hơn 90 ngày.

## 3. Môi trường & infrastructure-as-code

- **Ma trận môi trường:**

| Môi trường | Mục đích | Ai deploy | Dữ liệu |
|---|---|---|---|
| sandbox (mỗi task) | agent chạy, test | orchestrator, tạm thời | chỉ tổng hợp |
| preview tạm thời | môi trường review theo PR | CI, tự hủy | tổng hợp |
| staging | DAST, usability, kiểm chứng release | pipeline | ẩn danh hóa |
| production | người dùng | pipeline sau gate phê duyệt | thật |

- **IaC qua đúng vòng đời này:** manifest Terraform/K8s là code — agent viết được, nhưng phải qua **gate IaC scan** (`08` §4), review plan-preview (giống plan mode), và apply có bảo vệ với người duyệt cho trạng thái production.
- **Kỷ luật cấu hình:** config nằm trong kho có phiên bản (không phải click tay console); phát hiện drift báo động với mọi thay đổi tay; báo cáo đối chiếu hằng tháng chính là trace `reconciliation` từ `04` áp cho hạ tầng.
- **Chi phí môi trường:** preview-env tự hủy (TTL ≤ 48h) và hạn mức sandbox (budget mỗi task) giữ mô hình PR song song không làm cháy hóa đơn cloud — theo dõi bằng nhóm metric Economics (`05`).

## 4. Quản trị nợ kỹ thuật

Churn của AI (nghiên cứu: cao hơn người ~0,41) khiến nợ tích tụ *nhanh hơn* nếu không quản trị:

1. **Sổ nợ = intent:** mỗi khoản nợ được chấp nhận là một `intent.md` nhỏ gắn nhãn `debt`, kèm lập luận chi phí trì hoãn (không phải comment TODO).
2. **Ngân sách nợ:** mỗi sprint dành một phần năng lực (bắt đầu 20%) cho intent `debt` được chọn bằng scorecard; ngân sách không dùng hết không được chuyển sang làm tính năng.
3. **Dọn dọc theo churn:** gate chống-churn đánh dấu module có churn 14 ngày vượt ngưỡng → tự soạn intent `debt` ("module X bị viết lại 3 lần trong 2 tuần — cần hợp nhất").
4. **Refactor là loại task chính thống:** chấm điểm như mọi task; tỉ lệ refactor *giảm* khi áp dụng AI tăng (25%→10%, nghiên cứu `01`) — coi tỉ lệ refactor giảm là chỉ báo sớm của nợ chất đống, và lập lịch tương ứng.
5. **Nhịp làm mới dependency:** bump minor hằng tháng (agent chạy được, độ phức tạp thấp), bump major hằng quý kèm kế hoạch migration.

## 5. Migration dữ liệu (mẫu có kỷ luật)

Mọi PR migration theo **expand → migrate → contract**:

1. **Expand:** thay đổi schema cộng thêm, tương thích ngược, deploy độc lập được (online DDL / `CONCURRENTLY`).
2. **Migrate:** dual-write hoặc job backfill có metric tiến độ; số đếm xác minh (chênh lệch dòng) ghi trong PR; có throttle, resume được.
3. **Contract:** gỡ schema cũ chỉ sau N ngày sạch đã xác minh sau flag; đường `down` được test trong CI trước merge.

Gate sẵn có: `deploy-rollback-plan` (loại documentation-based, path `migrations/**`) + human review qua CODEOWNERS. **Không bao giờ** gộp bước contract với tính năng trong một PR.

## 6. Truyền thông & báo cáo stakeholder

- **Dashboard thay slide:** dashboard 4 panel (`05` §4.1) là bề mặt trạng thái duy nhất; lãnh đạo xem trực tiếp, mặc định bất đồng bộ.
- **Hồ sơ quyết định:** ADR từ discovery (`09` §3) nối thành chuỗi với intent — toàn bộ chữ "vì sao" của sản phẩm tra cứu được, và agent dùng nó làm context.
- **Vệ sinh cam kết:** roadmap tách cam kết (ngày hợp đồng, từ `11`) và dự báo (xác suất, từ hiệu chuẩn ước lượng); không bao giờ trình dự báo như cam kết.
- **Đường leo thang:** override gate, giáng mức tự chủ và sự cố bảo mật mỗi loại có chủ sở hữu và kênh riêng (`04`, `08`) — stakeholder nghe về rủi ro từ dashboard, không phải từ hành lang.

## 7. Anti-patterns

| Anti-pattern | Triệu chứng | Thuốc |
|---|---|---|
| Chiêm tinh story-point | Ước lượng không bao giờ chạm thực tế | Bảng tier hiệu chuẩn + metric độ chính xác |
| Version hỗn loạn | tag `v2-final-final`, phá vỡ nằm trong "patch" | Gate semver + chính sách deprecation |
| Hạ tầng click-ops | Môi trường chỉ một người tái tạo được | Chỉ đổi qua IaC + phát hiện drift |
| Quý dọn dẹp anh hùng | Nợ bỏ quên 3 quý rồi đóng băng để "dọn" | Ngân sách nợ 20% + intent theo churn |
| Migration một phát ăn ngay | Cutover cuối tuần, toàn quân túc trực | Expand/migrate/contract, luôn luôn |

---

*Liên quan: [`03-org-autonomy.md`](03-org-autonomy.md) (routing độ phức tạp) · [`05-metrics.md`](05-metrics.md) (dữ liệu hiệu chuẩn) · Về [README](../../README.md)*
