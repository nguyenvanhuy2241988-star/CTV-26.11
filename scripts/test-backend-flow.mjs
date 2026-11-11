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

class MockSupabaseService {
  constructor() {
    this.requestsTable = new Map();
    this.adminAttemptsTable = new Map();
    this.entriesTable = new Map();
    this.emailCalls = [];
  }

  fetchHandler = async (url, options = {}) => {
    const urlStr = String(url);
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;

    // FormSubmit mock
    if (urlStr.includes('formsubmit.co')) {
      this.emailCalls.push({ url: urlStr, body });
      return {
        ok: true,
        status: 200,
        text: async () => '{"success":"true"}',
        json: async () => ({ success: true })
      };
    }

    // 1. Table cvt_requests
    if (urlStr.includes('/rest/v1/cvt_requests')) {
      if (urlStr.includes('request_key=eq.')) {
        const match = urlStr.match(/request_key=eq\.([^&]+)/);
        const key = decodeURIComponent(match ? match[1] : '');
        const found = Array.from(this.requestsTable.values()).find(r => r.request_key === key);
        return {
          ok: true,
          status: 200,
          json: async () => (found ? [{ id: found.id, status: found.status }] : [])
        };
      }

      if (method === 'GET') {
        return { ok: true, status: 200, json: async () => Array.from(this.requestsTable.values()) };
      }

      if (method === 'POST') {
        if (this.requestsTable.has(body.request_key)) {
          return {
            ok: false,
            status: 409,
            text: async () => '{"code":"23505","message":"duplicate key violates cvt_requests_request_key_key"}'
          };
        }
        this.requestsTable.set(body.request_key, body);
        return { ok: true, status: 201, json: async () => [body] };
      }

      if (method === 'PATCH') {
        const match = urlStr.match(/id=eq\.([^&]+)/);
        const id = decodeURIComponent(match ? match[1] : '');
        for (const record of this.requestsTable.values()) {
          if (record.id === id) {
            record.status = body.status;
            break;
          }
        }
        return { ok: true, status: 200, json: async () => ({}) };
      }
    }

    // 2. Atomic RPC cvt_check_login_rate_limit
    if (urlStr.includes('/rest/v1/rpc/cvt_check_login_rate_limit')) {
      const ip = body.p_ip;
      const rec = this.adminAttemptsTable.get(ip);
      const now = Date.now();
      if (!rec) {
        return { ok: true, status: 200, json: async () => [{ allowed: true, current_attempts: 0, remaining_seconds: 0 }] };
      }
      if (rec.locked_until && rec.locked_until > now) {
        return { ok: true, status: 200, json: async () => [{ allowed: false, current_attempts: rec.attempts, remaining_seconds: Math.ceil((rec.locked_until - now) / 1000) }] };
      }
      return { ok: true, status: 200, json: async () => [{ allowed: true, current_attempts: rec.attempts, remaining_seconds: 0 }] };
    }

    // 3. Atomic RPC cvt_record_login_failure (Simulates PostgreSQL SELECT ... FOR UPDATE)
    if (urlStr.includes('/rest/v1/rpc/cvt_record_login_failure')) {
      const ip = body.p_ip;
      const maxAttempts = body.p_max_attempts || 5;
      const now = Date.now();
      const rec = this.adminAttemptsTable.get(ip);

      if (!rec) {
        const newRec = { ip, attempts: 1, first_attempt: now, locked_until: null };
        this.adminAttemptsTable.set(ip, newRec);
        return { ok: true, status: 200, json: async () => [{ allowed: true, current_attempts: 1, remaining_seconds: 0 }] };
      }

      // Check if 15-minute window expired -> reset to 1
      if (now - rec.first_attempt > 15 * 60 * 1000) {
        rec.attempts = 1;
        rec.first_attempt = now;
        rec.locked_until = null;
        this.adminAttemptsTable.set(ip, rec);
        return { ok: true, status: 200, json: async () => [{ allowed: true, current_attempts: 1, remaining_seconds: 0 }] };
      }

      rec.attempts += 1;
      let isAllowed = true;
      let remainingSec = 0;
      if (rec.attempts >= maxAttempts) {
        rec.locked_until = now + 15 * 60 * 1000;
        remainingSec = 900;
        isAllowed = false; // Lock immediately on 5th failure
      }
      this.adminAttemptsTable.set(ip, rec);
      return { ok: true, status: 200, json: async () => [{ allowed: isAllowed, current_attempts: rec.attempts, remaining_seconds: remainingSec }] };
    }

    // 4. Delete attempts upon successful login
    if (urlStr.includes('/rest/v1/cvt_admin_attempts')) {
      if (method === 'DELETE') {
        const match = urlStr.match(/ip=eq\.([^&]+)/);
        const ip = decodeURIComponent(match ? match[1] : '');
        this.adminAttemptsTable.delete(ip);
        return { ok: true, status: 200, json: async () => ({}) };
      }
    }

    if (urlStr.includes('/rest/v1/cvt_entries')) {
      return { ok: true, status: 200, json: async () => [] };
    }

    return { ok: true, status: 200, json: async () => ({}) };
  };
}

