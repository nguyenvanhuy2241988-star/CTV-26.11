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
| `SUPABASE_URL` | Địa chỉ project Supabase | Có (để lưu dữ liệu thật & bảo vệ đăng nhập) |
| `SUPABASE_SERVICE_ROLE_KEY` | Khóa Service Role kết nối DB bền vững | Có (để lưu dữ liệu thật & bảo vệ đăng nhập) |

*Nguyên tắc nghiêm ngặt: Hệ thống KHÔNG lưu tạm vào bộ nhớ in-memory khi thiếu cấu hình DB nhằm tránh mất dữ liệu khách hàng hoặc bypass rate limiting trên môi trường serverless. Nếu DB chưa sẵn sàng, hệ thống trả về 503.*

## 3. Cấu trúc Bảng & Hàm RPC Cơ sở dữ liệu (Supabase / PostgreSQL SQL)
Chạy mã SQL sau trong SQL Editor của Supabase để khởi tạo đầy đủ:

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

-- 3. Bảng Rate Limiting cho Đăng nhập Quản trị (Dùng chung cho mọi Vercel instance)
CREATE TABLE IF NOT EXISTS cvt_admin_attempts (
  ip TEXT PRIMARY KEY,
  attempts INT NOT NULL DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  locked_until TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Hàm RPC: Kiểm tra Rate Limit Đăng nhập
CREATE OR REPLACE FUNCTION cvt_check_login_rate_limit(
  p_ip TEXT,
  p_window_interval INTERVAL DEFAULT INTERVAL '15 minutes'
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_attempts INT,
  locked_until TIMESTAMP WITH TIME ZONE,
  remaining_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec cvt_admin_attempts%ROWTYPE;
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  SELECT * INTO v_rec FROM cvt_admin_attempts WHERE ip = p_ip;

  IF NOT FOUND THEN
    RETURN QUERY SELECT TRUE, 0, NULL::TIMESTAMP WITH TIME ZONE, 0;
    RETURN;
  END IF;

  IF v_rec.locked_until IS NOT NULL AND v_rec.locked_until > v_now THEN
    RETURN QUERY SELECT FALSE, v_rec.attempts, v_rec.locked_until, 
      CEIL(EXTRACT(EPOCH FROM (v_rec.locked_until - v_now)))::INT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, v_rec.attempts, NULL::TIMESTAMP WITH TIME ZONE, 0;
END;
$$;

-- 5. Hàm RPC: Tăng bộ đếm thử sai nguyên tử (Atomic Counter with Row-Level Lock)
CREATE OR REPLACE FUNCTION cvt_record_login_failure(
  p_ip TEXT,
  p_max_attempts INT DEFAULT 5,
  p_window_interval INTERVAL DEFAULT INTERVAL '15 minutes',
  p_lockout_interval INTERVAL DEFAULT INTERVAL '15 minutes'
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_attempts INT,
  locked_until TIMESTAMP WITH TIME ZONE,
  remaining_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec cvt_admin_attempts%ROWTYPE;
  v_now TIMESTAMP WITH TIME ZONE := now();
  v_new_attempts INT;
  v_locked_until TIMESTAMP WITH TIME ZONE := NULL;
BEGIN
  SELECT * INTO v_rec FROM cvt_admin_attempts WHERE ip = p_ip FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO cvt_admin_attempts (ip, attempts, first_attempt, locked_until, updated_at)
    VALUES (p_ip, 1, v_now, NULL, v_now);
    
    RETURN QUERY SELECT TRUE, 1, NULL::TIMESTAMP WITH TIME ZONE, 0;
    RETURN;
  END IF;

  IF v_rec.locked_until IS NOT NULL AND v_rec.locked_until > v_now THEN
    RETURN QUERY SELECT FALSE, v_rec.attempts, v_rec.locked_until, 
      CEIL(EXTRACT(EPOCH FROM (v_rec.locked_until - v_now)))::INT;
    RETURN;
  END IF;

  -- Nếu đã quá cửa sổ 15 phút, reset attempts về 1
  IF v_now - v_rec.first_attempt > p_window_interval THEN
    UPDATE cvt_admin_attempts
    SET attempts = 1,
        first_attempt = v_now,
        locked_until = NULL,
        updated_at = v_now
    WHERE ip = p_ip;

    RETURN QUERY SELECT TRUE, 1, NULL::TIMESTAMP WITH TIME ZONE, 0;
    RETURN;
  END IF;

  v_new_attempts := v_rec.attempts + 1;
  IF v_new_attempts >= p_max_attempts THEN
    v_locked_until := v_now + p_lockout_interval;
  END IF;

  UPDATE cvt_admin_attempts
  SET attempts = v_new_attempts,
      locked_until = v_locked_until,
      updated_at = v_now
  WHERE ip = p_ip;

  IF v_locked_until IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, v_new_attempts, v_locked_until, 
      CEIL(EXTRACT(EPOCH FROM p_lockout_interval))::INT;
  ELSE
    RETURN QUERY SELECT TRUE, v_new_attempts, NULL::TIMESTAMP WITH TIME ZONE, 0;
  END IF;
END;
$$;
```
