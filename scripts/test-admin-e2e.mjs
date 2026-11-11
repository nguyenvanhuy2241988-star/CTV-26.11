import assert from 'assert';
import { createSessionToken } from '../api/admin/_auth.js';
import handlerAdmin from '../api/admin/index.js';

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, val) { this.headers[name] = val; return this; },
    json(obj) { this.data = obj; return this; }
  };
  return res;
}

async function testAdminE2E() {
  console.log('====================================================================');
  console.log('KIỂM TRA THAO TÁC QUẢN TRỊ TOÀN TRÌNH TRÊN BẢN GHI CVT-724E32A2');
  console.log('====================================================================\n');

  const sbUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sbUrl || !sbKey) {
    console.log('  -> [BLOCKED]: Cần cung cấp biến SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY để chạy test.');
    process.exit(1);
  }

  process.env.CVT_ADMIN_PASSWORD = process.env.CVT_ADMIN_PASSWORD || 'CvtAdminSecure#2026';

  const token = createSessionToken('admin');
  const cookieHeader = `cvt_admin_session=${token}`;
  const targetId = 'CVT-724E32A2';

  // 1. Giả lập /api/admin GET: Đọc danh sách ban đầu
  console.log(`[BƯỚC 1] Gọi GET /api/admin để tải dữ liệu ban đầu cho phiếu ${targetId}...`);
  const resGet1 = mockRes();
  await handlerAdmin({
    method: 'GET',
    headers: { cookie: cookieHeader }
  }, resGet1);

  assert.strictEqual(resGet1.statusCode, 200, 'GET /api/admin phải trả về 200');
  const found1 = (resGet1.data.requests || []).find(r => r.id === targetId);
  assert.ok(found1, `Phiếu ${targetId} phải tồn tại trong danh sách quản trị`);
  console.log(`  -> Tìm thấy phiếu ${targetId}: Đơn vị="${found1.company}", Trạng thái hiện tại="${found1.status}"\n`);

  // 2. Giả lập thao tác người dùng chọn dropdown đổi sang 'closed'
  console.log(`[BƯỚC 2] Thao tác người dùng: Đổi trạng thái sang "closed" (Đã hoàn tất)...`);
  const resPatch1 = mockRes();
  await handlerAdmin({
    method: 'POST',
    headers: {
      cookie: cookieHeader,
      'content-type': 'application/json'
    },
    body: {
      action: 'status',
      id: targetId,
      status: 'closed'
    }
  }, resPatch1);

  assert.strictEqual(resPatch1.statusCode, 200, 'Cập nhật trạng thái phải trả về 200');
  assert.strictEqual(resPatch1.data.ok, true);
  console.log(`  -> Phản hồi máy chủ: 200 OK (${resPatch1.data.message})\n`);

  // 3. Giả lập F5 reload trang: Gọi lại GET /api/admin
  console.log(`[BƯỚC 3] Giả lập F5 reload trang quản trị (GET /api/admin)...`);
  const resGet2 = mockRes();
  await handlerAdmin({
    method: 'GET',
    headers: { cookie: cookieHeader }
  }, resGet2);

  assert.strictEqual(resGet2.statusCode, 200);
  const found2 = (resGet2.data.requests || []).find(r => r.id === targetId);
  assert.strictEqual(found2.status, 'closed', 'Trạng thái sau khi reload phải là closed');
  console.log(`  -> Xác nhận thành công sau reload: Phiếu ${targetId} có trạng thái là "${found2.status}"!\n`);

  // 4. Đổi lại về 'contacted' (Đã liên hệ) đúng như yêu cầu của người kiểm thử
  console.log(`[BƯỚC 4] Đổi trạng thái về "contacted" (Đã liên hệ)...`);
  const resPatch2 = mockRes();
  await handlerAdmin({
    method: 'POST',
    headers: {
      cookie: cookieHeader,
      'content-type': 'application/json'
    },
    body: {
      action: 'status',
      id: targetId,
      status: 'contacted'
    }
  }, resPatch2);

  assert.strictEqual(resPatch2.statusCode, 200);

  // 5. Kiểm chứng lần cuối sau reload
  const resGet3 = mockRes();
  await handlerAdmin({
    method: 'GET',
    headers: { cookie: cookieHeader }
  }, resGet3);

  const found3 = (resGet3.data.requests || []).find(r => r.id === targetId);
  assert.strictEqual(found3.status, 'contacted', 'Trạng thái cuối cùng phải là contacted');
  console.log(`  -> Xác nhận thành công: Phiếu ${targetId} hiện đã chốt ở trạng thái "${found3.status}"!\n`);

  console.log('====================================================================');
  console.log('KẾT QUẢ: TOÀN BỘ THAO TÁC QUẢN TRỊ ĐỔI TRẠNG THÁI & RELOAD ĐÃ PASS 100%');
  console.log('====================================================================\n');
}

testAdminE2E().catch(err => {
  console.error('LỖI KIỂM THỬ QUẢN TRỊ:', err);
  process.exit(1);
});
