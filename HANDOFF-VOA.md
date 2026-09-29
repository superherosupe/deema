# Prompt bàn giao – Ấn phẩm Hội nghị VOA (Thăng Long Quốc Tế)

> Dán toàn bộ file này vào một session Claude Code mới (repo `superherosupe/deema`, nhánh `claude/laughing-curie-wog6xw`).

## Bối cảnh

Bạn tiếp tục dự án thiết kế ấn phẩm cho **Dịch vụ Y khoa Thăng Long Quốc Tế** tại **Hội nghị VOA**. Công ty phân phối 3 hãng:

- **Allgens**: xương nhân tạo collagen khoáng hóa. Sản phẩm: **BonGold** (chấn thương chỉnh hình) và **Skulheal** (ngoại thần kinh). Chứng nhận: FDA, ISO.
- **Curexo**: robot định vị phẫu thuật cột sống **CUVIS Spine**. Chứng nhận: CE, FDA.
- **Mantiz**: **PANTHER** (lồng thắt lưng in 3D), **PETRA** (lồng cổ in 3D), **QUATTRO** (vít cuống sống), **QUATTRO GADGET** (vít qua da, ít xâm lấn MIS). Chứng nhận: ISO 13485:2016, GMP.

Người dùng viết tiếng Việt, thường không dấu hoặc gõ nhanh. Trả lời bằng tiếng Việt có dấu, ngắn gọn. Sau mỗi thay đổi, luôn gửi lại file (JPG, PPTX, PDF) cho người dùng và commit, push lên nhánh trên.

## Các sản phẩm đã làm (trong repo)

| Thư mục | Nội dung |
|---|---|
| `backdrop-voa/` | Backdrop **5m × 2,5m (tỉ lệ 2:1, thiết kế ở 1920×960px, 1px ≈ 2,6mm khi in)**: `backdrop-VOA.jpg` (7680×3840), `.pdf`, `.pptx` (tách lớp hoàn toàn), `trang-nhan-hang-QR.jpg` (xem trước trang QR) |
| `backdrop-voa/src/` | Mã nguồn: `backdrop.html` (thiết kế gốc), `img/` (toàn bộ logo, ảnh sản phẩm, QR), `sheet.html` (trang thông tin mỗi nhãn hàng cho điện thoại, 1080×1920) |
| `sp/` | `allgens.jpg`, `cuvis.jpg`, `mantiz.jpg`: trang mà mã QR nhãn hàng trỏ tới |
| `to-roi-voa/` | Tờ rơi A4 in 2 mặt (`.pdf`, `.pptx`, 2 JPG), bản PDF nhẹ cho điện thoại, thẻ QR đặt bàn `the-QR-tai-lieu.png` |
| `to-roi-voa/src/` | `flyer.html` và các script xuất |

## Quy trình build (chạy trong thư mục `src/`)

Môi trường: Chromium tại `/opt/pw-browsers/chromium`; `npm i playwright@1.56 pptxgenjs`; `pip install pymupdf pillow "qrcode[pil]" opencv-python-headless defusedxml lxml`; để xem trước PPTX cần `apt-get install -y libreoffice-impress`.

**Backdrop:**
```bash
node r.js 1 full.png                                   # xem trước 1920x960
node r.js 4 backdrop-VOA.png backdrop-VOA.pdf          # xuất in; rồi PNG -> JPG bằng Pillow (quality 92)
rm -rf layers && node le.js backdrop.html layers && python3 lp.py layers && node gl.js layers backdrop-VOA.pptx
```

- `le.js` duyệt DOM theo thứ tự vẽ và tạo mỗi phần tử thành một lớp PPT riêng:
  - Khối tô một màu → hình PowerPoint gốc.
  - Khối gradient hoặc có `::before` → PNG trong suốt riêng.
  - Ảnh → ảnh; phần tử có class `.t` → ô chữ.
  - SVG chú thích robot → đường thẳng và hình oval gốc.
  - `.bg` → một ảnh nền duy nhất.
- `lp.py` cắt viền PNG và gắn bóng đổ vào các ảnh `.shadow`.
- `gl.js` tạo file PPTX.
- **Mọi chữ muốn chỉnh được trong PowerPoint phải có class `t`.**
- Script cũ `extract.js`, `gen_ppt.js`, `post.py` là pipeline trước, không dùng nữa.

**Trang QR nhãn hàng:** `node rs.js` → `sheets/{allgens,cuvis,mantiz}.jpg` → copy vào `/sp`, commit, push. Lấy SHA commit, tạo QR trỏ tới `https://raw.githubusercontent.com/superherosupe/deema/<SHA>/sp/<brand>.jpg`. Raw GitHub trả về `image/jpeg` nên điện thoại mở xem ngay. QR hiện tại khóa theo SHA `34217a2d929d8195ad0311312c872fd4f46f4170`.

**Tờ rơi:** `node rf.js 4 _hi to-roi-VOA.pdf`; PPTX: `node ef.js && python3 pf.py && node gf.js`. Pipeline cũ, ảnh nền còn gộp khung. Nếu người dùng muốn tách lớp như backdrop, áp dụng `le.js/lp.py/gl.js` cho từng trang: `le.js flyer.html <out> 794 1123 '#p1'`, và `gl.js` với khổ A4 8,27×11,69in.

