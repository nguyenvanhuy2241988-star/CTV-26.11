import crypto from 'crypto';
import { findRequestByKey, insertRequest } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Chỉ chấp nhận phương thức POST' });
  }

  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (raw.length > 15000) {
      return res.status(413).json({ error: 'Nội dung yêu cầu quá dài.' });
    }

    const b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // 1. Honeypot anti-bot check
    if (b.website) {
      return res.status(400).json({ error: 'Yêu cầu không hợp lệ.' });
    }

    // 2. Consent check
    if (b.consent !== true) {
      return res.status(400).json({ error: 'Vui lòng xác nhận đồng ý để LYHU liên hệ xử lý yêu cầu.' });
    }

    // 3. Extract & sanitize fields
    const text = (k, max = 300) => typeof b[k] === 'string' ? b[k].trim().slice(0, max) : '';
    const audience = text('audience', 100);
    const purpose = text('purpose', 100);
    const company = text('company', 180);
    const name = text('name', 120);
    const phone = text('phone', 30);
    const email = text('email', 180);
    const region = text('region', 180);
    const sku = text('sku', 300);
    const note = text('note', 2000);
    const key = text('requestKey', 120) || text('requestId', 120);

    const validAudiences = ['Nhà phân phối', 'Siêu thị & chuỗi bán lẻ', 'Khách sỉ & cửa hàng'];
    if (!validAudiences.includes(audience)) {
      return res.status(400).json({ error: 'Vui lòng chọn mô hình hợp tác hợp lệ.' });
    }

    if (!name || !company || !region || !purpose || !key) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).' });
    }

    if (!/^\+?[\d\s().-]{8,25}$/.test(phone)) {
      return res.status(400).json({ error: 'Số điện thoại không đúng định dạng.' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Vui lòng kiểm tra lại địa chỉ email.' });
    }

    // 4. Idempotency Check: Don't insert duplicate if key was already processed
    const existing = await findRequestByKey(key);
    if (existing) {
      return res.status(200).json({ ok: true, id: existing.id, duplicate: true });
    }

    // 5. Generate clean ID and save
    const id = `CVT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const newRecord = {
      id,
      requestKey: key,
      audience,
      purpose,
      company,
      name,
      phone,
      email,
      region,
      sku,
      note,
      consent: true,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    await insertRequest(newRecord);

    // 6. Asynchronous email alert to LYHU sales team (FormSubmit)
    try {
      fetch('https://formsubmit.co/ajax/lyhu.vn@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🔥 [CVT Web] Yêu Cầu Hợp Tác: ${company} - ${audience} (${phone})`,
          'Mã yêu cầu': id,
          'Mô hình': audience,
          'Nhu cầu': purpose,
          'Đơn vị': company,
          'Người liên hệ': name,
          'Số điện thoại': phone,
          'Email': email || 'Không có',
          'Khu vực': region,
          'Sản phẩm quan tâm': sku || 'Tất cả các dòng',
          'Ghi chú': note || 'Không có',
          'Thời gian': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          _template: 'table'
        })
      }).catch(e => console.warn('FormSubmit notification error (non-fatal):', e));
    } catch (e) {
      // non-fatal
    }

    return res.status(201).json({ ok: true, id });

  } catch (err) {
    console.error('Request handling error:', err);
    return res.status(500).json({
      error: 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc gọi Hotline 0969 069 798.'
    });
  }
}
