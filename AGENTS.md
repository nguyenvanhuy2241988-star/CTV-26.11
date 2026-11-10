# CVT Production Website — Hướng dẫn phối hợp AI (ChatGPT & Antigravity)

## 1. Nguồn mã nguồn chính thức (Canonical Source)
- **GitHub Repository**: `nguyenvanhuy2241988-star/CTV-26.11`
- **Hosting / Vercel Project**: `ctv-26-11` (gắn domain chính thức `cvt.com.vn` và `www.cvt.com.vn`)
- **Nhánh Production hiện tại**: `main`
- **Nhánh tích hợp bộ giao diện mới**: `feature/cvt-brand-redesign`
- **Nhánh sao lưu an toàn trước khi đổi**: `backup/production-before-redesign-296355c`

> **Lưu ý cốt lõi**: Bản thử nghiệm tại chatgpt.site là bản đối chiếu thiết kế, không tự đồng bộ về website chính thức. Mọi chỉnh sửa của ChatGPT và Antigravity phải thực hiện trực tiếp trên repository này qua Git branch & Pull Request.

## 2. Quy trình phát hành (Release Workflow)
1. **Lấy mã mới nhất**: Luôn fetch/pull từ repo `nguyenvanhuy2241988-star/CTV-26.11`.
2. **Làm trên nhánh riêng**: Không đẩy trực tiếp lên `main`. Sử dụng nhánh `feature/cvt-brand-redesign` cho đợt bàn giao này.
3. **Kiểm tra cục bộ**: Chạy `npm run build` để kiểm tra toàn bộ 24 trang HTML và assets.
4. **Vercel Preview**: Khi đẩy nhánh lên GitHub, Vercel tự động tạo Deployment Preview URL (dạng `https://ctv-26-11-git-feature-cvt-brand-redesign-*.vercel.app`).
5. **Duyệt trước khi merge**: Gửi link Preview cùng kết quả QA Checklist cho chủ website duyệt.
6. **Cập nhật chính thức**: Chỉ sau khi chủ website duyệt mới merge vào nhánh `main` để Vercel cập nhật `www.cvt.com.vn`.

## 3. Các thành phần và kết nối kỹ thuật bảo toàn
- **Meta Pixel**: ID `1117198146781464`, tích hợp chuẩn trên toàn bộ các trang, không gắn trùng lặp sự kiện.
- **Biểu mẫu yêu cầu hợp tác**:
  - Giao diện nhúng tại `/yeu-cau-hop-tac.html` và trang `/dang-ky.html`.
  - Backend API tại `/api/requests` xử lý: Honeypot chống spam, consent, kiểm tra tính hợp lệ dữ liệu, và idempotency chống gửi trùng lặp.
  - Lưu trữ cơ sở dữ liệu (`cvt_requests`) và gửi email thông báo tự động về `lyhu.vn@gmail.com`.
- **Hệ thống Quản trị CMS & Khách hàng**:
  - Đường dẫn: `/quan-tri.html` (hoặc `/quan-tri`).
  - Xác thực Server-side bảo mật qua biến môi trường `CVT_ADMIN_PASSWORD`, tuyệt đối không tin header client gửi và không để lộ token.
  - Quản lý trạng thái leads (`new` -> `contacted` -> `closed`) và tùy biến nội dung sản phẩm/tin tức/hồ sơ/điểm bán.
- **Hotline & Zalo**: `0969 069 798` (Hotline), `https://zalo.me/0969069798` (Zalo).
- **SEO & Canonical**: Tên miền chính thức `https://www.cvt.com.vn`, có đầy đủ `sitemap.xml` và `robots.txt`.

Xem thêm tài liệu chi tiết tại `docs/EDITING-AND-DEPLOYMENT.md`.
