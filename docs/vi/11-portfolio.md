# 11 · Portfolio, Năng lực & Quản lý Nhà cung cấp

> Lớp phía trên vòng đời: quyết định intent nào xứng đáng tồn tại (ưu tiên hóa), tổ chức thực sự giao được bao nhiêu (năng lực), và cách quản trị công cụ, mô hình, nhà cung cấp bên ngoài mà không bị khóa chặt. *(English: [`../en/11-portfolio.md`](../en/11-portfolio.md))*

---

## 1. Vị trí — van thượng nguồn của vòng đời

```
 PORTFOLIO (tài liệu này)
   điều gì được cấp phát ──► DISCOVERY (09) ──► PLAN (intent) ──► vòng 6 giai đoạn (02)
        ▲                                                          │
        └───────── quyết định giết / mở rộng ◄── bằng chứng giao hàng ─┘
```

Mọi khung dưới đây lấy bằng chứng từ metric giao hàng (`05`) — quyết định portfolio trong AI-SDLC dựa dữ liệu ngang với chính pipeline.

## 2. Ưu tiên hóa — chấm điểm nhân

Tiếp biến từ PriorityPolicy của ai-sdlc.io: các chiều nhân nhau, nên **một số 0 phủ quyết toàn bộ**, điểm tầm thường kéo tụt mạnh. Template: [`templates/priority-scorecard.md`](../../templates/priority-scorecard.md).

| Chiều | Hỏi | Chấm 0–3 từ |
|---|---|---|
| Bám chiến lược | Có thúc đẩy mục tiêu công ty/team đã phát biểu không? | tài liệu chiến lược |
| Nhu cầu người dùng | Nhu cầu đã định lượng chưa? | ticket, usage, research (`09`) |
| Lực thị trường / pháp lý | Có deadline hay khoảng trống cạnh tranh? | lịch compliance, quét thị trường |
| Sẵn sàng thực thi | Spec hóa được ngay với kỹ năng/agent hiện tại? | sàng khả thi (`09` §4) |
| Chi phí chậm / entropy | Chờ đợi có khiến đau cộng dồn không? | sổ nợ, dữ liệu churn |
| Độ tin cậy | Bao nhiêu phần đo được so với đoán? | chất lượng bằng chứng |

- **Quy tắc quyết định:** một 0 → phủ quyết · tổng < ngưỡng (team tự đặt, vd 100/729) → cất · độ tin cậy ≤ 1 → bắt buộc người review trước khi cấp phát.
- **Nhịp:** chấm lại theo trigger (metric lệch band, đối thủ ra mắt, ngày compliance đổi) — không chỉ là nghi thức hằng quý.
- **Quyết định giệt là điều lành mạnh:** cất kèm điều kiện tái nhập bằng văn bản. Sáng kiến zombie đốt ngân sách tự chủ mà agent có thể dùng chỗ khác.

## 3. Hoạch định năng lực — đo được, không ước mong

- **Thông lượng là thực nghiệm:** task/tuần theo tier từ metric `05`, chiết khấu theo năng lực human-review của cơ cấu tự chủ hiện tại. Team 5 người với agent L1 và 2 reviewer rảnh có trần *băng thông review*, không phải trần code (Faros: thời gian review +91% — nút thắt là thật).
- **Giới hạn WIP:** số task chạy song song tối đa mỗi squad = năng lực review × ngân sách vòng; hàng đợi hiện trên panel Flow. Fan-out tự chủ (`06` Play 7) chỉ trong phạm vi WIP.
- **Hoạch định cơ cấu:** khi agent lên L2/L3, băng thông review tự do ra — hoạch định năng lực đổi theo quỹ đạo tự chủ mỗi quý (`05` nhóm 5).
- **Dự báo:** theo xác suất — "80% task medium xong trong 3 ngày" (từ hiệu chuẩn, `10` §1) thay cho ngày tháng tất định; cam kết chỉ dành cho trường hợp có hợp đồng.

## 4. Vệ sinh roadmap

- **Chủ đề thay ngày-tính-năng:** chủ đề theo quý, dưới đó là dự báo từng sáng kiến; ngày chỉ gắn với deadline compliance và lời hứa bên ngoài.
- **Quy tắc dự phòng:** giành 15–20% cho intent sinh ra từ Maintain (sự cố, bảo mật, nợ) — chúng *sẽ* đến; roadmap không dự phòng là coi vòng phản hồi của chính mình là bất ngờ.
- **Nhịp rà portfolio:** hằng tháng (60 phút): chấm lại scorecard, năng lực vs WIP, các quyết giệt/cất/mở rộng, chỉ tiêu chi nhà cung cấp.

## 5. Quản trị nhà cung cấp, mô hình & công cụ

| Mối quan tâm | Chính sách |
|---|---|
| **Chọn mô hình** | Routing theo pha (`06` §3) chọn bằng bằng chứng: năng lực trên **bộ eval của bạn** (chạy suite eval cho từng ứng viên), chi phí/task, độ trễ, điều khoản dữ liệu. Đánh giá lại hằng quý — chất lượng mô hình đổi nhanh |
| **Không khóa một nhà cung cấp** | Nguyên tắc cross-harness kiêm luôn bảo hiểm: builder + reviewer khác họ nghĩa là một nhà cung cấp sự cố chỉ làm bạn suy yếu, không ngừng hẳn. Trừu tượng model gateway (`06` §2) khiến việc đổi chỉ là đổi cấu hình |
| **Quản trị dữ liệu** | Rà DPA trước khi provider nào thấy dữ liệu repo/PII; quy tắc egress sandbox (`08` §5) áp cho cả lượt gọi mô hình; lựa chọn opt-out huấn luyện ghi lại theo từng nhà cung cấp |
| **Tuân thủ license** | Gate quét license cho dependency; license công cụ được rà (điều khoản agent CLI nào cho dùng repo thương mại) |
| **Quản trị chi tiêu** | Usage ledger (`05` nhóm 4) là nguồn chân lý: ngân sách từng squad, cảnh báo ở 90%, tối ưu model-mix là mục thường trực |
| **Phòng thí nghiệm đánh giá** | Công cụ/mô hình mới chạy thử 2 tuần cố định trên bản fork bộ eval của bạn kèm kết luận bằng văn bản — áp dụng là một quyết định, không phải phản ứng hype |
| **Lối thoát** | Mọi công cụ then chốt có đường thay thế ghi sẵn (mẫu adapter, `06` §2, sinh ra đúng cho việc này); khóa nhà cung cấp là rủi ro portfolio, rà hằng năm |

## 6. Anti-patterns

| Anti-pattern | Triệu chứng | Thuốc |
|---|---|---|
| Ai to tiếng người đó trước | roadmap = người thắng buổi họp gần nhất | Scorecard nhân, gắn bằng chứng |
| Năng lực theo lạc quan | Kế hoạch "AI sẽ nhân 10 chúng ta" | Thông lượng đo được × băng thông review |
| Sáng kiến zombie | 40% "gần xong" mãi mãi | Quyết định giệt kèm điều kiện tái nhập |
| Tôn giáo mô hình | Chọn công cụ theo nhà truyền bá | Kết luận eval-lab trên chính suite của bạn |
| Chi AI chui | Hóa đơn provider làm tài chính sốc | Usage ledger + ngân sách squad |

---

*Liên quan: [`09-discovery-ux.md`](09-discovery-ux.md) (điều gì được discovery) · [`05-metrics.md`](05-metrics.md) (bằng chứng) · [`06-toolchain.md`](06-toolchain.md) (gateway & adapter) · Về [README](../../README.md)*
