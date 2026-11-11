# CVT — Hàng đợi thông báo email

## Tác dụng và phạm vi
- Lưu lead và tác vụ thông báo trong cùng transaction; không có lead thành công nhưng mất tác vụ.
- Form trả thành công sau khi DB lưu, không đợi gateway. Browser không gửi FormSubmit nữa.
- Worker phía server khóa từng tác vụ, dùng claim token chống worker cũ ghi đè kết quả.
- Quản trị hiển thị trạng thái email độc lập với trạng thái xử lý khách hàng.
- Không gửi lại phiếu lịch sử, bao gồm CVT-724E32A2 và CVT-8B6E8231.

## Trạng thái
pending: chờ; processing: đang xử lý; retry: chờ thử lại;
gateway_accepted: FormSubmit xác nhận nhận yêu cầu, KHÔNG xác nhận thư đến inbox;
activation_required: cần kích hoạt; unconfirmed: không rõ kết quả, cần kiểm tra;
failed: gateway từ chối hoặc đã hết lượt thử.
Không có trạng thái delivered vì chưa có bằng chứng giao thư/webhook xác thực.

## Retry bảo thủ với FormSubmit
- Chỉ tự retry khi gateway trả HTTP 429 rõ ràng: 1, 2, 4, 8, 16 phút, tối đa 6 lần thử.
- Timeout, HTTP 5xx, JSON lạ, worker chết: unconfirmed và KHÔNG tự phát lại vì có thể dịch vụ đã nhận thư.
- Vì FormSubmit không có idempotency key được tích hợp ở đây, không hứa exactly-once hay đến inbox 100%.
- Muốn retry tự động cả timeout mà vẫn hạn chế trùng ở phía dịch vụ, chuyển sang nhà cung cấp có idempotency key và webhook có chữ ký ở đợt tiếp theo.
- Chưa thêm nút gửi lại thủ công để tránh nhân viên phát thư trùng khi chưa đối chiếu hộp thư.

## Áp dụng
Base commit: 219435b91bf0a0e7831c10e84c37b02f3df35b02.
1. Tạo nhánh riêng từ main mới nhất; áp patch, giải quyết xung đột nếu Anti đã sửa cùng file.
2. Chạy docs/sql/cvt-email-queue.sql trên đúng Supabase CVT. Đây là SQL bổ sung, không backfill lead cũ; áp trước code.
3. Đặt CRON_SECRET dài ngẫu nhiên qua Vercel Dashboard (không commit). Giữ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ở server.
4. vercel.json thêm lịch */5 * * * * tại /api/cron/email-queue. Kiểm tra gói hosting có hỗ trợ tần suất này; nếu không, dùng scheduler đã được cấp quyền gọi endpoint với Authorization: Bearer CRON_SECRET. Không tự nâng gói trả phí.
5. Preview không được chạy worker trên DB production. CVT_EMAIL_QUEUE_TEST=1 chỉ dùng với DB test tách biệt. Không ghi lead test vào DB production qua Preview vì worker production sẽ xử lý chung nếu cùng DB.
6. Chạy node --test tests/email-queue.test.mjs và npm run build.
7. Duyệt PR/Preview rồi deploy production. Worker xử lý tối đa 2 tác vụ mỗi lần chạy (24/giờ với lịch 5 phút); tăng công suất nếu có backlog, đồng thời giữ timeout dưới maxDuration.
8. Gửi một phiếu test có nhãn rõ ở production sau triển khai; xác nhận 1 outbox row, trạng thái, email thực nhận và admin hiển thị đúng. Kiểm tra log cron không chứa dữ liệu cá nhân.

## Chứng cứ đã thực hiện trong phiên ChatGPT
- Node tests: 6 nhóm PASS, gồm phản hồi gateway, bảo vệ worker, guard Preview, token hoàn tất, form chỉ enqueue, lỗi DB.
- npm run build: PASS, 24 HTML.
- SQL chạy trên PostgreSQL 17 thật của CVT trong BEGIN/ROLLBACK: PASS lưu lead+queue, trùng khóa cùng ID, không claim đôi, token cũ bị từ chối, backoff, lease hết hạn -> unconfirmed, thu hồi quyền anon. ĐÃ ROLLBACK: chưa cài SQL production.
- Chưa kiểm thử concurrency hai connection SQL thực tế, chưa chạy cron hoặc gửi email thật với mã mới.
- Chưa push: GitHub integration trả 403 Resource not accessible by integration khi tạo branch.

## Rollback
Đưa code về 219435b bằng quy trình PR/deploy; tắt lịch worker trước khi quay về luồng cũ để tránh hai đường gửi cùng hoạt động. Giữ outbox để đối chiếu và không tự xóa dữ liệu. Không tái enqueue phiếu đã có email.
