# 09 · Discovery Sản phẩm, UX & Tài liệu Người dùng cuối

> "Giai đoạn 0" của vòng đời — mọi việc nên diễn ra **trước khi** intent.md ra đời: khám phá vấn đề, phỏng vấn stakeholder, phân tích khả thi, thiết kế UX/UI, prototyping, kiểm chứng khả năng dùng, và mạch tài liệu người dùng cuối phát hành cùng sản phẩm. Thiếu tài liệu này, AI-SDLC sẽ tối ưu việc xây **sai thứ** nhanh hơn bao nhiêu. *(English: [`../en/09-discovery-ux.md`](../en/09-discovery-ux.md))*

---

## 1. Vị trí trong khung

```
 DISCOVERY (tài liệu này)      PLAN            DESIGN ...
 research · UX · khả thi ────► intent.md ───► spec.md ───► ...
        ▲                                          │
        └───────── phản hồi usability ◄────────────┘      (UX chạy xuyên suốt Build/Test)
```

Discovery không phải bộ thủ tục phê duyệt — nó là **xưởng sản xuất bằng chứng cho intent**. Discovery tốt khiến `intent.md` thành thao tác 10 phút thay vì buổi tự đoán mò.

---

## 2. Khám phá vấn đề

| Hoạt động | AI làm | Con người làm |
|---|---|---|
| Phỏng vấn người dùng & khai thác hỗ trợ | Ghi chép + gom cụm hàng nghìn ticket/bình luận CSAT thành chủ đề; soạn hướng dẫn phỏng vấn; tóm tắt cuộc gọi | Chọn ai để phỏng vấn; xác nhận chủ đề với thực tế; giết các "lý thuyết cưng" |
| Rà soát analytics | Đối chiếu funnel sử dụng, phát hiện điểm rớt, định lượng tần suất | Diễn giải *vì sao* đằng sau con số |
| Quét cạnh tranh / lĩnh vực | Tóm tắt các giải pháp thay thế, trích xuất pattern library, tóm tắt quy định | Phán đoán mức hợp với người dùng & chiến lược |
| Đo quy mô cơ hội | Ước nháp TAM/công sức từ dữ liệu task lịch sử (`05`) | Kiểm tra lại bằng scorecard portfolio (`11`) |

**Output:** phát biểu vấn đề đã xác thực + bằng chứng định lượng — đúng hai mục "Problem / Evidence" mà `intent.md` đòi hỏi. Anti-pattern: *persona do AI bịa* — người dùng tổng hợp chỉ là giả thuyết cần kiểm chứng, không bao giờ là bằng chứng.

## 3. Phỏng vấn stakeholder & thống nhất

- **Bản đồ stakeholder** cho từng sáng kiến: ai quyết định, ai trả tiền, ai dùng, ai chặn (compliance/pháp lý/vận hành).
- **Bộ công cụ elicitation** (AI soạn nháp, người điều hành): phỏng vấn 5 câu hỏi, sổ giả thuyết, checklist yếu tố quyết định.
- **Sổ quyết định (ADR-lite):** mỗi quyết định discovery trên ngưỡng đáng ghi là một đoạn — bối cảnh, các lựa chọn, lựa chọn, hậu quả — có phiên bản nằm cạnh intent. Đây chính là context agent sẽ đọc sau này; quyết định miệng không ghi chép là vô hình với chúng.
- **Nhịp:** mặc định bất đồng bộ; một buổi thống nhất khi kết thúc discovery (xem gate dưới), không phải họp báo cáo hằng tuần.

## 4. Sàng lọc khả thi (ba lăng kính)

| Lăng kính | Câu hỏi | Thử nhanh |
|---|---|---|
| **Kỹ thuật** | Có xây được với stack/agent hiện tại không? | 1–3 spike task (độ phức tạp ≤ 3, dispatch như task thật — output là tri thức, không phải code) |
| **Kinh tế** | Có đáng không? | Ước chi phí/tính năng từ metric `05` × scorecard ưu tiên ([`templates/priority-scorecard.md`](../../templates/priority-scorecard.md)) |
| **Pháp lý** | Có được phép không? | Sàng compliance: phân loại dữ liệu, phạm vi pháp lý, hệ quả AI Act → chuyển `08` §6 nếu dính PII |

Losing một lăng kính → sáng kiến chết rẻ ở đây, thay vì chết đắt ở Build.

## 5. Thiết kế UX/UI & prototyping

