# Hướng dẫn Vận hành, Cấu hình và Triển khai Website CVT

## 1. Thông tin Dự án
- **Domain chính thức**: `https://www.cvt.com.vn` (và `https://cvt.com.vn`)
- **Hosting**: Vercel (Project name: `ctv-26-11` thuộc team `LYHU's projects`)
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
| `SUPABASE_URL` | Địa chỉ project Supabase | Có (để lưu dữ liệu thật) |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa Service Role kết nối DB bền vững | Có (để lưu dữ liệu thật) |

*Nguyên tắc nghiêm ngặt: Hệ thống KHÔNG lưu tạm vào bộ nhớ in-memory khi thiếu cấu hình DB nhằm tránh mất dữ liệu khách hàng trên môi trường serverless. Nếu DB chưa sẵn sàng, hệ thống báo 503 và hướng dẫn khách liên hệ Hotline/Zalo.*

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

-- 3. Bảng chia sẻ Rate Limiting cho Đăng nhập Quản trị (Chống Brute Force trên nhiều serverless instance)
CREATE TABLE IF NOT EXISTS cvt_admin_attempts (
  ip TEXT PRIMARY KEY,
  attempts INT NOT NULL DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  locked_until TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## 4. Kiểm tra và Nghiệm thu (QA Checklist)
- [x] Đã import toàn bộ 21 trang HTML + assets hình ảnh, bao bì 10 SKU, video.
- [x] Đổi toàn bộ canonical URL và OpenGraph sang `https://www.cvt.com.vn`.
- [x] Bảo toàn Meta Pixel ID `1117198146781464` trên tất cả các trang.
- [x] Tích hợp Floating CTA gọi Hotline `0969 069 798` và nhắn tin Zalo.
- [x] Khôi phục iframe thật và kết nối biểu mẫu tại `/yeu-cau-hop-tac.html` sang `/dang-ky.html`.
- [x] Chỉ lưu DB thật: chặn 503 khi chưa có DB, không lưu tạm memory.
- [x] Giải quyết triệt để Race condition: Request thua cuộc đua nhận lại đúng ID đã lưu và **không** gửi email lần 2.
- [x] Email thông báo: `await` phản hồi từ gateway và xác nhận trạng thái `gateway_accepted`.
- [x] Quản trị phân tán: Rate limiting lưu vào DB chia sẻ giữa các instance Vercel.
