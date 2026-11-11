import crypto from 'crypto';
import { isDbConfigured, findRequestByKey, insertRequest } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Chỉ chấp nhận phương thức POST' });
  }

  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (raw.length > 15000) {
      return res.status(413).json({ error: 'payload_too_large', message: 'Nội dung yêu cầu quá dài.' });
    }

    const b = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // 1. Anti-spam honeypot check
    if (b.website) {
      return res.status(400).json({ error: 'invalid_submission', message: 'Yêu cầu không hợp lệ.' });
    }

    // 2. Consent check
    if (b.consent !== true) {
      return res.status(400).json({ error: 'consent_required', message: 'Vui lòng xác nhận đồng ý để LYHU liên hệ xử lý yêu cầu.' });
    }

    // 3. Field extraction & validation
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
      return res.status(400).json({ error: 'invalid_audience', message: 'Vui lòng chọn mô hình hợp tác hợp lệ.' });
    }

    if (!name || !company || !region || !purpose || !key) {
      return res.status(400).json({ error: 'missing_fields', message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).' });
    }

    if (!/^\+?[\d\s().-]{8,25}$/.test(phone)) {
      return res.status(400).json({ error: 'invalid_phone', message: 'Số điện thoại không đúng định dạng.' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'invalid_email', message: 'Vui lòng kiểm tra lại địa chỉ email.' });
    }

    // 4. Verify Persistent Database Availability
    // Critical: NEVER fall back to temporary memory on serverless to prevent data loss!
    if (!isDbConfigured()) {
      return res.status(503).json({
        error: 'database_unavailable',
        message: 'Hệ thống lưu trữ dữ liệu CVT đang bảo trì cấu hình. Vui lòng liên hệ Hotline/Zalo 0969 069 798 để gửi thông tin trực tiếp.'
      });
    }

    // 5. Pre-check idempotency: Check if key was already submitted
    const existing = await findRequestByKey(key);
    if (existing) {
      // PRE-EXISTING: Return 200 immediately, NEVER send email on duplicate!
      return res.status(200).json({
        ok: true,
        id: existing.id,
        status: existing.status,
        duplicate: true,
        message: 'Yêu cầu hợp tác này đã được tiếp nhận trước đó.'
      });
    }

    // 6. Generate candidate ID and save to database
    const candidateId = `CVT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const newRecord = {
      id: candidateId,
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

    let savedRecord;
    try {
      savedRecord = await insertRequest(newRecord);
    } catch (dbErr) {
      console.error('Database write failed:', dbErr);
      return res.status(503).json({
        error: 'save_failed',
        message: 'Chưa thể lưu thông tin vào cơ sở dữ liệu. Vui lòng liên hệ Hotline 0969 069 798 để tránh thất lạc yêu cầu.'
      });
    }

    const finalId = savedRecord.id || candidateId;

    // CRITICAL FIX: If this request lost the concurrent insert race (duplicate: true),
    // RETURN IMMEDIATELY. DO NOT dispatch email notification twice!
    if (savedRecord.duplicate) {
      return res.status(200).json({
        ok: true,
        id: finalId,
        status: savedRecord.status || 'new',
        duplicate: true,
        message: 'Yêu cầu hợp tác này đã được tiếp nhận.'
      });
    }

    // Lead and email job were committed in the same DB transaction.

    return res.status(201).json({
      ok: true,
      id: finalId,
      duplicate: false,
      emailDispatch: 'queued',
      message: 'Đã tiếp nhận yêu cầu hợp tác thành công!'
    });

  } catch (err) {
    console.error('Unhandled request processing error:', err);
    return res.status(500).json({
      error: 'server_error',
      message: 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng liên hệ Hotline 0969 069 798 để được hỗ trợ.'
    });
  }
}
