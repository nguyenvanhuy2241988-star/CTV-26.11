import { createSessionToken, isAuthConfigured } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed', message: 'Chỉ chấp nhận phương thức POST' });
  }

  if (!isAuthConfigured()) {
    return res.status(503).json({
      error: 'auth_unconfigured',
      message: 'Hệ thống quản trị chưa được cấu hình biến môi trường CVT_ADMIN_PASSWORD trên Vercel.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const password = body.password;
    const configuredSecret = (process.env.CVT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '').trim();

    if (!password || typeof password !== 'string' || password !== configuredSecret) {
      return res.status(401).json({
        error: 'invalid_credentials',
        message: 'Mật khẩu quản trị không chính xác.'
      });
    }

    const token = createSessionToken('admin');
    if (!token) {
      return res.status(500).json({ error: 'token_failed', message: 'Không thể tạo phiên đăng nhập.' });
    }

    const isSecure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    const cookieFlags = [
      `cvt_admin_session=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=43200', // 12 hours
      isSecure ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieFlags);
    return res.status(200).json({
      ok: true,
      message: 'Đăng nhập thành công.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'server_error', message: 'Lỗi xử lý đăng nhập.' });
  }
}
