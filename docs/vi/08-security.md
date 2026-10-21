# 08 · Bảo mật & DevSecOps

> Bảo mật cho **sản phẩm** xuyên suốt vòng đời — threat modeling, thiết kế an toàn, kiểm thử bảo mật, supply chain, secrets, quản lý lỗ hổng, phản ứng sự cố bảo mật. Tài liệu này lấp khoảng trống lớn nhất của bản 1.0. Bảo mật cho **nền tảng agent** (sandbox, credential có phạm vi, prompt injection, tính độc lập của reviewer) vẫn ở [`04-gates-policy.md`](04-gates-policy.md) §4 — hai miền gặp nhau ở các gate. *(English: [`../en/08-security.md`](../en/08-security.md))*

---

## 1. Hai miền bảo mật — đừng nhầm lẫn

| Miền | Câu hỏi trả lời | Ở đâu |
|---|---|---|
| **Bảo mật sản phẩm** (tài liệu này) | Kẻ tấn công có thể hại phần mềm, dữ liệu, người dùng của ta không? | Tại đây |
| **Bảo mật nền tảng agent** | Các agent đang xây dựng/vận hành phần mềm có thể bị lạm dụng không? | `04` §4 |

Trong AI-SDLC hai miền giao nhau tại một điểm then chốt: **agent viết phần lớn code, nên các kiểm soát bảo mật sản phẩm phải mặc định đầu vào đến từ các "tác giả" nhanh và cực kỳ năng suất.** Đó chính là lý do con số 45% mẫu code AI có lỗ hổng (nghiên cứu, `01`) đòi hỏi các gate dưới đây.

---

## 2. Hoạt động bảo mật trên 6 giai đoạn

| Giai đoạn | Hoạt động bảo mật | Output |
|---|---|---|
| **Plan** | Sàng lọc bảo mật trong intent: có chạm PII/auth/thanh toán/ranh giới ngoài không? Phân loại dữ liệu | Dòng ràng buộc trong `intent.md` |
| **Design** | **Threat model** cho mọi thay đổi vượt ranh giới tin cậy; yêu cầu bảo mật (SR-x) | [`templates/threat-model.md`](../../templates/threat-model.md) → spec §3 |
| **Build** | Quy tắc secure-coding trong AGENTS.md; vệ sinh secrets; allowlist dependency; SAST trên mọi PR | Mục bảo mật trong AGENTS.md; CI |
| **Test** | Bộ gate bảo mật: SAST/SCA/secret-scan/DAST/container-scan; security evals; fuzz parser | Kết quả gate trong pipeline chất lượng |
| **Deploy** | Checklist hardening; artifact có chữ ký + SBOM; gate bảo mật release; review cấu hình | Audit trail của bản phát hành |
| **Maintain** | Quản lý lỗ hổng (tiếp nhận→triage→SLA→patch); phản ứng sự cố bảo mật; công bố | Sổ lỗ hổng; postmortem bảo mật → intent |

 Nguyên tắc: **việc bảo mật là việc được lập lịch, không phải anh hùng cá nhân** — mỗi SR-x có test, mỗi gate có chủ sở hữu, mỗi lỗ hổng có SLA.

---

## 3. Threat modeling (giai đoạn Design)

- **Khi nào:** mọi thay đổi vượt ranh giới tin cậy, chạm authn/authz, di chuyển PII, hoặc thay đổi công cụ của agent. Thay đổi nhỏ → phiên nhẹ 30 phút; hệ thống con mới → nửa ngày.
- **Cách làm:** STRIDE cho từng phần tử của luồng dữ liệu (sơ đồ → ranh giới → đe dọa → rủi ro → giảm thiểu → kiểm soát), kèm checklist đe dọa agentic. Template: [`templates/threat-model.md`](../../templates/threat-model.md).
- **Hợp đồng output:** mỗi biện pháp giảm thiểu phải trở thành (a) yêu cầu bảo mật `SR-x` trong spec kèm test, hoặc (b) một gate trong `quality-gates.yml`. Threat model không sinh ra kiểm soát là threat model trang trí.
- **Nhịp mở lại:** theo trigger (đổi ranh giới/auth/luồng dữ liệu) hoặc hằng quý với hệ thống critical.
- **Ai làm:** Spec Reviewer dẫn dắt; Security Lead ký; agent có thể vẽ nháp sơ đồ từ spec — con người xác nhận ranh giới tin cậy.

