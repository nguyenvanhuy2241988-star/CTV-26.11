# Hướng dẫn Vận hành, Cấu hình và Triển khai Website CVT

## 1. Thông tin Dự án
- **Domain chính thức**: `https://www.cvt.com.vn` (và `https://cvt.com.vn`)
- **Hosting**: Vercel (Project name: `ctv-26-11`)
- **GitHub Repository**: `nguyenvanhuy2241988-star/CTV-26.11`
- **Nhánh triển khai**:
  - `main`: Nhánh production chính thức.
  - `feature/cvt-brand-redesign`: Nhánh tích hợp bộ nhận diện và mã nguồn mới.
  - `backup/production-before-redesign-296355c`: Bản snapshot nguyên trạng trước khi đổi giao diện.

## 2. Biến môi trường trên Vercel (Environment Variables)
Cần cấu hình các biến sau trong phần **Settings > Environment Variables** của Vercel Project `ctv-26-11`:

| Tên biến | Mô tả | Bắt buộc |
| :--- | :--- | :--- |
| `CVT_ADMIN_PASSWORD` | Mật khẩu truy cập trang quản trị `/quan-tri` | Có |
| `SUPABASE_URL` | Địa chỉ project Supabase (nếu kết nối DB) | Khuyến nghị |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa Service Role kết nối DB bền vững | Khuyến nghị |

*Lưu ý: Nếu chưa cấu hình Supabase, hệ thống API vẫn vận hành bình thường nhờ cơ chế fallback in-memory/preview kết hợp gửi email thông báo tự động về `lyhu.vn@gmail.com`.*

## 3. Cấu trúc Bảng Cơ sở dữ liệu (Supabase / PostgreSQL SQL)
Chạy mã SQL sau trong SQL Editor của Supabase để tạo bảng:

```sql
-- 1. Bảng lưu yêu cầu hợp tác (Leads)
CREATE TABLE IF NOT EXISTS cvt_requests (
  id TEXT PRIMARY KEY,
  request_key TEXT NOT NULL UNIQUE,
  audience TEXT NOT NULL,
  company TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL,
  purpose TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  consent INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index tra cứu idempotency và lọc thời gian
CREATE INDEX IF NOT EXISTS idx_cvt_requests_key ON cvt_requests(request_key);
CREATE INDEX IF NOT EXISTS idx_cvt_requests_status ON cvt_requests(status);
CREATE INDEX IF NOT EXISTS idx_cvt_requests_created ON cvt_requests(created_at DESC);

-- 2. Bảng lưu nội dung tùy biến (CMS Entries)
CREATE TABLE IF NOT EXISTS cvt_entries (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL,
  published INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cvt_entries_kind ON cvt_entries(kind);
```

## 4. Kiểm tra và Nghiệm thu (QA Checklist)
- [x] Đã import toàn bộ 21 trang HTML + assets hình ảnh, bao bì 10 SKU, video.
- [x] Đổi toàn bộ canonical URL và OpenGraph sang `https://www.cvt.com.vn`.
- [x] Bảo toàn Meta Pixel ID `1117198146781464` trên tất cả các trang.
- [x] Tích hợp Floating CTA gọi Hotline `0969 069 798` và nhắn tin Zalo.
- [x] Khôi phục iframe thật và kết nối biểu mẫu tại `/yeu-cau-hop-tac.html` sang `/dang-ky.html`.
- [x] Trang quản trị `/quan-tri` bảo vệ bằng server-side session, không phụ thuộc header ChatGPT.
- [x] Build multi-page Vite hoàn tất không lỗi, cấu hình `vercel.json` sạch đường dẫn (`cleanUrls`).
- [x] Đã tạo nhánh sao lưu dự phòng `backup/production-before-redesign-296355c`.
