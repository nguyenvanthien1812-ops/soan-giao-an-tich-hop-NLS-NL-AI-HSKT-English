# Các quy tắc phát triển và vận hành dự án (AI Instructions)

Tài liệu này ghi lại các quy tắc đã được thống nhất để AI hoặc các nhà phát triển sau này tuân thủ khi chỉnh sửa dự án.
Tôi đang triển khai ứng dụng từ github qua vercel, hãy kiểm tra giúp tôi các file vercel.json, index.html có tham chiếu đúng chưa và hướng dẫn tôi setup api key gemini để người dùng tự nhập API key của họ để chạy app

## 1. Cấu hình Model AI
- **Model mặc định**: `gemini-2.5-flash`
- **Lý do**: Cân bằng tốc độ và hiệu suất tốt nhất hiện tại.
- **Vị trí cấu hình**: `services/geminiService.ts`

## 2. Quản lý API Key
- **Cơ chế**: Ưu tiên API Key người dùng nhập vào (lưu trong `localStorage`) hơn biến môi trường.
- **Giao diện**: Nếu thiếu key, phải hiện popup/modal yêu cầu người dùng nhập. Không được hardcode key vào source code.
- **Xử lý lỗi**: Nếu gặp lỗi `429` (Quota exceeded) hoặc `403/400`, phải hiển thị thông báo chi tiết màu đỏ lên UI để người dùng biết (không hiện chung chung "Đã xảy ra lỗi").

## 3. Triển khai (Deployment)
- **Nền tảng**: Vercel.
- **Cấu hình Routing**: Bắt buộc phải có file `vercel.json` ở thư mục gốc để xử lý SPA routing (tránh lỗi 404 khi f5 trang con).
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

## 4. UI/UX
- Khi có lỗi API, hiển thị nguyên văn message trả về (ví dụ: `RESOURCE_EXHAUSTED`, `API key not valid`) để dễ tìm nguyên nhân.

## 5. Cơ chế hoạt động (XML Injection & Bảo toàn OLE)

### 5.1. Giữ nguyên File gốc (XML Injection)
- **Mô tả**: Hệ thống sử dụng kỹ thuật **XML Injection** để chèn nội dung vào cấu trúc file Word (.docx) hiện tại.
- **Nguyên lý**: Chỉ **CHÈN THÊM** nội dung, không xóa/sửa nội dung cũ → Giữ nguyên 100% định dạng, OLE, hình ảnh.

### 5.2. Bảo toàn OLE Objects
- Công thức MathType và Hình vẽ **không bị ảnh hưởng**
- Các file trong `word/embeddings/` và `word/media/` được giữ nguyên

### 5.3. Cấu trúc đầu ra từ AI
AI trả về nội dung theo các section:
```
===NLS_MỤC_TIÊU===          → Chèn vào cuối phần "2. Năng lực" của Mục I. MỤC TIÊU
===NLS_HOẠT_ĐỘNG_1_TỔ_CHỨC=== → Chèn vào phần "d) Tổ chức thực hiện" của Hoạt động 1
===NLS_HOẠT_ĐỘNG_2_TỔ_CHỨC=== → Chèn vào phần "d) Tổ chức thực hiện" của Hoạt động 2
===NLS_HOẠT_ĐỘNG_3_TỔ_CHỨC=== → Chèn vào phần "d) Tổ chức thực hiện" của Hoạt động 3
===NLS_HOẠT_ĐỘNG_4_TỔ_CHỨC=== → Chèn vào phần "d) Tổ chức thực hiện" của Hoạt động 4
```

### 5.4. Quy tắc chèn chi tiết
- **Mục I. MỤC TIÊU**: Chèn tiêu đề `<blue>* Phát triển năng lực số</blue>` kèm các câu chỉ báo mã NLS (ví dụ `1.1.TC1a:...`) ở cuối phần **`2. Năng lực`** (trước mục `3. Phẩm chất`).
- **Các Hoạt động**: **CHỈ CHÈN** vào phần **`d) Tổ chức thực hiện`** (hoặc các bước *Chuyển giao*, *Thực hiện*, *Báo cáo*, *Đánh giá* trong Tổ chức thực hiện). Tuyệt đối không chèn vào `a) Mục tiêu`, `b) Nội dung`, `c) Sản phẩm`.
- **Mã chỉ báo NLS/AI**: Giữ nguyên mã chỉ báo NLS (dạng `1.1.TC1a:`) bằng văn bản màu xanh dương, hoặc mã AI (`NLc.C2:`) bằng màu tím trong cả Mục I và trong các Hoạt động.

