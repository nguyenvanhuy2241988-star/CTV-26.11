export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const isSecure = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  res.setHeader('Set-Cookie', [
    'cvt_admin_session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    isSecure ? 'Secure' : ''
  ].filter(Boolean).join('; '));

  return res.status(200).json({ ok: true, message: 'Đã đăng xuất.' });
}
