// Backend-only queue adapter. No anon-key fallback; never expose credentials to the client.
export async function queueRpc(name, args = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('EMAIL_QUEUE_DB_UNCONFIGURED');
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args), signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`EMAIL_QUEUE_DB_${response.status}`);
  return response.json();
}

export function formPayload(lead) {
  return {
    _subject: `[CVT Web] Yêu cầu hợp tác ${lead.id}: ${lead.company}`,
    'Mã yêu cầu': lead.id, 'Mô hình': lead.audience, 'Nhu cầu': lead.purpose,
    'Đơn vị': lead.company, 'Người liên hệ': lead.name, 'Số điện thoại': lead.phone,
    'Email': lead.email || 'Không có', 'Khu vực': lead.region,
    'Sản phẩm quan tâm': lead.sku || 'Tất cả các dòng', 'Ghi chú': lead.note || 'Không có',
    'Thời gian': lead.created_at, _template: 'table'
  };
}

export async function dispatchEmail(lead) {
  try {
    const response = await fetch('https://formsubmit.co/ajax/lyhu.vn@gmail.com', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: 'https://www.cvt.com.vn', Referer: 'https://www.cvt.com.vn/dang-ky.html' },
      body: JSON.stringify(formPayload(lead)), signal: AbortSignal.timeout(8000)
    });
    // Only a definite rate-limit refusal is automatically retried. 5xx and timeout
    // might follow provider acceptance: hold for review to avoid duplicate delivery.
    if (response.status === 429) return { state: 'retry', error: 'gateway_rate_limited' };
    if (response.status >= 500) return { state: 'unconfirmed', error: `gateway_${response.status}` };
    if (!response.ok) return { state: 'failed', error: `gateway_${response.status}` };
    let body;
    try { body = await response.json(); } catch { return { state: 'unconfirmed', error: 'gateway_invalid_json' }; }
    if (body.success === true || body.success === 'true') return { state: 'gateway_accepted', error: null };
    if (body.success === false || body.success === 'false') {
      const activation = /activat/i.test(String(body.message || ''));
      return { state: activation ? 'activation_required' : 'failed', error: activation ? 'gateway_activation_required' : 'gateway_rejected' };
    }
    return { state: 'unconfirmed', error: 'gateway_unknown_response' };
  } catch {
    return { state: 'unconfirmed', error: 'gateway_network_or_timeout' };
  }
}