Vòng lặp: **wireframe → prototype → test usability → lặp** — giờ được tăng tốc bởi agent:

1. **Wireframe:** agent sinh các biến thể bố cục từ user story của spec trong vài phút; designer tuyển chọn. Mặc định đa biến thể (3 hướng, không phải 1 mockup thiêng liêng).
2. **Prototyping:** prototype bấm được (HTML/Figma qua MCP/agent) nối dữ liệu giả — đủ tốt để test usability trước khi backend tồn tại.
3. **Design system là knowledge-as-code:** token, component, nên/không nên nằm trong repo (`.agent/skills/design-system` + mục trong AGENTS.md). Đây là cách agent ở Build tạo UI không "lạ chủ"; lệch hệ thống là mục checklist review, không phải tranh chấp gu.
4. **Khả năng tiếp cận:** WCAG 2.2 AA là yêu cầu SR-x tường minh trong spec (tương phản, thao tác bàn phím, nhãn screen-reader) — kiểm chứng bằng công cụ tự động + audit tay; agent soạn bản sửa, người audit.
5. **Usability testing:** 5 người dùng mỗi vòng trên prototype hoặc tính năng flag ở staging; đo tỉ lệ hoàn thành tác vụ + điểm SUS. Người dùng mô phỏng bằng AI có thể sàng lọc trước luồng, nhưng **người dùng giả không bao giờ thay người dùng thật** cho bất cứ gì hướng đến người dùng hoặc chịu quy định.

**Gate UX vào Build:** "Usability-Ready" — các FR hướng người dùng trong spec có prototype đã test hoặc kế hoạch thử nghiệm tường minh (rollout có flag, đo tỉ lệ hoàn thành ở Deploy).

## 6. Mạch tài liệu người dùng cuối

Tài liệu là một bề mặt sản phẩm, không phải việc gác lại — và agent khiến việc bảo trì gần như miễn phí *nếu* nối vào vòng đời:

| Giai đoạn | Hoạt động tài liệu |
|---|---|
| Design | Kế hoạch docs trong spec: tài liệu hướng người dùng nào thay đổi (guide, API ref, trợ giúp in-app) — gate loại `documentation-based` cưỡng chế |
| Build | Agent soạn nháp cập nhật docs **trong cùng PR** với thay đổi tính năng (docs nằm `/docs`, có phiên bản theo code nó mô tả) |
| Test | Review docs: eval độ chính xác — docs còn khớp hành vi không? (AI đối chiếu docs với test) |
| Deploy | Release notes soạn tự động từ chuỗi PR (intent → tasks → thay đổi nhìn thấy), người biên tập giọng văn |
| Maintain | Vòng phản hồi docs: chủ đề ticket hỗ trợ + tín hiệu "trang này không giúp được" → intent mới (mẫu `postmortem-to-intent` áp dụng được) |

**Quy tắc:** tính năng chỉ Done khi docs của nó phát hành. Gate `documentation-required` (đã có trong `quality-gates.yml`) là điểm cưỡng chế.

## 7. Tổng kết gates

| Gate | Vị trí | Chặn |
|---|---|---|
| **Discovery-Ready** (thoát discovery) | → Plan | Intent thiếu: vấn đề xác thực, bản đồ stakeholder, sàng khả thi đạt |
| **Usability-Ready** | Design → Build (việc hướng người dùng) | Tính năng UI thiếu prototype đã test hoặc kế hoạch đo lường |
| **Docs-ship-with-feature** | Test → Deploy | Merge thay đổi hành vi hướng người dùng mà không cập nhật docs |

## 8. Anti-patterns

| Anti-pattern | Triệu chứng | Thuốc |
|---|---|---|
| Sân khấu persona AI | Persona tên đẹp, bằng chứng bằng không | Persona phải trích nguồn phỏng vấn/ticket; tổng hợp = giả thuyết có nhãn |
| Nhảy prototype-to-prod | "Demo chạy được rồi, ship thôi" | Gate usability + kế hoạch đo ở Deploy |
| Quên design system | Màn hình agent sinh ra mỗi cái một kiểu | Token trong repo + skill + checklist review |
| Nợ docs | Docs mô tả sản phẩm của 2 quý trước | Gate docs + intent phản hồi docs ở Maintain |

---

*Liên quan: [`02-framework.md`](02-framework.md) (giai đoạn Plan) · [`11-portfolio.md`](11-portfolio.md) (điều gì xứng đáng được discovery) · Về [README](../../README.md)*
