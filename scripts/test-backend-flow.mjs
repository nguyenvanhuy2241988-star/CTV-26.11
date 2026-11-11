import assert from 'assert';
import handlerRequests from '../api/requests.js';
import handlerLogin from '../api/admin/login.js';
import handlerAdmin from '../api/admin/index.js';
import { createSessionToken } from '../api/admin/_auth.js';

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.data = obj; return this; }
  };
  return res;
}

// Global fetch mocking
const originalFetch = global.fetch;

class MockPostgrestDB {
  constructor() {
    this.table = new Map();
    this.failMode = false;
  }

  fetchHandler = async (url, options = {}) => {
    const urlStr = String(url);

    // FormSubmit email notification mock
    if (urlStr.includes('formsubmit.co')) {
      return {
        ok: true,
        status: 200,
        text: async () => '{"success":true}',
        json: async () => ({ success: true })
      };
    }

    if (this.failMode) {
      return {
        ok: false,
        status: 503,
        text: async () => 'Database connection timeout'
      };
    }

    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    if (urlStr.includes('/rest/v1/cvt_requests')) {
      // Query by request_key
      if (urlStr.includes('request_key=eq.')) {
        const match = urlStr.match(/request_key=eq\.([^&]+)/);
        const key = decodeURIComponent(match ? match[1] : '');
        const found = Array.from(this.table.values()).find(r => r.request_key === key);
        return {
          ok: true,
          status: 200,
          json: async () => (found ? [{ id: found.id, status: found.status }] : [])
        };
      }

      // Query list
      if (method === 'GET') {
        const list = Array.from(this.table.values());
        return {
          ok: true,
          status: 200,
          json: async () => list
        };
      }

      // Insert
      if (method === 'POST') {
        if (this.table.has(body.request_key)) {
          // Unique key conflict (Postgres 23505 / HTTP 409)
          return {
            ok: false,
            status: 409,
            text: async () => '{"code":"23505","message":"duplicate key value violates unique constraint \"cvt_requests_request_key_key\""}'
          };
        }
        this.table.set(body.request_key, body);
        return {
          ok: true,
          status: 201,
          json: async () => [body]
        };
      }

      // Update status
      if (method === 'PATCH') {
        const match = urlStr.match(/id=eq\.([^&]+)/);
        const id = decodeURIComponent(match ? match[1] : '');
        for (const record of this.table.values()) {
          if (record.id === id) {
            record.status = body.status;
            break;
          }
        }
        return { ok: true, status: 200, json: async () => ({}) };
      }
    }

    if (urlStr.includes('/rest/v1/cvt_entries')) {
      return { ok: true, status: 200, json: async () => [] };
    }

    return { ok: true, status: 200, json: async () => ({}) };
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('BẮT ĐẦU KIỂM THỬ BACKEND CVT (DB, EMAIL, IDEMPOTENCY, AUTH)');
  console.log('====================================================\n');

  // ----------------------------------------------------------------
  // TEST 1: Khi thiếu DB hoặc DB lỗi, PHẢI trả về lỗi 503 (không lưu tạm bộ nhớ)
  // ----------------------------------------------------------------
  console.log('[TEST 1] Kiểm tra tính nghiêm ngặt cơ sở dữ liệu:');
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const reqWithoutDb = {
    method: 'POST',
    headers: {},
    body: {
      audience: 'Nhà phân phối',
      purpose: 'Danh mục & báo giá',
      company: 'Công ty Test A',
      name: 'Nguyễn Văn A',
      phone: '0969069798',
      region: 'Hà Nội',
      consent: true,
      requestKey: 'TEST-NO-DB-KEY-1'
    }
  };
  const resWithoutDb = mockRes();
  await handlerRequests(reqWithoutDb, resWithoutDb);

  assert.strictEqual(resWithoutDb.statusCode, 503, 'Phải trả về 503 khi chưa có DB');
  assert.strictEqual(resWithoutDb.data.error, 'database_unavailable', 'Error code phải là database_unavailable');
  console.log('  -> PASS: Không có DB -> Chặn ngay lập tức với HTTP 503, không lưu tạm memory giả vờ thành công!\n');

  // Setup Mock Database for remaining tests
  const mockDb = new MockPostgrestDB();
  global.fetch = mockDb.fetchHandler;
  process.env.SUPABASE_URL = 'https://mock-supabase.cvt.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
  process.env.CVT_ADMIN_PASSWORD = 'SecretAdminPassword123!';

  // ----------------------------------------------------------------
  // TEST 2: Lưu dữ liệu khách hàng thật & Email thông báo được await xác nhận
  // ----------------------------------------------------------------
  console.log('[TEST 2] Lưu dữ liệu khách hàng bền vững & Xác nhận gửi email:');
  const validReq = {
    method: 'POST',
    headers: {},
    body: {
      audience: 'Nhà phân phối',
      purpose: 'Danh mục & báo giá',
      company: 'NPP Đông Bắc',
      name: 'Trần Văn B',
      phone: '0988123456',
      email: 'dongbac@gmail.com',
      region: 'Quảng Ninh',
      sku: 'Trứng cua 75g',
      note: 'Quan tâm phân phối độc quyền tỉnh',
      consent: true,
      requestKey: 'REQ-KEY-VALID-001'
    }
  };
  const validRes = mockRes();
  await handlerRequests(validReq, validRes);

  assert.strictEqual(validRes.statusCode, 201, 'Lưu thành công phải trả về HTTP 201');
  assert.strictEqual(validRes.data.ok, true);
  assert.ok(validRes.data.id.startsWith('CVT-'), 'Mã yêu cầu phải có tiền tố CVT-');
  assert.strictEqual(validRes.data.emailStatus, 'delivered', 'Email phải được await xác nhận gửi thành công');
  assert.strictEqual(mockDb.table.size, 1, 'Bản ghi phải được lưu thực sự vào DB');
  console.log(`  -> PASS: Đã lưu thật vào DB (Mã: ${validRes.data.id}), email đã được await và xác nhận: ${validRes.data.emailStatus}!\n`);

  // ----------------------------------------------------------------
  // TEST 3: Chống gửi trùng đồng thời (Race Condition Idempotency)
  // ----------------------------------------------------------------
  console.log('[TEST 3] Chống gửi trùng lặp & Race Condition:');
  const sharedKey = 'CONCURRENT-RACE-KEY-999';
  const concurrentReq1 = {
    method: 'POST',
    headers: {},
    body: {
      audience: 'Khách sỉ & cửa hàng',
      purpose: 'Tư vấn hợp tác',
      company: 'Cửa hàng Minh Khai',
      name: 'Lê Văn C',
      phone: '0912345678',
      region: 'Hải Phòng',
      consent: true,
      requestKey: sharedKey
    }
  };
  const concurrentReq2 = { ...concurrentReq1 };

  // Chạy đồng thời cả 2 request
  const res1 = mockRes();
  const res2 = mockRes();
  await Promise.all([
    handlerRequests(concurrentReq1, res1),
    handlerRequests(concurrentReq2, res2)
  ]);

  const id1 = res1.data.id;
  const id2 = res2.data.id;

  assert.ok(id1, 'Request 1 phải có ID');
  assert.ok(id2, 'Request 2 phải có ID');
  assert.strictEqual(id1, id2, `Cả 2 yêu cầu đồng thời phải trả về CÙNG MỘT MÃ ID thực tế lưu trong DB (id1=${id1}, id2=${id2})`);
  assert.strictEqual(mockDb.table.size, 2, 'DB chỉ được lưu đúng 1 bản ghi mới cho sharedKey');
  console.log(`  -> PASS: Cả 2 request gửi đồng thời đều nhận được chung mã đã lưu: ${id1}, không bị lệch ID!\n`);

  // ----------------------------------------------------------------
  // TEST 4: Đăng nhập quản trị — Giới hạn thử mật khẩu (Brute Force Protection)
  // ----------------------------------------------------------------
  console.log('[TEST 4] Giới hạn thử mật khẩu quản trị (Rate Limiting):');
  const attackerIp = '123.45.67.89';

  for (let attempt = 1; attempt <= 5; attempt++) {
    const wrongRes = mockRes();
    await handlerLogin({
      method: 'POST',
      headers: { 'x-forwarded-for': attackerIp },
      body: { password: 'WrongPassword!' }
    }, wrongRes);

    assert.strictEqual(wrongRes.statusCode, 401, `Lần thử ${attempt} phải trả về 401`);
  }

  // Lần thử thứ 6: phải bị khóa với HTTP 429 Too Many Requests
  const lockedRes = mockRes();
  await handlerLogin({
    method: 'POST',
    headers: { 'x-forwarded-for': attackerIp },
    body: { password: 'SecretAdminPassword123!' } // Dù đúng pass cũng bị lock
  }, lockedRes);

  assert.strictEqual(lockedRes.statusCode, 429, 'Lần thứ 6 phải bị khóa với HTTP 429');
  assert.strictEqual(lockedRes.data.error, 'rate_limited');
  console.log('  -> PASS: Sau 5 lần nhập sai, IP bị khóa ngay với HTTP 429 Too Many Requests!\n');

  // Thử từ IP hợp lệ khác với mật khẩu đúng
  const legitRes = mockRes();
  await handlerLogin({
    method: 'POST',
    headers: { 'x-forwarded-for': '192.168.1.1' },
    body: { password: 'SecretAdminPassword123!' }
  }, legitRes);

  assert.strictEqual(legitRes.statusCode, 200, 'Mật khẩu đúng từ IP hợp lệ phải 200');
  assert.ok(legitRes.headers['Set-Cookie'].includes('cvt_admin_session='), 'Phải cấp cookie HttpOnly');
  console.log('  -> PASS: Đăng nhập thành công cấp cookie bảo mật HttpOnly!\n');

  // ----------------------------------------------------------------
  // TEST 5: Bảo vệ API Quản trị bằng Cookie Session phía Server
  // ----------------------------------------------------------------
  console.log('[TEST 5] Kiểm tra xác thực quyền truy cập `/api/admin`:');
  // Không có cookie hoặc header giả của client
  const unauthorizedRes = mockRes();
  await handlerAdmin({
    method: 'GET',
    headers: { 'oai-authenticated-user': 'spoofed_admin' } // Header client giả mạo
  }, unauthorizedRes);
  assert.strictEqual(unauthorizedRes.statusCode, 401, 'Tuyệt đối không tin header client, phải trả về 401');

  // Có token phiên hợp lệ
  const sessionToken = createSessionToken('admin');
  const authorizedRes = mockRes();
  await handlerAdmin({
    method: 'GET',
    headers: { cookie: `cvt_admin_session=${sessionToken}` }
  }, authorizedRes);
  assert.strictEqual(authorizedRes.statusCode, 200, 'Có session token hợp lệ phải truy cập được');
  assert.ok(Array.isArray(authorizedRes.data.requests), 'Phải trả về danh sách yêu cầu');
  assert.strictEqual(authorizedRes.data.requests.length, 2, 'Phải có 2 yêu cầu đã lưu');
  console.log('  -> PASS: Từ chối header client giả mạo, chỉ chấp nhận phiên token HMAC đã ký!\n');

  console.log('====================================================');
  console.log('TẤT CẢ 5 BÀI TEST BACKEND ĐÃ VƯỢT QUA 100%!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