### 5.5. Định dạng màu sắc chuẩn 4 tính năng (Color Palette)
- **Năng lực số (NLS)**: Thẻ `<blue>...</blue>` → Web `#1d4ed8` (font-weight 600), Word XML `<w:color w:val="0055D4"/>`.
- **Năng lực AI (Trí tuệ nhân tạo)**: Thẻ `<purple>...</purple>` → Web `#7c3aed` (font-weight 600), Word XML `<w:color w:val="7030A0"/>`.
- **Hòa nhập Học sinh Khuyết tật (HSKT)**: Thẻ `<green>...</green>` → Web `#059669` (italic, font-weight 600), Word XML `<w:color w:val="008000"/>` + `<w:i/>`.
- **Tích hợp Tiếng Anh (Ngôn ngữ 2)**: Thẻ `<orange>...</orange>` → Web `#b45309` (italic, font-weight 600), Word XML `<w:color w:val="B45309"/>` + `<w:i/>`.

### 5.6. Thư viện sử dụng
- **JSZip**: Đọc và ghi file DOCX (ZIP).
- Workflow:
  ```
  File gốc → JSZip → Tìm vị trí "2. Năng lực" & "d. Tổ chức thực hiện" → Chèn nội dung theo màu sắc chuẩn → Đóng gói → File mới
  ```

### 5.7. Quy tắc Khóa phân bổ Độc lập HSKT, Tiếng Anh & NLS (Feature Isolation Rules)
- **TẮT Năng lực số & AI (`integrationMode = 'NONE'`)**:
  - CẤM chèn chữ màu xanh dương `<blue>` hoặc màu tím `<purple>`, CẤM tạo Bảng tổng hợp NLS cuối bài.
  - NẾU có BẬT HSKT hoặc Tiếng Anh: BẮT BUỘC vẫn sinh các Marker cấu trúc (`===NLS_MỤC_TIÊU===`, `===NLS_HOẠT_ĐỘNG_X_TỔ_CHỨC===`) để phục vụ việc chèn tự động vào file Word DOCX.
- **TẮT Giáo dục Hòa nhập HSKT (`includeDisabilitySupport = false`)**:
  - CẤM TUYỆT ĐỐI chèn bất kỳ nội dung hỗ trợ HSKT nào. CẤM DÙNG THẺ `<green>`.
- **TẮT Tích hợp Tiếng Anh (`includeEnglishIntegration = false`)**:
  - CẤM TUYỆT ĐỐI chèn bất kỳ nội dung từ vựng hay câu lệnh Tiếng Anh nào. CẤM DÙNG THẺ `<orange>`.
- **Phân bổ độc lập tuyệt đối**: Mỗi tính năng chỉ xuất hiện khi checkbox tương ứng được bật.

### 5.8. Quy tắc Phân bổ NLS/AI vào Đúng Bước trong "d. Tổ chức thực hiện" (CV 3456 & QĐ 3439)

**Nguyên tắc cốt lõi**: NLS (`<blue>`) và Năng lực AI (`<purple>`) **luôn luôn là năng lực của Học sinh (HS)**. GV chỉ tổ chức, hướng dẫn, tạo điều kiện. GV **không** phát triển NLS/AI.

| Bước | Chủ thể | Điều kiện CHÈN NLS | Điều kiện CẤM CHÈN |
|:---:|:---|:---|:---|
| **Bước 1** Chuyển giao | GV giao bài | GV dùng học liệu số (video, slide, Kahoot/Quizizz) | GV chỉ nói miệng / viết bảng / phát phiếu giấy |
| **Bước 2** Thực hiện | **HS làm (TRỌNG TÂM)** | HS dùng GeoGebra, PhET, MTCT, Docs, tìm kiếm, AI... | HS chỉ làm bài tay / thảo luận miệng thuần túy |
| **Bước 3** Báo cáo | HS trình bày | HS chia sẻ qua Padlet, Google Slides, TV số | HS chỉ trình bày miệng / viết bảng đen |
| **Bước 4** Đánh giá | GV chốt | Chỉ khi có AI / phần mềm đánh giá số thực sự (rất hiếm) | **Mặc định KHÔNG chèn** khi GV chỉ nhận xét miệng |
| **Vị trí 1** (trước Bước 1) | Xuyên suốt | NLS xuyên suốt nhiều bước (Kahoot toàn hoạt động, Google Classroom...) | NLS chỉ xảy ra ở 1 bước đơn lẻ → dùng Vị trí 2 trong bước đó |

### 5.9. Quy tắc Phân biệt NLS theo Loại Hoạt động Dạy học (CV 5512/BGDĐT-GDTrH)

Mỗi bài dạy gồm 4 loại hoạt động có **mục đích sư phạm khác nhau** → NLS/AI phải phù hợp đặc thù từng loại:

