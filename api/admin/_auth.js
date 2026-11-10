import crypto from 'crypto';

// Server-side authentication helper.
// Admin operation is strictly governed by CVT_ADMIN_PASSWORD or ADMIN_PASSWORD.
function getSecret() {
  const secret = process.env.CVT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    return null;
  }
  return secret.trim();
}

export function isAuthConfigured() {
  return getSecret() !== null;
}

export function createSessionToken(username = 'admin', customTtlMs = null) {
  const secret = getSecret();
  if (!secret) return null;

  const timestamp = Date.now();
  const ttl = customTtlMs !== null ? customTtlMs : 12 * 60 * 60 * 1000; // 12 hours
  const expiresAt = timestamp + ttl;

  const payload = Buffer.from(JSON.stringify({ u: username, t: timestamp, exp: expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  const secret = getSecret();
  if (!secret) return null;

  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  if (signature !== expectedSignature) return null;

  try {
    const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() > data.exp) return null; // Token expired
    return data;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    const val = decodeURIComponent(parts.join('='));
    list[name] = val;
  });
  return list;
}

export function checkAdminAuth(req) {
  // 1. Security requirement: do NOT trust client-spoofed ChatGPT identity headers
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (verifySessionToken(token)) return true;
  }

  const cookieHeader = req.headers['cookie'];
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies['cvt_admin_session'];
  if (sessionToken && verifySessionToken(sessionToken)) {
    return true;
  }

  return false;
}