---

## 4. Kiểm thử bảo mật & bộ gate

| Kiểm soát | Bắt được gì | Cấp (khởi đầu → mục tiêu) | Ghi chú |
|---|---|---|---|
| **SAST** (tĩnh) | Injection, pattern không an toàn trong mã nguồn | soft → **hard** (critical) | Semgrep/Sonar; mỗi PR; rule riêng cho stack của bạn |
| **SCA / audit dependency** | CVE đã biết trong thư viện | soft → **hard** (critical) | Kèm kiểm tra license; cưỡng chế lockfile |
| **Secret scanning** | Credential bị commit | **hard** từ ngày đầu | Quét cả history khi onboarding repo cũ |
| **DAST** (động, vào staging) | Lỗi runtime — bypass auth, sai cấu hình | advisory → soft (critical/high) | Chạy trước release vào staging |
| **Container/image scan** | CVE ảnh gốc, lệch cấu hình | advisory → soft | Khớp với policy của registry |
| **IaC scan** | Terraform/K8s không an toàn | advisory → soft | Cùng pipeline với code ứng dụng |
| **Fuzzing** | Crash parser/giao thức | advisory | Crash nào thành regression test |
| **Security evals cho agent** | Code agent vi phạm quy ước bảo mật | advisory → soft | Case eval: "agent có lộ dữ liệu vào log / thêm dependency ngoài allowlist / yếu hóa authz không" |
| **Pen-test** | Những gì tự động bỏ sót | Nhịp ngoài: hệ thống hướng internet ≥ 1 lần/năm; trước release lớn | Gate freshness (advisory) |

**Điểm riêng của AI:** vì agent refactor và tái sinh code nhanh, độ trôi (drift) nghiêm trọng hơn SDLC truyền thống — chạy cả bộ trên **mọi PR**, không phải hằng tuần. Chi phí kiểm soát được nhờ model routing (triage bằng mô hình rẻ, phân tích sâu chỉ khi có phát hiện).

---

## 5. Bảo mật supply chain

1. **Lockfile bắt buộc** — build tái lập được; gate `quality-no-new-dependency-unlisted` (soft).
2. **Allowlist dependency** trong `AGENTS.md`; thứ gì mới phải qua người review (kiểm tra độ mới: lịch sử maintainer, đường cong lượt tải, dependency truyền suốt).
3. **SBOM cho mỗi build** (CycloneDX/SPDX), đính kèm release — gate `security-sbom-required` (soft). Không thể patch thứ mình không có danh mục.
4. **Ký artifact & provenance** — kiểu SLSA: build từ source trong CI của bạn, ký artifact (vd sigstore/cosign), chứng thực build. Mục tiêu SLSA level 3 cho hệ thống critical; bắt đầu bằng container có chữ ký.
5. **Mirror registry nội bộ** — neo gói ngoài qua mirror nội bộ; chặn agent sandbox kéo trực tiếp.
6. **Riêng với agent:** việc agent thêm dependency bị gate **soi diff với allowlist**, không tin từ kế hoạch (prompt injection có thể vũ trang hóa "thêm gói bổ ích này").

---

## 6. Secrets & bảo vệ dữ liệu

- **Secrets:** một nguồn chân lý (vault/KMS); token ngắn hạn, có phạm vi cho mọi chủ thể — người và agent alike; lịch rotation; credential dài hạn duy nhất còn lại phải là loại break-glass, niêm phong và có audit.
- **Không secrets thật trong sandbox** — giá trị giả cho môi trường test; gate secret-scan hard từ ngày đầu.
- **Phân loại dữ liệu:** 4 mức (public / internal / confidential / restricted-PII) gán ở Plan (intent) và cưỡng chế bằng quy tắc: mã hóa at rest + in transit cho confidential trở lên; column-level hoặc tokenization cho restricted; quy tắc che log theo mức.
- **Tối thiểu hóa dữ liệu ngay từ thiết kế:** spec phải biện luận cho mọi trường PII thu thập ("lưu vì…"), thời gian giữ dữ liệu tường minh, đường xóa dữ liệu test được (test right-to-erasure là regression test).
- **Privacy là gate, không phải lời hứa:** thay đổi chạm PII bắt buộc threat model + Security Lead review (quy tắc CODEOWNERS theo path).