**Luôn kiểm tra trước khi gửi:**
1. Xem ảnh render.
2. Chạy `validate.py` của skill pptx.
3. Chuyển PPTX sang PDF bằng LibreOffice rồi xem.
4. Quét lại mọi QR trên JPG in: cắt từng mã theo vị trí, dùng `cv2.QRCodeDetector` với nhiều mức thu phóng (thư viện đôi khi cần scale 0.3–0.6).

## Thiết kế hiện tại của backdrop (đã được người dùng duyệt qua nhiều vòng)

- **Tông màu:** một tông navy (#061a3f → #0a2a63), nhấn xanh lá #8ed14f (lấy từ logo Thăng Long) và cyan #5fd4ff cho chú thích robot. Không dùng nhiều màu khác.
- **Header:**
  - Logo Thăng Long trong vòng tròn trắng, bên cạnh là "DỊCH VỤ Y KHOA **THĂNG LONG QUỐC TẾ**" trên một dòng, dưới là slogan *"Kết nối công nghệ, Kiến tạo giá trị"*.
  - Góc phải: "Hotline 0916 899 322" và 4 QR mạng xã hội, mỗi mã khoảng 20cm khi in.
  - **Không** có dòng "Kết nối với chúng tôi".
- **Khối Allgens (trái, rộng 830px, viền xanh lá phát sáng):**
  - "VẬT LIỆU XƯƠNG SINH HỌC COLLAGEN KHOÁNG HÓA", "Đạt chứng nhận FDA Hoa Kỳ", "Tương đồng cao với xương tự thân".
  - BonGold và Skulheal so le trái phải.
  - Thanh số liệu: 45 : 55 (Collagen I : nano-HA), 70–80% độ xốp, >200.000 ca lâm sàng.
- **Khối Cột sống (phải):** header chia đôi Curexo | Mantiz bằng đường kẻ dọc.
  - **Phần robot:** tiêu đề "GIẢI PHÁP TÍCH HỢP CHO PHẪU THUẬT CỘT SỐNG" (chỉ nằm trong phần robot); robot đặt sát đáy; 3 bong bóng chú thích kiểu công nghệ có đường dẫn tới robot: 01 Giảm phơi nhiễm tia X (camera), 02 Độ chính xác cao (cánh tay), 03 Tối ưu hóa quy trình phẫu thuật (màn hình).
  - **Cột Mantiz (rộng 410px):** lưới 2×2, ảnh ở trên và chú thích ở dưới. Panther và Petra nằm trong khung "CÔNG NGHỆ IN 3D – Cấu trúc xốp tối ưu hóa tích hợp xương"; Gadget có nhãn MIS.
- **QR nhãn hàng:** **mỗi nhãn hàng 1 QR**, đặt ở góc phải header của từng hãng (khoảng 19cm), trỏ tới trang `sp/<brand>.jpg`.

## Liên kết và thông tin liên hệ

- Hotline: 0916 899 322.
- Facebook: https://www.facebook.com/profile.php?id=61591032317104
- Zalo: https://zalo.me/0916899322 (tạo từ hotline, chưa được người dùng xác nhận).
- TikTok: https://www.tiktok.com/@hangi.vietnam
- Instagram: https://www.instagram.com/thehangivietnam/
- Website thehangivietnam.xyz bị chặn trong môi trường cloud.

## Sở thích và phản hồi của người dùng (quan trọng)

- **Không thích:**
  - Con dấu chứng nhận vàng: dùng logo chứng nhận gốc xếp thành hàng.
  - Chữ quá nhiều.
  - Sản phẩm trắng đặt trên nền trắng.
  - Gạch đầu dòng khô khan cho robot: dùng bong bóng chú thích.
  - Khoảng trống thừa.
- **Muốn:**
  - Allgens nổi bật nhất.
  - Mantiz vẫn có ảnh sản phẩm.
  - Robot gọn.
  - PowerPoint **tách lớp hoàn toàn**, mọi thứ chỉnh được, không gộp vào nền.
- **Chỉ dùng thông tin có nguồn, không tự bịa số liệu.**

## Việc còn mở và cảnh báo

1. **Nội dung cần hãng xác nhận:**
   - **Allgens:** ">200.000 ca", "Đạt chứng nhận FDA Hoa Kỳ" (FDA 510(k) K141725 cho BonGold, vật liệu lấp khuyết xương **không bao gồm cột sống**), kích thước lỗ 200–400 µm, "công nghệ bản quyền Đại học Thanh Hoa" (có trên tờ rơi).
   - **Logo FDA:** FDA không cho doanh nghiệp tư nhân dùng logo FDA; nên hỏi hãng.
2. **Ảnh gốc độ phân giải thấp:** logo và ảnh sản phẩm tách từ PDF gốc, in 5m sẽ mờ. Nên xin ảnh gốc từ hãng. Catalogue CUVIS có trong Google Drive ("2. CUVIS-spine"); không có catalogue Allgens và Mantiz.
3. **Repo phải giữ công khai và không xóa**, nếu không mọi QR trỏ vào `raw.githubusercontent.com` sẽ không mở được.
4. **Tờ rơi:** chưa có lề chảy máu (bleed) 3mm; PPTX tờ rơi chưa tách lớp.
5. Trong PowerPoint, kéo robot thì đường chú thích không tự bám theo.
