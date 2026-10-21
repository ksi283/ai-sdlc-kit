# 07 · Lộ trình Triển khai (Adoption Roadmap)

> Từ "đọc xong tài liệu" đến "một team thực sự chạy AI-SDLC": đánh giá sẵn sàng, lộ trình 4 chặng Crawl → Walk → Run → Scale, cách chọn play đầu tiên, chính sách khởi động an toàn, kỹ năng cần đào tạo, và các anti-pattern phải tránh.
> *(English: [`../en/07-adoption.md`](../en/07-adoption.md))*

---

## 1. Đánh giá sẵn sàng (làm trong 1 buổi)

Trả lời thẳng từng dòng — càng nhiều mục "Chưa", càng nên đi chậm ở chặng Crawl:

| # | Câu hỏi | Sẵn sàng khi…
|---|---|---|
| 1 | Repo có CI tự động (build+test) trên PR? | Mọi PR tự chạy CI, branch chính được bảo vệ |
| 2 | Có quy ước branch/PR rõ ràng? | 1 việc = 1 PR là thói quen |
| 3 | Ai đó dùng agent CLI hằng ngày? | ≥ 2 người thành thạo (Claude Code/Codex…) |
| 4 | Có đo lead time / review time? | Có số liệu (dù bằng tay) |
| 5 | Có người chịu trách nhiệm "AI platform"? | Có tên cụ thể (dù kiêm nhiệm) |
| 6 | Lãnh đạo chấp nhận "tốc độ đổi lấy kiểm soát có thể đo"? | Không chỉ KPI "bao nhiêu % code do AI viết" |

Rào cản thường gặp nhất theo dữ liệu (`01`): chỉ 1/5 tổ chức có governance trưởng thành — nghĩa là phần lớn sẽ bắt đầu ở dưới mức chuẩn, và **đó là bình thường**.

---

## 2. Bốn chặng triển khai

```
 CRAWL (tuần 1–4)      WALK (tháng 2–3)       RUN (tháng 4–6)         SCALE (tháng 7+)
 nhân quen tay lái     spec-driven + gates    agent điều phối        tổ chức toàn diện
 ─────────────────►    ─────────────────►     ─────────────────►     ─────────────────►
 6 play không ĐK       + DoR/quality gates    + autonomy L1→L2       + platform team
 1 squad pilot         2–3 squad              + SRE agent            + policy trung tâm
 agent = trợ lý        agent = người làm      + model routing        + TCO dashboard
```

### Chặng 1 · CRAWL — "Thói quen mới, công cụ cũ" (tuần 1–4)

**Mục tiêu:** thay đổi thói quen làm việc, chưa cần hạ tầng mới.

| Việc | Play | Bằng chứng xong |
|---|---|---|
| Mọi thay đổi khởi đầu bằng `intent.md` (dù ngắn 5 dòng) | Play 1 | 100% PR sprint gần nhất truy được về intent |
| Viết `AGENTS.md` cho repo pilot | Play 4 | Agent trả lời đúng lệnh build/quy ước mà không cần giải thích |
| Agent trình plan trước khi sửa (plan mode) | Play 5 | Không còn PR " agent tự quay hướng" |
| Cho agent vòng phản hồi (chạy test tự sửa trong container) | Play 8 | Số lần "agent giao code không chạy được" giảm rõ |
| Cài hook giữ hành động nhạy cảm (nếu dụng cụ hỗ trợ) | Play 11 | Không ai merge production mà không qua người |

**Chấm điểm chặng:** pilot 1 squad, 2–4 tuần, đo 5 metric khởi động ở `05-metrics.md` mục 5.

### Chặng 2 · WALK — "Chuẩn hóa spec + gates" (tháng 2–3)

**Mục tiêu:** chất lượng đi trước tốc độ — xây lớp 3 (nền tảng tin cậy).

- Triển khai **DoR gate** (Play 3): issue không sẵn sàng không được code.
- **Spec-in-one-session** (Play 2) + phân rã task chấm phức tạp 1–10 (mục `03` mục 4).
- Bộ **quality gates khởi động** (`04` mục 5, `templates/quality-gates.yml`): mở ở advisory → nâng dần.
- **Evals trong CI** (Play 9) cho phần agent phụ trách nhiều.
- **Skills** đóng gói chuẩn review/quy ước domain (Play 6).
- Bắt đầu attribution: nhãn PR AI/human bắt buộc.

**Bằng chứng xong:** override rate < 10%; mọi PR có attribution; coverage diff ≥ 80% (advisory đang đúng hướng).