---

## 7. Danh tính & truy cập — người và agent

| Chủ thể | Quy tắc |
|---|---|
| Con người | SSO + MFA; RBAC theo vai (`release-manager`, `security-lead`…); rà soát truy cập hằng quý; cấm tài khoản dùng chung |
| Agent | **Danh tính hạng nhất** — mỗi agent có service identity riêng gắn với AgentRole; credential có phạm vi + ngắn hạn (TTL, thu hồi khi xong); quyền = f(mức tự chủ) — agent L1 về cấu trúc không thể có quyền merge |
| Service-to-service | mTLS hoặc request có chữ ký trong vòng nội bộ; không tin ngầm "vì cùng mạng" |
| Rà soát | Hằng tháng: sổ credential vs. phạm vi đã cấp; usage ledger (từ `04`) là bằng chứng |

Hệ thống tự chủ (`03`) tự nó là một hệ thống kiểm soát truy cập: **giáng về L0 là thu hồi ngay khả năng ghi** — nhanh hơn phần lớn quy trình deprovision con người.

---

## 8. Quản lý lỗ hổng (giai đoạn Maintain)

Luồng: **tiếp nhận → triage → SLA → patch → xác nhận → học**

1. **Tiếp nhận:** scanner liên tục (SCA/image/DAST), advisory (feed CVE), hộp thư responsible-disclosure, báo cáo pen-test, và phát hiện của SRE agent.
2. **Triage:** severity = CVSS **× khả năng khai thác trong bối cảnh của bạn** (hướng internet? cần auth? dữ liệu gì lâm nguy?). CVSS-9 sau VPN nội bộ có thể xếp dưới CVSS-7 ở trang login.
3. **SLA & leo thang:**

| Severity | SLA sửa | Leo thang khi quá hạn |
|---|---|---|
| Critical (khai thác được, dữ liệu nhạy cảm) | **7 ngày** | gate hard chặn deploy khi artifact còn lỗ hổng; Security Lead được nhắc hằng ngày |
| High | 30 ngày | EM được nhắc hằng tuần |
| Medium | 90 ngày | rà soát sổ theo tháng |
| Low | tốt nhất có thể / gộp lo | — |

4. **Ngoại lệ:** ghi kèm lý do + ngày hết hạn + biện pháp bù trừ; tự hết hạn (không chấp nhận rủi ro vĩnh viễn). Gate `security-vuln-sla-critical` (hard) cưỡng chế SLA critical trên artifact deploy được.
5. **Xác nhận & học:** mỗi bản sửa có regression test; mỗi lỗ hổng lọt ra production có postmortem → intent mới (vòng lặp `02` áp dụng cả cho bảo mật).

---

## 9. Phản ứng sự cố bảo mật

Khác sự cố vận hành: **có đối thủ, có đồng hồ pháp lý.**

| Pha | Hành động |
|---|---|
| **Detect** | Alert 24/7; SRE agent triage tầng một (đối chiếu deploy/diff) nhưng **không tự contain** — cách ly cần người phê duyệt |
| **Contain** | Playbook duyệt sẵn: thu hồi credential, isolate host, tắt feature flag, rotate key; các bước agent chạy được phải khai báo trước trong runbook |
| **Eradicate / recover** | Patch + xác nhận; audit trail từ gate và provenance (`04`) kiêm luôn chứng cứ điều tra — mọi hành động sẵn có ai/cái gì/khi nào/vì sao |
| **Disclose** | Đồng hồ pháp lý chạy (vd GDPR: 72h báo cơ quan giám sát); mẫu thông báo soạn sẵn; chính sách công bố quyết định ở tầm portfolio, không giữa sự cố |
| **Learn** | Postmortem bảo mật (blameless như ops) → cập nhật threat model → evals/gate mới → intent mới |

