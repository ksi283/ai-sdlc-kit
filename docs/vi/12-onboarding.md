# 12 · Cài đặt & Onboarding — Bàn giao Kit cho Người khác

> Trả lời câu hỏi: *"Nếu đưa bộ kit này cho một developer hay thành viên nhóm khác, họ đã biết cách dùng chưa? Họ có thể tự triển khai và phát triển một ứng dụng theo ý muốn của mình không?"* — tài liệu này là hợp đồng bàn giao. Thành viên mới cần đạt "app chạy được với gates xanh" trong dưới 1 giờ, không phải hỏi ai điều gì. *(English: [`../en/12-onboarding.md`](../en/12-onboarding.md))*

---

## 1. Ai nhận gì (ba mức bàn giao)

| Mức | Nhận được | Làm được |
|---|---|---|
| **L-Read** | Quyền đọc kit repo | Hiểu khung; review intent/PR |
| **L-Build** ⭐ | Kit repo + project repo mới tạo từ nó | Chạy toàn bộ vòng đời trên **app của chính họ**; cài skill packs; dùng templates |
| **L-Maintain** | Mọi thứ + quyền ghi kit repo | Đổi templates/policy/docs; review việc của người khác |

Phần lớn bàn giao là L-Build; phần còn lại của tài liệu đi theo lộ trình L-Build.

## 2. Điều kiện cần (5 phút)

- [ ] Git + tài khoản GitHub
- [ ] **Node ≥ 22.13** (`node --version`) — chạy app mẫu và bộ 22 test
- [ ] **Python ≥ 3.9** — chỉ khi cài skill packs (search engine của `ui-ux-pro-max`)
- [ ] Bất kỳ agent CLI nào bạn đang dùng (Claude Code, Codex, …) — kit trung lập agent

## 3. 30 phút đầu — "hello, gates"

```bash
# 1. Lấy kit (clone, hoặc "Use this template" nếu tổ chức đã publish)
git clone https://github.com/ksi283/ai-sdlc-kit.git && cd ai-sdlc-kit

# 2. Đọc đúng 2 tài liệu (≤ 40 phút):
#    docs/vi/02-framework.md   — toàn bộ quy trình (nguyên tắc, 6 giai đoạn, gates)
#    docs/vi/07-adoption.md    — cách bắt đầu không "nấu cả đại dương"

# 3. Chạy app mẫu và bộ test — chứng minh môi trường ổn:
cd examples/money-web-app/app
npm install && npm test        # kỳ vọng: 22/22 pass
npm start                      # → http://localhost:3000 — đăng ký, thêm giao dịch
```

`npm test` xanh = máy bạn sẵn sàng. Không cần cài thêm gì.

> **Log xác minh.** Đường cơ học ở trên (init → check 10/10 → intent đầu tiên từ template
> được scaffold) đã được thực thi như một mô phỏng thành viên-chưa-được-huấn-luyện ngày
> 2026-10-22: scaffold + kiểm tra wiring xong trong dưới 5 giây, intent điền từ
> `docs/templates/intent.md` mà không rời khỏi cây vừa scaffold. Một bẫy ngày-0 bị phát
> hiện và đã sửa: workflow CI được sinh ra giờ bỏ qua bước test tới khi `package.json`
> tồn tại — nên push đầu tiên của project mới luôn xanh; đỏ luôn nghĩa là *test của bạn* fail.

## 4. 60 phút đầu — bắt đầu app CỦA BẠN

1. Dựng project bằng CLI của kit (zero dependency; cũng chạy được qua
   `npx github:ksi283/ai-sdlc-kit …` cho thành viên có quyền repo):

   ```bash
   # từ bản clone của kit:
   node <kit>/cli/ai-sdlc-kit.mjs init my-app --skills intent-review --ai claude
   # hoặc thẳng từ GitHub:
   npx github:ksi283/ai-sdlc-kit init my-app --skills intent-review --ai claude
   ```

   Lệnh này tạo `AGENTS.md`, `docs/templates/` (intent, spec, plan, evals, threat-model),
   `docs/intents/`, `specs/`, `evals/`, `policy/` (gates + autonomy), `.github/`
   (PR template + CODEOWNERS + CI) và tự dây auto-activation skill vào `AGENTS.md`.
   Kiểm tra wiring: `ai-sdlc-kit check my-app` (exit 1 = còn thiếu).
2. Cách thủ công (những gì CLI tự động hóa): `git init` + tự copy bộ khởi động —
   [`templates/intent.md`](../../templates/intent.md), [`templates/spec.md`](../../templates/spec.md),
   [`templates/AGENTS.md`](../../templates/AGENTS.md), [`templates/plan.md`](../../templates/plan.md).
3. Viết `intent.md` đầu tiên (≤ 1 trang, điền security screen).
4. Đi Design → Build với agent: spec trong 1 phiên, checklist DoR, rồi 1 task.
5. Cài skill pack khi cần (không cài trước) — xem [`skills/README.md`](../../skills/README.md):
   pack ngoài cài qua installer riêng có pin version (`npx ui-ux-pro-max-cli@2.15.0 init --ai claude`),
   skill do kit/người dùng viết qua `skills/install.sh intent-review <project-dir> --ai claude`;
   cả hai đường đều tự sinh **auto-activation** vào `AGENTS.md` của project — agent sẽ
   chủ động dùng đúng pack cho đúng việc.
6. Trước merge đầu tiên, port gate battery: copy pattern từ `examples/money-web-app/app/tests/`,
   nối CI (xem `.github/workflows/tests.yml` trong kit).