async function runUnitLogicTests() {
  console.log('====================================================================');
  console.log('KIỂM THỬ ĐƠN VỊ & LOGIC NGUYÊN TỬ (ATOMIC RATE LIMIT & DEDUP EMAIL)');
  console.log('====================================================================\n');

  // TEST 1: DB Requirement (No in-memory mask)
  console.log('[TEST 1] Chặn 503 khi chưa có DB, không che giấu lỗi bằng in-memory:');
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  const resNoDb = mockRes();
  await handlerRequests({
    method: 'POST',
    body: {
      audience: 'Nhà phân phối', purpose: 'Danh mục & báo giá',
      company: 'NPP Test', name: 'Nguyễn Test', phone: '0969069798',
      region: 'Hà Nội', consent: true, requestKey: 'K-NO-DB-1'
    }
  }, resNoDb);
  assert.strictEqual(resNoDb.statusCode, 503);
  assert.strictEqual(resNoDb.data.error, 'database_unavailable');

  // Login without DB must also 503
  const resLoginNoDb = mockRes();
  await handlerLogin({ method: 'POST', body: { password: '123' } }, resLoginNoDb);
  assert.strictEqual(resLoginNoDb.statusCode, 503);
  console.log('  -> PASS: Cả requests và login đều chặn 503 khi thiếu cấu hình DB, không dùng fallback memory!\n');

  // Setup mock service for atomic logic verification
  const service = new MockSupabaseService();
  global.fetch = service.fetchHandler;
  process.env.SUPABASE_URL = 'https://supabase.cvt.production.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret-key';
  process.env.CVT_ADMIN_PASSWORD = 'CorrectAdminPassword#2026';

  // TEST 2: Single New Submission -> Saves DB + Gateway Accepted Email
  console.log('[TEST 2] Tiếp nhận yêu cầu mới -> Lưu DB thật + Gateway Accepted Email:');
  const resNew = mockRes();
  await handlerRequests({
    method: 'POST',
    body: {
      audience: 'Nhà phân phối', purpose: 'Danh mục & báo giá',
      company: 'NPP Miền Trung', name: 'Trần Văn Trung', phone: '0987654321',
      email: 'mientrung@cvt.vn', region: 'Đà Nẵng', sku: 'Trứng cua 75g',
      note: 'Muốn đặt hàng phân phối', consent: true, requestKey: 'KEY-ORIGINAL-001'
    }
  }, resNew);

  assert.strictEqual(resNew.statusCode, 201);
  assert.strictEqual(resNew.data.duplicate, false);
  assert.strictEqual(resNew.data.emailDispatch, 'gateway_accepted');
  assert.strictEqual(service.requestsTable.size, 1);
  assert.strictEqual(service.emailCalls.length, 1);
  const originalId = resNew.data.id;
  console.log(`  -> PASS: Bản ghi mới lưu DB (ID: ${originalId}), Email gateway accepted: 1 lần!\n`);

  // TEST 3: Duplicate Submission & Race Condition -> NO DUPLICATE EMAIL
  console.log('[TEST 3] Yêu cầu trùng lặp & Race Condition:');
  const resDup1 = mockRes();
  await handlerRequests({
    method: 'POST',
    body: {
      audience: 'Nhà phân phối', purpose: 'Danh mục & báo giá',
      company: 'NPP Miền Trung', name: 'Trần Văn Trung', phone: '0987654321',
      region: 'Đà Nẵng', consent: true, requestKey: 'KEY-ORIGINAL-001'
    }
  }, resDup1);

  assert.strictEqual(resDup1.statusCode, 200);
  assert.strictEqual(resDup1.data.duplicate, true);
  assert.strictEqual(resDup1.data.id, originalId, 'Phải trả về đúng mã ID của bản ghi ban đầu');
  assert.strictEqual(service.emailCalls.length, 1, 'QUAN TRỌNG: Request trùng KHÔNG ĐƯỢC gửi email lần 2!');
  console.log(`  -> PASS: Request trùng nhận đúng ID: ${resDup1.data.id}, số lượt gửi email vẫn giữ nguyên là 1 (không gửi đúp)!\n`);

  // Concurrent collision race condition test
  const sharedKey = 'CONCURRENT-COLLISION-KEY-2026';
  const reqRace1 = {
    method: 'POST', body: {
      audience: 'Siêu thị & chuỗi bán lẻ', purpose: 'Mẫu thử & hồ sơ sản phẩm',
      company: 'Siêu thị WinMart', name: 'Lê Thu Mua', phone: '0901234567',
      region: 'TP.HCM', consent: true, requestKey: sharedKey
    }
  };
  const reqRace2 = { ...reqRace1 };

  const resRace1 = mockRes();
  const resRace2 = mockRes();
  await Promise.all([
    handlerRequests(reqRace1, resRace1),
    handlerRequests(reqRace2, resRace2)
  ]);

  const raceId1 = resRace1.data.id;
  const raceId2 = resRace2.data.id;
  assert.strictEqual(raceId1, raceId2, 'Cả hai request đồng thời phải chung 1 ID');
  assert.strictEqual(service.emailCalls.length, 2, 'Tổng số email chỉ tăng 1 cho khách mới, request thua cuộc đua không gửi thêm!');
  console.log(`  -> PASS: Race condition xử lý chuẩn xác: Chung ID (${raceId1}), chỉ gửi đúng 1 email cho khách mới!\n`);

  // TEST 4: Atomic Rate Limiting via PostgreSQL RPC
  console.log('[TEST 4] Atomic Distributed Rate Limiting via PostgreSQL RPC:');
  const ip = '203.113.152.1';

  // Attempts 1 to 4: return 401
  for (let i = 1; i <= 4; i++) {
    const r = mockRes();
    await handlerLogin({
      method: 'POST',
      headers: { 'x-forwarded-for': ip },
      body: { password: 'WrongPassword' }
    }, r);
    assert.strictEqual(r.statusCode, 401, `Lần thử ${i} phải trả về 401`);
  }

  // Attempt 5: 5th failure -> locks immediately with HTTP 429
  const r5 = mockRes();
  await handlerLogin({
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
    body: { password: 'WrongPassword' }
  }, r5);
  assert.strictEqual(r5.statusCode, 429, 'Lần thử sai thứ 5 phải khóa tài khoản với HTTP 429');
  assert.strictEqual(r5.data.error, 'rate_limited');

  // Attempt 6: Any subsequent attempt within 15 mins -> blocked at pre-check with HTTP 429
  const r6 = mockRes();
  await handlerLogin({
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
    body: { password: 'CorrectAdminPassword#2026' } // Even with correct password, still locked!
  }, r6);
  assert.strictEqual(r6.statusCode, 429);
  assert.strictEqual(r6.data.error, 'rate_limited');
  console.log('  -> PASS: Sau 5 lần nhập sai, tài khoản bị khóa phân tán và các lần sau đều bị chặn với HTTP 429!\n');

  // Correct login from clean IP
  const rClean = mockRes();
  await handlerLogin({
    method: 'POST',
    headers: { 'x-forwarded-for': '10.0.0.1' },
    body: { password: 'CorrectAdminPassword#2026' }
  }, rClean);
  assert.strictEqual(rClean.statusCode, 200);
  assert.ok(rClean.headers['Set-Cookie'].includes('cvt_admin_session='));
  console.log('  -> PASS: Đăng nhập thành công từ IP sạch, cấp token phiên an toàn!\n');

  console.log('====================================================================');
  console.log('TẤT CẢ CÁC BÀI TEST LOGIC & NGUYÊN TỬ ĐÃ PASS 100%');
  console.log('====================================================================\n');
}

runUnitLogicTests().catch(e => {
  console.error('TEST ERROR:', e);
  process.exit(1);
});