**Diễu tập hằng quý** (tối thiểu tabletop): credential agent bị đánh cắp, dependency bị đầu độc, prompt-injection trong PR. Câu hỏi không phải *nếu* — mà là *bao lâu thì bạn phát hiện và thu hồi*.

---

## 10. Metrics bảo mật

| Metric | Định nghĩa | Mục tiêu (khởi động) |
|---|---|---|
| Vuln MTTR (critical) | Phát hiện → sửa & xác nhận | < 7 ngày |
| Escape rate | Lỗ hổng phát hiện ở production / tất cả phát hiện | < 10% và giảm |
| Scan coverage | % PR chạy đủ bộ | 100% |
| Secret leak bắt trước merge | số lượng (sớm nên > 0 — gate đang hoạt động) | — |
| Security eval pass rate | Eval hành vi bảo mật của agent | ≥ 0.95 |
| % release có SBOM + chữ ký | Chứng thực supply chain | → 100% |
| Time-to-revoke | Sự cố → thu hồi credential | < 1 giờ |

Báo cáo các số này cạnh metric giao hàng (`05`) — tư thế bảo mật là một panel dashboard hạng nhất, không phải slide audit hằng năm.

---

## 11. Vai trò & trách nhiệm (mở rộng `03`)

| Vai trò | Trách nhiệm bảo mật |
|---|---|
| Security & Compliance Lead | Sở hữu bộ gate, ký threat model, chính sách SLA lỗ hổng, chỉ huy sự cố |
| Agentic Engineer | Security evals, chính sách sandbox/egress, mặc định an toàn trong AGENTS.md, hệ thống credential |
| Spec Reviewer | Buộc sàng lọc bảo mật trong intent; chủ trì threat modeling |
| Mọi developer | Giao kèm test cho SR-x; coi phát hiện bảo mật là defect, không phải thủ tục giấy |
| Agent | Reviewer bảo mật tầng 1 (scan liên tục, soạn nháp threat model từ spec) — **không bao giờ** tự duyệt output của mình (cross-harness, `04` §4.5) |

---

## 12. Ánh xạ tiêu chuẩn

| Tiêu chuẩn | Rơi vào đâu trong bộ này |
|---|---|
| OWASP Top 10 / ASVS | Yêu cầu SR-x xuất phát theo từng tính năng; độ phủ DAST/SAST |
| OWASP Agentic AI (ASI) | Đe dọa agent ở `04` §4 + mục eval của tài liệu này |
| NIST SSDF (SP 800-218) | Các practice PS/PO/PW/RV ánh xạ vào các giai đoạn ở §2 |
| SLSA | Mức provenance supply chain (§5) |
| ISO 27001 / 27701 | Audit trail của gate; xử lý dữ liệu/privacy (§6) |
| GDPR / EU AI Act | Tối thiểu hóa dữ liệu, đồng hồ 72h, minh bạch AI qua attribution |

---

## 13. Checklist khởi động

Ngày một (trước khi kịp thấy nặng):
- [ ] Gate hard secret-scan; lockfile bắt buộc; SAST+SCA mỗi PR (soft)
- [ ] Dòng sàng lọc bảo mật trong template `intent.md` (PII/auth/thanh toán → bắt buộc threat model)
- [ ] Một buổi threat model cho tính năng lộ diện nhất — dùng template
- [ ] Có sổ lỗ hổng (spreadsheet cũng được) với cột severity + SLA

Trưởng thành (trong 2 quý):
- [ ] Đủ bộ gồm DAST + scan image/IaC; SBOM + ký trên release
- [ ] Security evals của agent trong CI; pen-test hằng quý cho hệ hướng internet
- [ ] Playbook sự cố bảo mật được diễu tập; đo time-to-revoke
- [ ] Panel metrics bảo mật sống cạnh metric giao hàng

---

*Liên quan: [`04-gates-policy.md`](04-gates-policy.md) (zero-trust cho agent, các cấp áp dụng) · [`02-framework.md`](02-framework.md) (6 giai đoạn) · [`templates/threat-model.md`](../../templates/threat-model.md) · Về [README](../../README.md)*