### Chặng 3 · RUN — "Agent điều phối, người giám sát" (tháng 4–6)

**Mục tiêu:** xây lớp 2 (điều phối).

- **Review phân tầng đa mô hình** (Play 10): ≥ 2 reviewer AI độc lập; người chỉ review critical.
- **AutonomyPolicy chính thức** (`templates/autonomy-policy.yml`): thăng agent pilot từ L1 lên L2 theo bằng chứng metrics (`03` mục 3.2).
- **Model routing** theo pha (`06` mục 3) + budget trần per-task.
- **Subagents/phiên song song** cho task độc lập (Play 7).
- **SRE agent + vòng Maintain** (Play 12): cảnh báo → phân loại → issue/PR → intent mới.
- **Đóng vòng metrics** (Play 12): control band định nghĩa trong intent; 1 intent mới thật sự sinh ra từ metric production.

**Bằng chứng xong:** ≥ 1 chuỗi hoàn chỉnh "sự cố production → SRE agent → PR sửa → intent mới"; agent đầu tiên đạt L2 bằng bằng chứng.

### Chặng 4 · SCALE — "Tổ chức toàn diện" (tháng 7+)

- Platform team agentic phục vụ nhiều squad (`03` mục 6): policy trung tâm, adapter, dashboard chung.
- Nhiều agent ở nhiều mức tự chủ; xét thăng/giáng định kỳ bằng số.
- TCO dashboard cho lãnh đạo; tối ưu model mix.
- Ánh xạ tuân thủ chính thức nếu thuộc phạm vi quy định (`04` mục 6).
- Drill sự kiện demotion/thiếu hụt hạ tầng (chaos-style) mỗi quý.

---

## 3. Chọn play đầu tiên (nếu chưa đọc gì khác)

Sáu play không điều kiện tiên quyết: **1 · intent.md**, **4 · AGENTS.md**, **5 · plan-mode-first**, **8 · feedback loop**, **11 · hooks phê duyệt** (+ skills nếu đã có AGENTS.md).

Chọn theo triệu chứng của team:

| Triệu chứng | Play đầu tiên |
|---|---|
| Làm nhiều nhưng không biết vì sao / scope tràn | **1 · intent.md** |
| Agent code sai quy ước, hỏi lại mấy lần | **4 · AGENTS.md** |
| Agent sửa bừa, PR khó review | **5 · plan-mode-first** |
| Code giao ra không chạy được | **8 · feedback loop** |
| Lo ngại mất kiểm soát merge/deploy | **11 · hooks** |
| Review tồn đọng là nút thắt | **10 · review phân tầng** (cần 4 trước) |

---

## 4. Chính sách khởi động an toàn (mặc định ngày 1)

Đặt mặc định **rộng rãi với con người, chặt với agent** — nới dần theo bằng chứng:

1. Mọi agent bắt đầu **L1** (draft PR + mọi merge qua người).
2. Task chấm phức tạp: medium trở lên luôn có human review; critical không cho agent tự làm.
3. Gate hard duy nhất ngày đầu: **CI pass + secret-scan + human approval trước deploy**.
4. Budget token/chi phí per-task có trần (vd $50) — vượt là abort.
5. Không credential dài hạn trong môi trường agent.
6. Metric 5 số khởi động (`05` mục 5) thu từ tuần đầu — không quyết định mở rộng nào mà không có số.

---

## 5. Con người: kỹ năng & quản trị thay đổi

| Nhóm | Kỹ năng cần xây | Cách đào tạo nhanh |
|---|---|---|
| Dev | Đọc spec tốt hơn đọc code; viết intent/acceptance criteria; điều khiển agent (prompt, plan mode, escalation) | Cặp đôi 2 tuần: 1 người giỏi agent + 1 người mới; nội bộ "play of the week" |
| Tech lead | Chấm phức tạp task; review kiến trúc thay vì từng dòng; thiết kế gates | Workshop 1 buổi dùng `03` + `04` trên PR thật của team mình |
| EM / PM | Đọc dashboard; hiểu earned autonomy; đặt control band | 30 phút review dashboard hằng tuần cùng Agentic Engineer |
| AppSec | Threat model cho agent (injection, exfil, supply-chain); provenance | Duyệt checklist `04` mục 4 trên repo pilot |

Thông điệp quản trị thay đổi quan trọng nhất: **AI không thay trách nhiệm của người — nó thay công việc cơ khí của người.** Vai "gõ code thuần" thu hẹp, vai "định nghĩa đúng vấn đề + xác minh đúng kết quả" mở rộng.

