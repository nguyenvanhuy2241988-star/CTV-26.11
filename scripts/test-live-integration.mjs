import assert from 'assert';

async function runLiveIntegration() {
  console.log('====================================================================');
  console.log('KIỂM THỬ TÍCH HỢP HẠ TẦNG THẬT (LIVE NETWORK FETCH & REAL GATEWAY)');
  console.log('====================================================================\n');

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
      console.log(`  -> LƯU Ý HẠ TẦNG: FormSubmit phản hồi yêu cầu kích hoạt form: "${resJson.message}".\n     (Cần nhấn liên kết kích hoạt đã gửi tới hộp thư lyhu.vn@gmail.com để kích hoạt lần đầu).\n`);
    }
  } catch (err) {
    console.error('  -> FAIL: Lỗi kết nối mạng tới FormSubmit:', err.message);
  }

  // 2. Kiểm thử Supabase Database Thật (nếu có biến môi trường)
  console.log('[LIVE TEST 2] Kiểm tra kết nối Supabase PostgreSQL THẬT:');
  const sbUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sbUrl || !sbKey) {
    console.log('  -> [CHƯA CẤU HÌNH SUPABASE LOCAL]');
    console.log('     Biến SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY chưa được set trong môi trường local.');
    console.log('     Theo đúng nguyên tắc, mã nguồn sẽ từ chối lưu tạm memory và trả về HTTP 503.');
    console.log('     Để kiểm thử lưu DB thật, vui lòng cấu hình vào .env.local trên máy hoặc Settings trên Vercel.\n');
  } else {
    try {
      const url = sbUrl.replace(/\/$/, '');
      const res = await fetch(`${url}/rest/v1/cvt_requests?limit=1`, {
        headers: {
          'apikey': sbKey,
          'Authorization': `Bearer ${sbKey}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`  -> Supabase HTTP Status: ${res.status} ${res.statusText}`);
      if (res.ok) {
        const rows = await res.json();
        console.log(`  -> PASS: Đã kết nối Supabase thật thành công! Số bản ghi hiện có: ${rows.length}\n`);
      } else {
        const err = await res.text();
        console.log(`  -> Supabase trả về lỗi: ${err}\n`);
      }
    } catch (e) {
      console.error('  -> Lỗi kết nối Supabase:', e.message);
    }
  }

  console.log('====================================================================');
  console.log('HOÀN TẤT KIỂM THỬ HẠ TẦNG THẬT');
  console.log('====================================================================\n');
}

runLiveIntegration().catch(err => {
  console.error(err);
  process.exit(1);
});