### Sau đó: tính năng đầu tiên, giai đoạn từng bước (bằng chứng tự phục vụ)

60 phút ở trên dựng repo; runbook này xây **tính năng thật đầu tiên trong app của bạn** —
mỗi giai đoạn một lượt đi, kèm điều kiện "xong" cụ thể. Đây chính là bài kiểm tra cho câu
hỏi "tôi có thể xây app theo ý mình bằng bộ kit này không?":

| Giai đoạn | Làm (trong app của bạn) | Xong khi |
|---|---|---|
| Plan | viết `intent.md` cho tính năng — điền security screen | checklist Intent-Ready tick đủ |
| Design | 1 phiên với agent → `spec.md` + `plan.md`; task chấm 1–10 | checklist DoR tick đủ — chưa qua gate thì không dispatch |
| Build | `AGENTS.md` đã có; agent trình kế hoạch trước rồi code trên branch; 1 task = 1 branch = 1 PR | build + lint pass trong CI của bạn |
| Test | chạy gate battery; ≥ 1 AI reviewer **độc lập với builder**; human review theo routing | test map được về acceptance criteria; review được ghi |
| Deploy | CI xanh + người duyệt trước mọi thứ production-ish | audit trail ghi rõ ai duyệt cái gì |
| Maintain | định nghĩa control band cho metric thành công; soát hằng tuần | chuỗi "metric → intent" đầu tiên tồn tại |

**Port gates một cách cụ thể** — copy những thứ này từ kit vào repo của bạn:

- `.github/workflows/tests.yml` → CI chạy test của bạn trên mọi push/PR
- [`templates/quality-gates.yml`](../../templates/quality-gates.yml) → mở ở advisory, nâng dần theo docs/vi/04 §5
- [`templates/pr-template.md`](../../templates/pr-template.md) → provenance + checklist bảo mật từ PR #1
- `CODEOWNERS` → path nhạy cảm (auth/payment/migrations) có chủ từ ngày đầu
- cấu trúc `tests/` từ [`examples/money-web-app/app/tests/`](../../examples/money-web-app/app/tests/) → pattern helper + tên test map theo yêu cầu (FR/SR/EV ID)

## 5. Tự đánh giá — "tôi đã thực sự tự phục vụ được chưa?"

Tick trung thực; 3 câu "chưa" trở lên → đọc lại tài liệu được link:

- [ ] Viết được intent qua gate Intent-Ready (vấn đề, bằng chứng, metric, owner) — *docs/vi/02 §3 GĐ 1*
- [ ] Chạy được phiên Design cho ra spec đạt DoR — *docs/vi/02 §3 GĐ 2*
- [ ] Giải thích được vì sao issue trượt DoR KHÔNG được dispatch — *docs/vi/04 §1*
- [ ] Route được task theo độ phức tạp (1–10 → chế độ làm việc) — *docs/vi/03 §4*
- [ ] Giải thích được review phân tầng và vì sao builder không tự review — *docs/vi/02 §3 GĐ 4*
- [ ] Nêu được gate nào hard-mandatory và vì sao — *docs/vi/04 §5*
- [ ] Cài được skill pack từ registry và ghi lại các quyết định nó sinh ra — *skills/README.md*
- [ ] Khép được vòng lặp: chỉ tên được chuỗi metric → intent trong project của mình — *docs/vi/02 §6*

Bài kiểm tra sâu nhất: **làm trọn vẹn 1 tính năng nhỏ thật** theo
[`examples/money-web-app/`](../../examples/money-web-app/) — chuỗi artifact, gate run,
và bản đánh giá UI/UX là mẫu để bắt chước.

## 6. Examples là gì (và không là gì)

Cả hai project trong `examples/` là **walkthrough cho quy trình, không phải app để deploy**
(đã ghi nhãn trong README của chúng). Copy *pattern* — chuỗi artifact, map test→yêu cầu,
cách nối gate — không bao giờ copy cách deploy.

## 7. Chỗ thành viên mới hay kẹt (và cách gỡ)

| Triệu chứng | Kiến thức thiếu | Thuốc |
|---|---|---|
| "Bắt đầu đọc từ đâu?" | thứ tự đọc | §3 ở trên: chỉ 02 + 07 trước |
| Agent phá quy ước | thiếu bộ nhớ project | viết `AGENTS.md` trước khi Build (Play 4) |
| Agent sửa bừa | chưa có thói quen plan mode | Play 5; duyệt kế hoạch trước khi code |
| "Skill pack này an toàn không?" | quy tắc registry | chỉ cài version có trong registry |
| PR to quá review không kịp | gộp task | 1 task = 1 branch = 1 PR (quy tắc cứng) |
| "Ngày 1 có cần đủ 6 giai đoạn?" | áp dụng mô-đun | bắt đầu plays 1 → 4 → 5 → 8 → 11 |

## 8. Hỏi trợ giúp theo đúng cách của kit

Mở issue trong kit repo với đúng kỷ luật nó dạy: **vấn đề, bằng chứng, đã thử gì, các
phương án đã cân nhắc** — đúng format escalation mà agent phải tuân trong
`templates/AGENTS.md` ("trả lời được trong < 2 phút"). Câu hỏi theo format này thường
tự giải trên đường đi.

---

*Về [README](../../README.md) · kế hoạch v2 đa thành viên → [`13-roadmap-v2.md`](13-roadmap-v2.md)*
