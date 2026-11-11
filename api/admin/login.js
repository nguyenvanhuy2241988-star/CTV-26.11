import { createSessionToken, isAuthConfigured } from './_auth.js';
import { checkPersistentLoginRateLimit, recordPersistentFailedLogin, clearPersistentLoginAttempts } from '../_db.js';

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

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

  const clientIp = getClientIp(req);
  
  // 1. Persistent Shared Rate Limit Check (Survives serverless cold starts & multiple regions)
  const rateLimitStatus = await checkPersistentLoginRateLimit(clientIp);

  if (!rateLimitStatus.allowed) {
    return res.status(429).json({
      error: 'rate_limited',
      message: `Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${Math.ceil((rateLimitStatus.remainingSec || 900) / 60)} phút.`
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const password = body.password;
    const configuredSecret = (process.env.CVT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '').trim();

    if (!password || typeof password !== 'string' || password !== configuredSecret) {
      // Record failed attempt in persistent database
      const attemptsCount = await recordPersistentFailedLogin(clientIp);
      const remainingAttempts = Math.max(0, 5 - attemptsCount);
      return res.status(401).json({
        error: 'invalid_credentials',
        message: remainingAttempts > 0 
          ? `Mật khẩu quản trị không chính xác. Bạn còn ${remainingAttempts} lần thử.`
          : `Bạn đã nhập sai quá 5 lần. Tài khoản tạm khóa 15 phút trên toàn hệ thống.`
      });
    }

    // Correct password - reset persistent rate limit counter
    await clearPersistentLoginAttempts(clientIp);

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
