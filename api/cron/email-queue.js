import crypto from 'node:crypto';
export const config = { maxDuration: 60 };
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: 'cron_unconfigured' });
  const actual = Buffer.from(req.headers.authorization || '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return res.status(401).json({ error: 'unauthorized' });

  // Server-side dispatch to FormSubmit is disabled to avoid dual-sending and Cloudflare 403 blocks.
  // The client browser dispatches notification; the Admin Dashboard remains the canonical source of truth.
  return res.status(200).json({
    ok: true,
    processed: 0,
    serverDispatch: 'disabled',
    notice: 'FormSubmit dispatch is handled by client browser; admin dashboard is canonical source of truth'
  });
}
