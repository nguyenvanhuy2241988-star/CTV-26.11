import { createSessionToken, isAuthConfigured } from './_auth.js';
import { isDbConfigured, checkAtomicLoginRateLimit, recordAtomicFailedLogin, clearAtomicLoginAttempts } from '../_db.js';

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

  // Strict requirement: Database MUST be configured for atomic rate limiting.
  // NO IN-MEMORY FALLBACK: If DB is unreachable, fail closed with 503 to prevent brute-force attacks!
  if (!isDbConfigured()) {
    return res.status(503).json({
      error: 'database_unavailable',
      message: 'Cơ sở dữ liệu kiểm soát đăng nhập chưa sẵn sàng. Vui lòng cấu hình SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trên Vercel.'
    });
  }

  const clientIp = getClientIp(req);
  
  // 1. Atomic Persistent Rate Limit Check
  let rateLimitStatus;
  try {
    rateLimitStatus = await checkAtomicLoginRateLimit(clientIp);
  } catch (dbErr) {
    console.error('Rate limit check failed:', dbErr);
    return res.status(503).json({
      error: 'database_unavailable',
      message: 'Không thể xác thực kiểm soát an toàn do cơ sở dữ liệu lỗi kết nối.'
    });
  }

  if (!rateLimitStatus.allowed) {
    const minutesLeft = Math.max(1, Math.ceil((rateLimitStatus.remainingSec || 900) / 60));
    return res.status(429).json({
      error: 'rate_limited',
      message: `Bạn đã thử đăng nhập sai quá 5 lần. Tài khoản tạm khóa, vui lòng thử lại sau ${minutesLeft} phút.`
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const password = body.password;
    const configuredSecret = (process.env.CVT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '').trim();

    if (!password || typeof password !== 'string' || password !== configuredSecret) {
      // Record failed attempt via atomic DB RPC
      let failResult;
      try {
        failResult = await recordAtomicFailedLogin(clientIp);
      } catch (recordErr) {
        console.error('Record failed attempt DB error:', recordErr);
        return res.status(503).json({
          error: 'database_unavailable',
          message: 'Lỗi ghi nhận kiểm soát an toàn vào cơ sở dữ liệu.'
        });
      }

      if (!failResult.allowed) {
        const minutes = Math.max(1, Math.ceil((failResult.remainingSec || 900) / 60));
        return res.status(429).json({
          error: 'rate_limited',
          message: `Bạn đã nhập sai quá 5 lần. Tài khoản tạm khóa ${minutes} phút trên toàn hệ thống.`
        });
      }

      const remainingAttempts = Math.max(0, 5 - failResult.attempts);
      return res.status(401).json({
        error: 'invalid_credentials',
        message: remainingAttempts > 0 
          ? `Mật khẩu quản trị không chính xác. Bạn còn ${remainingAttempts} lần thử.`
          : `Bạn đã nhập sai quá 5 lần. Tài khoản tạm khóa 15 phút.`
      });
    }

    // Correct password - clear atomic counter in DB
    try {
      await clearAtomicLoginAttempts(clientIp);
    } catch (clearErr) {
      console.warn('Clear attempts warning:', clearErr);
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
