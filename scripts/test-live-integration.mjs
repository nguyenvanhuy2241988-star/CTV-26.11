import assert from 'assert';

async function runLiveIntegration() {
  console.log('====================================================================');
  console.log('KIỂM THỬ TÍCH HỢP HẠ TẦNG THẬT (LIVE NETWORK FETCH & REAL GATEWAY)');
  console.log('====================================================================\n');

  let hasError = false;
  let isBlocked = false;
  const blockedReasons = [];

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
      isBlocked = true;
      const reason = `FormSubmit yêu cầu kích hoạt form: "${resJson.message}". Cần mở hộp thư lyhu.vn@gmail.com và nhấn liên kết "Activate Form" để mở thông luồng email.`;
      blockedReasons.push(reason);
      console.log(`  -> [BLOCKED]: ${reason}\n`);
    } else {
      isBlocked = true;
      const reason = 'Cổng FormSubmit phản hồi không chuẩn JSON hoặc rỗng, trạng thái chưa xác nhận (gateway_unconfirmed).';
      blockedReasons.push(reason);
      console.log(`  -> [BLOCKED]: ${reason}\n`);
    }
  } catch (err) {
    hasError = true;
    console.error('  -> [FAIL]: Lỗi kết nối mạng tới FormSubmit:', err.message, '\n');
  }

  // 2. Kiểm thử Supabase Database Thật (Full CRUD & Atomic Concurrency RPC)
  console.log('[LIVE TEST 2] Kiểm tra kết nối Supabase PostgreSQL THẬT (CRUD + Concurrency RPC):');
  const sbUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sbUrl || !sbKey) {
    isBlocked = true;
    const reason = 'Biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình. Theo nguyên tắc fail-closed, hệ thống từ chối lưu tạm và chặn 503.';
    blockedReasons.push(reason);
    console.log(`  -> [BLOCKED]: ${reason}`);
    console.log('     Để chạy kiểm thử CRUD và RPC thật trên Supabase, khởi chạy với:');
    console.log('     $env:SUPABASE_URL="https://...supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."; node scripts/test-live-integration.mjs\n');
  } else {
    const url = sbUrl.replace(/\/$/, '');
    const headers = {
      'apikey': sbKey,
      'Authorization': `Bearer ${sbKey}`,
      'Content-Type': 'application/json'
    };

    // Kiểm tra sự tồn tại của bảng trước khi chạy CRUD
    try {
      const probeRes = await fetch(`${url}/rest/v1/cvt_requests?limit=1`, { headers });
      if (!probeRes.ok) {
        const probeErr = await probeRes.text();
        isBlocked = true;
        const reason = `Bảng cvt_requests chưa tồn tại trên Supabase (Status: ${probeRes.status}). Cần chạy mã SQL khởi tạo trong docs/EDITING-AND-DEPLOYMENT.md trên SQL Editor của Supabase.`;
        blockedReasons.push(reason);
        console.log(`  -> [BLOCKED]: ${reason}`);
        console.log(`     Chi tiết từ Supabase: ${probeErr}\n`);
      } else {
        // Bảng đã sẵn sàng, tiến hành kịch bản Full CRUD thật
        const testLeadId = 'TEST-CVT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const testRequestKey = 'KEY-' + Math.random().toString(36).substring(2, 12);
        const testIp = '192.0.2.' + Math.floor(Math.random() * 250 + 1);

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
        console.log(`  [2E] Kiểm thử RPC đồng thời trên IP mới (${testIp}) để chứng minh ON CONFLICT, Row Lock & Counter = 2...`);
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

        // BẮT BUỘC: Đọc lại bản ghi để xác nhận bộ đếm cuối bằng chính xác 2!
        const verifyAttemptRes = await fetch(`${url}/rest/v1/cvt_admin_attempts?ip=eq.${encodeURIComponent(testIp)}`, { headers });
        const verifyAttemptRows = await verifyAttemptRes.json();
        assert.strictEqual(verifyAttemptRows.length, 1, 'Bản ghi IP phải tồn tại');
        assert.strictEqual(verifyAttemptRows[0].attempts, 2, 'BẮT BUỘC: Bộ đếm attempts cuối cùng phải bằng chính xác 2!');
        console.log('     -> Xác nhận thành công: Cả 2 request đồng thời trả về 200 và bộ đếm cuối bằng chính xác 2!');

        // Step F: Dọn dẹp bản ghi kiểm thử
        console.log('  [2F] Dọn dẹp bản ghi kiểm thử...');
        await fetch(`${url}/rest/v1/cvt_requests?id=eq.${testLeadId}`, { method: 'DELETE', headers });
        await fetch(`${url}/rest/v1/cvt_admin_attempts?ip=eq.${encodeURIComponent(testIp)}`, { method: 'DELETE', headers });
        console.log('     -> Đã dọn dẹp sạch bản ghi kiểm thử trên Supabase.\n');

        console.log('  -> PASS 100%: KIỂM THỬ TÍCH HỢP TOÀN TRÌNH TRÊN SUPABASE THẬT THÀNH CÔNG!\n');
      }
    } catch (dbErr) {
      hasError = true;
      console.error('  -> [FAIL TRÊN SUPABASE THẬT]:', dbErr.message, '\n');
    }
  }

  console.log('====================================================================');
  if (hasError) {
    console.log('KẾT QUẢ TỔNG THỂ: FAILED (CÓ LỖI XẢY RA TRONG QUÁ TRÌNH KIỂM THỬ THẬT)');
    console.log('====================================================================\n');
    process.exit(1);
  } else if (isBlocked) {
    console.log('KẾT QUẢ TỔNG THỂ: BLOCKED (CHƯA ĐỦ ĐIỀU KIỆN NGHIỆM THU DO THIẾU HẠ TẦNG THẬT)');
    console.log('CÁC ĐIỂM CẦN HOÀN TẤT TRƯỚC KHI NGHIỆM THU:');
    blockedReasons.forEach((r, idx) => console.log(`  ${idx + 1}. ${r}`));
    console.log('====================================================================\n');
    process.exit(1);
  } else {
    console.log('KẾT QUẢ TỔNG THỂ: PASS 100% (HẠ TẦNG THẬT ĐÃ ĐƯỢC XÁC THỰC TOÀN TRÌNH)');
    console.log('====================================================================\n');
    process.exit(0);
  }
}

runLiveIntegration().catch(err => {
  console.error('Lỗi nghiêm trọng:', err);
  process.exit(1);
});
