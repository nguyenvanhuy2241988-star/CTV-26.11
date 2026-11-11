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

    // FormSubmit email notification gateway
    if (urlStr.includes('formsubmit.co')) {
      this.emailCalls.push({ url: urlStr, body });
      return {
        ok: true,
        status: 200,
        text: async () => '{"success":true,"message":"FormSubmit accepted"}',
        json: async () => ({ success: true, message: 'FormSubmit accepted' })
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
        return {
          ok: true,
          status: 200,
          json: async () => Array.from(this.requestsTable.values())
        };
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
        return {
          ok: true,
          status: 201,
          json: async () => [body]
        };
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

    // 2. Table cvt_admin_attempts (Persistent shared rate limiting)
    if (urlStr.includes('/rest/v1/cvt_admin_attempts')) {
      if (method === 'GET') {
        const match = urlStr.match(/ip=eq\.([^&]+)/);
        const ip = decodeURIComponent(match ? match[1] : '');
        const rec = this.adminAttemptsTable.get(ip);
        return {
          ok: true,
          status: 200,
          json: async () => (rec ? [rec] : [])
        };
      }

      if (method === 'POST') {
        this.adminAttemptsTable.set(body.ip, body);
        return { ok: true, status: 201, json: async () => [body] };
      }

      if (method === 'PATCH') {
        const match = urlStr.match(/ip=eq\.([^&]+)/);
        const ip = decodeURIComponent(match ? match[1] : '');
        const rec = this.adminAttemptsTable.get(ip) || {};
        Object.assign(rec, body);
        this.adminAttemptsTable.set(ip, rec);
        return { ok: true, status: 200, json: async () => ({}) };
      }

      if (method === 'DELETE') {
        const match = urlStr.match(/ip=eq\.([^&]+)/);
        const ip = decodeURIComponent(match ? match[1] : '');
        this.adminAttemptsTable.delete(ip);
        return { ok: true, status: 200, json: async () => ({}) };
      }
    }

    // 3. Table cvt_entries (CMS)
    if (urlStr.includes('/rest/v1/cvt_entries')) {
      if (method === 'GET') {
        return { ok: true, status: 200, json: async () => Array.from(this.entriesTable.values()) };
      }
      if (method === 'POST') {
        this.entriesTable.set(body.id, body);
        return { ok: true, status: 201, json: async () => [body] };
      }
    }

    return { ok: true, status: 200, json: async () => ({}) };
  };
}

async function runRigorousTests() {
  console.log('====================================================================');
  console.log('CHẠY BỘ KIỂM THỬ TÍCH HỢP NÂNG CAO (DB, DEDUP EMAIL, SHARED RATE LIMIT)');
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
  console.log('  -> PASS: Đã chặn 503 khi thiếu cấu hình DB!\n');

  // Setup mock service
  const service = new MockSupabaseService();
  global.fetch = service.fetchHandler;
  process.env.SUPABASE_URL = 'https://supabase.cvt.production.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret-key';
  process.env.CVT_ADMIN_PASSWORD = 'CorrectAdminPassword#2026';

  // TEST 2: Single New Submission -> Saves DB + Gateway Accepted Email
  console.log('[TEST 2] Tiếp nhận yêu cầu mới -> Lưu DB thật + Gateway Email:');
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
  console.log('  -> Thử nghiệm 2 request cùng KEY-ORIGINAL-001 gửi lại...');
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
  console.log('  -> Thử nghiệm 2 request hoàn toàn đồng thời (Concurrent Race Condition):');
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
  // Email count must only increase by 1 for this new customer!
  assert.strictEqual(service.emailCalls.length, 2, 'Tổng số email chỉ tăng 1 cho khách mới, request thua cuộc đua không gửi thêm!');
  console.log(`  -> PASS: Race condition xử lý chuẩn xác: Chung ID (${raceId1}), chỉ gửi đúng 1 email cho khách mới!\n`);

  // TEST 4: Persistent Distributed Rate Limiting for Admin Login
  console.log('[TEST 4] Persistent Shared Rate Limiting (Lưu DB cvt_admin_attempts):');
  const ip = '203.113.152.1';

  for (let i = 1; i <= 5; i++) {
    const r = mockRes();
    await handlerLogin({
      method: 'POST',
      headers: { 'x-forwarded-for': ip },
      body: { password: 'WrongPassword' }
    }, r);
    assert.strictEqual(r.statusCode, 401);
  }

  // Check persistent DB table
  const attemptRecord = service.adminAttemptsTable.get(ip);
  assert.ok(attemptRecord, 'Lịch sử thử sai phải được lưu vào bảng cvt_admin_attempts của DB');
  assert.strictEqual(attemptRecord.attempts, 5);
  assert.ok(attemptRecord.locked_until, 'locked_until phải được thiết lập trong DB');

  // 6th attempt -> 429
  const r6 = mockRes();
  await handlerLogin({
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
    body: { password: 'CorrectAdminPassword#2026' } // Even with correct password, still locked!
  }, r6);
  assert.strictEqual(r6.statusCode, 429);
  assert.strictEqual(r6.data.error, 'rate_limited');
  console.log('  -> PASS: 5 lần sai -> Lưu trạng thái khóa vào DB, lần 6 bị chặn ngay với HTTP 429 Too Many Requests!\n');

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

  // TEST 5: Quản trị — Xem lead, đổi trạng thái, tải lại vẫn giữ nguyên
  console.log('[TEST 5] Luồng tích hợp Quản trị (Xem lead -> Đổi trạng thái -> Tải lại):');
  const token = createSessionToken('admin');
  const cookieHeader = `cvt_admin_session=${token}`;

  // 1. GET leads
  const rGetLeads = mockRes();
  await handlerAdmin({ method: 'GET', headers: { cookie: cookieHeader } }, rGetLeads);
  assert.strictEqual(rGetLeads.statusCode, 200);
  const leads = rGetLeads.data.requests;
  assert.strictEqual(leads.length, 2);
  const targetLead = leads.find(l => l.id === originalId);
  assert.strictEqual(targetLead.status, 'new');

  // 2. PATCH status -> 'contacted'
  const rUpdateStatus = mockRes();
  await handlerAdmin({
    method: 'POST',
    headers: { cookie: cookieHeader },
    body: { action: 'status', id: originalId, status: 'contacted' }
  }, rUpdateStatus);
  assert.strictEqual(rUpdateStatus.statusCode, 200);

  // 3. GET leads again -> verify status is 'contacted'
  const rReload = mockRes();
  await handlerAdmin({ method: 'GET', headers: { cookie: cookieHeader } }, rReload);
  const reloadedTarget = rReload.data.requests.find(l => l.id === originalId);
  assert.strictEqual(reloadedTarget.status, 'contacted', 'Trạng thái phải được lưu bền vững thành contacted');
  console.log(`  -> PASS: Lead ${originalId} đổi trạng thái 'new' -> 'contacted', tải lại DB vẫn giữ nguyên trạng thái mới!\n`);

  console.log('====================================================================');
  console.log('TOÀN BỘ 5 BÀI TEST TÍCH HỢP ĐÃ VƯỢT QUA 100% HOÀN HẢO!');
  console.log('====================================================================\n');
}

runRigorousTests().catch(e => {
  console.error('TEST ERROR:', e);
  process.exit(1);
});
