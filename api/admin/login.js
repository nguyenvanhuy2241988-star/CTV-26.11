import { createSessionToken, isAuthConfigured } from './_auth.js';

// In-memory rate limiting map: ip -> { count: number, firstAttempt: number, lockedUntil: number }
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  // Check if locked
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingSec };
  }

  // Reset if window passed
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, remainingSec: Math.ceil(LOCKOUT_MS / 1000) };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now, lockedUntil: 0 });
  } else {
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

function clearAttempts(ip) {
  loginAttempts.delete(ip);
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
  const rateLimitStatus = checkRateLimit(clientIp);

  if (!rateLimitStatus.allowed) {
    return res.status(429).json({
      error: 'rate_limited',
      message: `Bạn đã thử đăng nhập sai quá ${MAX_ATTEMPTS} lần. Vui lòng thử lại sau ${Math.ceil(rateLimitStatus.remainingSec / 60)} phút.`
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const password = body.password;
    const configuredSecret = (process.env.CVT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '').trim();

    if (!password || typeof password !== 'string' || password !== configuredSecret) {
      recordFailedAttempt(clientIp);
      const remainingAttempts = Math.max(0, MAX_ATTEMPTS - (loginAttempts.get(clientIp)?.count || 1));
      return res.status(401).json({
        error: 'invalid_credentials',
        message: remainingAttempts > 0 
          ? `Mật khẩu quản trị không chính xác. Bạn còn ${remainingAttempts} lần thử.`
          : `Bạn đã nhập sai quá ${MAX_ATTEMPTS} lần. Tài khoản tạm khóa 15 phút.`
      });
    }

    // Correct password - reset rate limit counter
    clearAttempts(clientIp);

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
