import crypto from 'node:crypto';
import { queueRpc, dispatchEmail } from '../_email-queue.js';
export const config = { maxDuration: 60 };
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: 'cron_unconfigured' });
  const actual = Buffer.from(req.headers.authorization || '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return res.status(401).json({ error: 'unauthorized' });
  // Preview must not consume production jobs. Explicit opt-in only for isolated test DB.
  if (process.env.VERCEL_ENV !== 'production' && process.env.CVT_EMAIL_QUEUE_TEST !== '1') return res.status(409).json({ error: 'non_production_worker_disabled' });
  let processed = 0;
  try {
    // Claim one at a time: jobs never expire while waiting behind others in this worker.
    for (let i=0; i<2; i++) {
      const job = await queueRpc('cvt_claim_email');
      if (!job) break;
      const result = await dispatchEmail(job.lead);
      const saved = await queueRpc('cvt_finish_email', { p_id: job.requestId, p_token: job.token, p_state: result.state, p_error: result.error });
      if (saved !== true) throw new Error('EMAIL_QUEUE_LEASE_LOST');
      processed++;
    }
    return res.status(200).json({ ok: true, processed });
  } catch {
    // Do not log lead contents, keys or raw gateway messages.
    console.error('CVT email worker failed; inspect outbox status');
    return res.status(503).json({ error: 'email_queue_unavailable', processed });
  }
}