| Loại hoạt động | Mục đích | Chủ thể | Có đủ 4 bước? | Cách viết NLS | Mã NLS ưu tiên | Cấm |
|:---|:---|:---|:---:|:---|:---|:---|
| **Mở đầu** (Khởi động) | Kết nối, kích thích | GV dẫn dắt | Thường rút gọn | VẾ ĐƠN | 1.1, 2.1, NLc.C2 | Chèn khi GV không dùng học liệu số |
| **HTKM** (Khám phá kiến thức) | HS khám phá mới | HS chủ động (GV hỗ trợ) | ✅ Thường đủ | VẾ KÉP (GV hướng dẫn → HS thực hiện) | 5.2, 5.3, 2.4, 3.1, NLc.C2 | — |
| **Luyện tập** (Củng cố) | HS củng cố bài tập đóng | HS tự lực (GV ít hỗ trợ) | ✅ Thường đủ | **VẾ ĐƠN** bắt buộc | 5.2 (MTCT kiểm tra), 2.2 (Padlet chia sẻ đáp án), NLc.C2 | VẾ KÉP "GV hướng dẫn mới"; mã khám phá 1.2, 1.3, NLd.D1 |
| **Vận dụng** (Thực tiễn mở) | HS áp dụng tình huống thực tiễn | HS hoàn toàn tự chủ | ⚠️ Linh hoạt, có thể giao về nhà | **VẾ ĐƠN** bắt buộc | 1.1, 3.1, 2.2, 2.4, NLd.D1, NLa.A3 | VẾ KÉP; mã củng cố 5.2 MTCT kiểm tra nghiệm; ép đủ 4 bước khi giao về nhà |

**Phân loại 3 nhóm Luyện tập (mới – bắt buộc áp dụng):**

| Nhóm | Dấu hiệu nhận biết | Quyết định |
|:---|:---|:---:|
| **LT-1 Truyền thống** | HS trả lời miệng / phiếu giấy / ghép nối giấy / thảo luận miệng | ❌ **KHÔNG CHÈN** NLS |
| **LT-2 Có công cụ số** | GA gốc nhắc tên phần mềm/nền tảng số cụ thể | ✅ Chèn đúng mã |
| **LT-3 Thực hành + bảng tính** | HS đo đạc + nhập vào Google Sheets/Excel (ghi trong GA) | ✅ Chèn 5.2(B2) |

> ⚠️ **TUYỆT ĐỐI KHÔNG tự thêm Quizizz/Kahoot/Padlet/Docs vào Luyện tập nếu GA gốc không đề cập.**

**Phân loại 4 nhóm Vận dụng (mới – tối đa 2-3 NLS):**

| Nhóm | Dấu hiệu | NLS đề xuất |
|:---|:---|:---|
| **VĐ-1 Giao về nhà/dự án** | "về nhà", "dự án", "nghiên cứu thêm" | 1.1(B2), 3.1(B2), 2.2(B3) |
| **VĐ-2 Tạo sản phẩm** | "báo cáo", "video", "poster", "sơ đồ" | 3.1(B2), 2.2(B3), 2.4(B2 nếu nhóm) |
| **VĐ-3 Giải pháp thực tiễn** | "đề xuất", "thiết kế", "ứng dụng AI" | NLd.D1(B2), NLa.A3(B2), 1.1(B2) |
| **VĐ-4 Thực hành đơn giản** | "thực hành", "đo", "quan sát" | Chỉ 1 NLS: 3.1 (quay video → nộp Classroom) |

**Quy tắc Vận dụng giao về nhà:**
- Nếu Vận dụng giao về nhà: chỉ cần **1-2 marker NLS** (Bước 1 nếu GV giao qua Google Classroom, hoặc ghi nhận HS sẽ tìm kiếm/tạo sản phẩm ở Bước 2).
- **KHÔNG** tạo Bước 3, 4 giả tạo trong tiết nếu không xảy ra trong tiết.
- **KHÔNG** dùng mã bài tập đóng (5.2 MTCT kiểm tra nghiệm) — Vận dụng là tình huống mở, thực tiễn.

### 5.10. Quy tắc ĐPQ – Đọc–Phân tích–Quyết định (Quy tắc chống bịa công cụ số)

Trước khi chèn bất kỳ NLS nào, AI bắt buộc thực hiện 3 bước:

```
ĐỌC → PHÂN TÍCH → QUYẾT ĐỊNH
```

| Bước | Câu hỏi | Mục đích |
|:---|:---|:---|
| **ĐỌC** | "GV làm gì? HS làm gì? Có tên công cụ/nền tảng số nào không?" | Đọc nguyên văn GA gốc |
| **PHÂN TÍCH** | Tình huống A / B / C? | Xác định nhóm chèn |
| **QUYẾT ĐỊNH** | Chèn / Đề xuất / Bỏ qua | Áp dụng đúng quy tắc |

**3 Tình huống:**
- **TH-A** (Có công cụ số thực sự): ✅ CHÈN đúng mã — mọi loại hoạt động
- **TH-B** (Vận dụng mở, đủ điều kiện): ✅ CHÈN tối đa 3 NLS theo nhóm VĐ
- **TH-C** (Truyền thống, không có công cụ số): ❌ KHÔNG CHÈN

> 🚨 **Quy tắc Vàng:** "KHÔNG BAO GIỜ tự thêm công cụ số (Quizizz, Kahoot, Padlet, Google Docs, GeoGebra...) vào Mở đầu, HTKM, Luyện tập nếu GA gốc KHÔNG ĐỀ CẬP. Chỉ Vận dụng mới được phép đề xuất công cụ mới."