---

## 6. Anti-patterns & cách tránh

| # | Anti-pattern | Triệu chứng | Thuốc |
|---|---|---|---|
| 1 | **Autonomy-by-decree** — cấp agent quyền cao vì "tin công nghệ" | Sự cố lặp lại, không ai giải thích được vì sao agent được làm vậy | Earned autonomy L0–L3 + demotion tự động (`03`) |
| 2 | **Speed-washing** — KPI chỉ là "% code AI viết" | Tốc độ tăng, stability rơi (DORA −7.2%) | KPI bộ 3: hiệu quả × chất lượng × chi phí (`05`) |
| 3 | **Vibe-coding vào main** — không gate, agent commit thẳng | Churn cao, hotfix nối hotfix | 1 task = 1 PR + CI bắt buộc + review phân tầng |
| 4 | **Spec theater** — viết spec cho có, agent không theo | Rework rate > 2 vòng/PR | DoR thật (chặn dispatch) + agent đọc spec làm nguồn sự thật |
| 5 | **Một mô hình tự review** | Lỗi systemic mô hình đó không bao giờ bị bắt | Cross-harness review bắt buộc (`06`) |
| 6 | **AGENTS.md chết** — viết 1 lần, mục sai lệch không cập nhật | Agent luôn "nhớ nhầm" quy ước | Coi AGENTS.md là code: PR đổi quy ước phải đổi file |
| 7 | **Gate chồng gate** | Override rate > 10%, team oán gate | Rà soát tháng: gate 0%/100% fail → xóa hoặc viết lại |
| 8 | **Vòng lặp đứt** — cảnh báo production tồn đọng, không sinh intent | Câu hỏi ở `02` mục 6 không trả lời được | Postmortem template → intent bắt buộc sau sự cố severity cao |
| 9 | **Bỏ qua con người** — cắt review người để "tự động hết" | Lỗi nghiệp vụ/đạo đức không máy bắt được | Phân tầng giữ người ở critical; escalation 2 phút |

---

## 7. FAQ ngắn

**— Phải làm đủ 6 giai đoạn mới gọi là AI-SDLC?**
Không. Bộ này mô-đun: bắt đầu từ 1 play. Nhưng chú ý: chỉ Build-tự-động mà không có Test/Deploy tương ứng là anti-pattern số 3.

**— Team nhỏ (3–5 người) có cần autonomy levels?**
Dùng bản nhẹ: một dòng trong CONTRIBUTING — "agent chỉ được draft PR; merge do người" — chính là L1. Quan trọng là nguyên tắc earn-by-evidence, không phải biểu mẫu.

**— Sau bao lâu thì thấy hiệu quả?**
Thói quen (Crawl): 2–4 tuần. Chất lượng đo được (Walk): 1 quý. Tự chủ có bằng chứng (Run): 2 quý+. Nhanh hơn thường đồng nghĩa bỏ bước — và số liệu DORA/METR cho biết kết cục.

**— Dùng repo này cho dự án mới hay hệ thống cũ?**
Cả hai, nhưng hệ thống cũ nên bắt đầu bằng AGENTS.md + feedback loop (giúp agent hiểu legacy), còn dự án mới nên bắt đầu bằng intent.md + spec-driven từ commit đầu.

---

## 8. Checklist "tổ chức đã trưởng thành AI-SDLC"

- [ ] Mọi thay đổi truy được về intent có phiên bản
- [ ] DoR chặn được issue rác trước khi agent đụng vào
- [ ] Mọi PR qua review phân tầng, reviewer AI độc lập với builder
- [ ] Attribution AI/human trên mọi PR; secret-scan là gate hard
- [ ] Deploy production luôn sau human approval (hook)
- [ ] Dashboard 5 nhóm metric có người xem hằng tuần
- [ ] Ít nhất 1 agent đạt mức tự chủ cao hơn **bằng bằng chứng**, có demotion đã diễn ra (hoặc drill)
- [ ] ≥ 1 chuỗi "metric lệch band → intent mới" đã xảy ra trong 3 tháng gần nhất

*Tất cả tick được → bạn đang chạy đúng tinh thần cả 3 nguồn tham khảo.*

---

*Kết thúc tài liệu khung. Xem thêm: [templates](../../templates/) · [ví dụ end-to-end](../../examples/mini-todo-api/) · [README](../../README.md)*
