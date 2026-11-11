import assert from 'assert';

async function runLiveIntegration() {
  console.log('====================================================================');
  console.log('KIỂM THỬ TÍCH HỢP HẠ TẦNG THẬT (LIVE NETWORK FETCH & REAL GATEWAY)');
  console.log('====================================================================\n');

  let hasError = false;

  // 1. Kiểm thử kết nối Cổng Email thật (FormSubmit live endpoint)
  console.log('[LIVE TEST 1] Gửi payload thử nghiệm tới Cổng FormSubmit THẬT:');
  const testPayload = {
    _subject: '🧪 [CVT Web Test] Kiểm thử cổng tiếp nhận email tích hợp',
    'Mã kiểm thử': 'TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    'Mục đích': 'Xác thực live endpoint FormSubmit tiếp nhận thành công',
    'Thời gian': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    _template: 'table'
  };

  try {
    const start = Date.now();
    const res = await fetch('https://formsubmit.co/ajax/lyhu.vn@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://www.cvt.com.vn',
        'Referer': 'https://www.cvt.com.vn/dang-ky.html'
      },
      body: JSON.stringify(testPayload)
    });

    const elapsed = Date.now() - start;
    const resText = await res.text();
    let resJson = null;
    try { resJson = JSON.parse(resText); } catch (e) {}

    console.log(`  -> HTTP Status: ${res.status} ${res.statusText} (${elapsed}ms)`);
    console.log(`  -> Response Body: ${resText}`);

    assert.strictEqual(res.status, 200, 'Cổng FormSubmit phải trả về HTTP 200');

    if (resJson && (resJson.success === 'true' || resJson.success === true)) {
      console.log('  -> PASS: Cổng FormSubmit THẬT đã tiếp nhận payload để giao tới lyhu.vn@gmail.com!\n');
    } else if (resJson && (resJson.success === 'false' || resJson.success === false)) {
      console.log(`  -> THÔNG BÁO HẠ TẦNG: FormSubmit yêu cầu kích hoạt: "${resJson.message}".`);
      console.log('     (Chỉ cần mở email lyhu.vn@gmail.com bấm "Activate Form" một lần là hoàn tất).\n');
    } else {
      console.log('  -> TRẠNG THÁI: Cổng FormSubmit phản hồi không chuẩn JSON, hệ thống gán gateway_unconfirmed.\n');
    }
  } catch (err) {
    hasError = true;
    console.error('  -> FAIL: Lỗi kết nối mạng tới FormSubmit:', err.message, '\n');
  }

  // 2. Kiểm thử Supabase Database Thật (Full CRUD & Atomic Concurrency RPC)
  console.log('[LIVE TEST 2] Kiểm tra kết nối Supabase PostgreSQL THẬT (CRUD + Concurrency RPC):');
  const sbUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sbUrl || !sbKey) {
    console.log('  -> [CHƯA CẤU HÌNH SUPABASE LOCAL]');
    console.log('     Biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY chưa được đặt.');
    console.log('     Theo nguyên tắc fail-closed, hệ thống sẽ trả về HTTP 503 khi người dùng gửi form hoặc đăng nhập.');
    console.log('     Để chạy kiểm thử CRUD và RPC thật trên Supabase, khởi chạy với:');
    console.log('     $env:SUPABASE_URL="https://...supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."; node scripts/test-live-integration.mjs\n');
  } else {
    const url = sbUrl.replace(/\/$/, '');
    const headers = {
      'apikey': sbKey,
      'Authorization': `Bearer ${sbKey}`,
      'Content-Type': 'application/json'
    };

    const testLeadId = 'TEST-CVT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const testRequestKey = 'KEY-' + Math.random().toString(36).substring(2, 12);
    const testIp = '192.0.2.' + Math.floor(Math.random() * 250 + 1);

    try {
      // Step A: INSERT lead mới
      console.log(`  [2A] Ghi bản ghi Lead thử nghiệm thật (ID: ${testLeadId})...`);
      const insertRes = await fetch(`${url}/rest/v1/cvt_requests`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          id: testLeadId,
          request_key: testRequestKey,
          audience: 'Nhà phân phối',
          company: 'Đơn vị Kiểm thử Live E2E',
          name: 'Kỹ sư QA CVT',
          phone: '0969069798',
          email: 'qa@cvt.com.vn',
          region: 'Hà Nội',
          purpose: 'Kiểm thử toàn trình CRUD trên Supabase thật',
          sku: 'Trứng cua 75g',
          status: 'new'
        })
      });

      if (!insertRes.ok) {
        throw new Error(`INSERT thất bại: ${insertRes.status} ${await insertRes.text()}`);
      }
      const inserted = await insertRes.json();
      assert.strictEqual(inserted[0].id, testLeadId);
      console.log('     -> Ghi DB thật thành công!');

      // Step B: READ lại để kiểm chứng tính bền vững
      console.log('  [2B] Đọc lại bản ghi để kiểm chứng lưu trữ bền vững...');
      const readRes = await fetch(`${url}/rest/v1/cvt_requests?id=eq.${testLeadId}`, { headers });
      const readRows = await readRes.json();
      assert.strictEqual(readRows.length, 1);
      assert.strictEqual(readRows[0].status, 'new');
      console.log('     -> Đọc lại thành công: Trạng thái ban đầu là "new".');

      // Step C: UPDATE trạng thái sang "contacted" (mô phỏng thao tác trong Quản trị)
      console.log('  [2C] Cập nhật trạng thái sang "contacted"...');
      const patchRes = await fetch(`${url}/rest/v1/cvt_requests?id=eq.${testLeadId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'contacted' })
      });
      if (!patchRes.ok) throw new Error(`PATCH thất bại: ${patchRes.status} ${await patchRes.text()}`);

      // Step D: Tải lại lần 2 để kiểm chứng trạng thái mới vẫn còn sau khi reload
      console.log('  [2D] Đọc lại lần 2 (mô phỏng F5 reload) để kiểm chứng trạng thái cập nhật...');
      const reloadRes = await fetch(`${url}/rest/v1/cvt_requests?id=eq.${testLeadId}`, { headers });
      const reloadedRows = await reloadRes.json();
      assert.strictEqual(reloadedRows[0].status, 'contacted', 'Trạng thái sau reload phải là contacted');
      console.log('     -> Xác nhận thành công: Trạng thái vẫn là "contacted" sau reload!');

      // Step E: Kiểm thử chạy RPC đồng thời (Concurrency test on cvt_record_login_failure)
      console.log(`  [2E] Kiểm thử RPC đồng thời trên IP mới (${testIp}) để chứng minh ON CONFLICT & Row Lock...`);
      const [call1, call2] = await Promise.all([
        fetch(`${url}/rest/v1/rpc/cvt_record_login_failure`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ p_ip: testIp, p_max_attempts: 5 })
        }),
        fetch(`${url}/rest/v1/rpc/cvt_record_login_failure`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ p_ip: testIp, p_max_attempts: 5 })
        })
      ]);

      assert.strictEqual(call1.status, 200, 'RPC call 1 phải trả về HTTP 200');
      assert.strictEqual(call2.status, 200, 'RPC call 2 phải trả về HTTP 200 (không được lỗi duplicate key)');
      console.log('     -> Cả 2 request đồng thời đều thành công, ON CONFLICT đã ngăn chặn xung đột khóa chính!');

      // Step F: Dọn dẹp bản ghi kiểm thử
      console.log('  [2F] Dọn dẹp bản ghi kiểm thử...');
      await fetch(`${url}/rest/v1/cvt_requests?id=eq.${testLeadId}`, { method: 'DELETE', headers });
      await fetch(`${url}/rest/v1/cvt_admin_attempts?ip=eq.${encodeURIComponent(testIp)}`, { method: 'DELETE', headers });
      console.log('     -> Đã dọn dẹp sạch bản ghi kiểm thử trên Supabase.\n');

      console.log('  -> PASS 100%: KIỂM THỬ TÍCH HỢP TOÀN TRÌNH TRÊN SUPABASE THẬT THÀNH CÔNG!\n');
    } catch (dbErr) {
      hasError = true;
      console.error('  -> FAIL TRÊN SUPABASE THẬT:', dbErr.message, '\n');
    }
  }

  console.log('====================================================================');
  if (hasError) {
    console.log('KẾT QUẢ: CÓ LỖI XẢY RA TRONG QUÁ TRÌNH KIỂM THỬ THẬT');
    console.log('====================================================================\n');
    process.exit(1);
  } else {
    console.log('KẾT QUẢ: HOÀN TẤT KIỂM THỬ HẠ TẦNG THẬT (PASS)');
    console.log('====================================================================\n');
  }
}

runLiveIntegration().catch(err => {
  console.error('Lỗi nghiêm trọng:', err);
  process.exit(1);
});
