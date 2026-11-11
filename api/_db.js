// Shared database adapter for CVT website.
// Strictly communicates with persistent Supabase PostgreSQL via PostgREST API.
// NO in-memory fallback for customer leads, CMS mutations, or admin rate limiting to prevent data loss or security bypass on serverless environments.

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key && url.trim().length > 0 && key.trim().length > 0) {
    return {
      url: url.trim().replace(/\/$/, ''),
      headers: {
        'apikey': key.trim(),
        'Authorization': `Bearer ${key.trim()}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
  }
  return null;
}

export function isDbConfigured() {
  return getSupabaseConfig() !== null;
}

export async function findRequestByKey(requestKey) {
  const sb = getSupabaseConfig();
  if (!sb) return null;

  try {
    const res = await fetch(`${sb.url}/rest/v1/cvt_requests?request_key=eq.${encodeURIComponent(requestKey)}&select=id,status`, {
      headers: sb.headers
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) return rows[0];
    }
  } catch (e) {
    console.warn('Database findRequestByKey query error:', e);
  }
  return null;
}

export async function insertRequest(data) {
  const sb = getSupabaseConfig();
  if (!sb) {
    const err = new Error('DATABASE_NOT_CONFIGURED');
    err.code = 'DATABASE_NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch(`${sb.url}/rest/v1/cvt_requests`, {
    method: 'POST',
    headers: sb.headers,
    body: JSON.stringify({
      id: data.id,
      request_key: data.requestKey,
      audience: data.audience,
      company: data.company,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      region: data.region,
      purpose: data.purpose,
      sku: data.sku || '',
      note: data.note || '',
      consent: data.consent ? 1 : 0,
      status: data.status || 'new',
      created_at: data.createdAt
    })
  });

  if (res.ok) {
    const saved = await res.json();
    return Array.isArray(saved) ? saved[0] : { id: data.id };
  }

  const errText = await res.text();
  const isConflict = res.status === 409 || errText.includes('23505') || errText.includes('duplicate key') || errText.includes('request_key');
  
  if (isConflict) {
    // Concurrent race condition resolution:
    // Query the EXACT record that won the insert race
    const existing = await findRequestByKey(data.requestKey);
    if (existing) {
      return { id: existing.id, status: existing.status, duplicate: true };
    }
  }

  const insertErr = new Error(`DATABASE_INSERT_FAILED: ${res.status} ${errText}`);
  insertErr.status = res.status;
  insertErr.details = errText;
  throw insertErr;
}

export async function listRequests(limit = 200) {
  const sb = getSupabaseConfig();
  if (!sb) {
    const err = new Error('DATABASE_NOT_CONFIGURED');
    err.code = 'DATABASE_NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch(`${sb.url}/rest/v1/cvt_requests?order=created_at.desc&limit=${limit}`, {
    headers: sb.headers
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DATABASE_QUERY_FAILED: ${res.status} ${errText}`);
  }

  const rows = await res.json();
  if (Array.isArray(rows)) {
    return rows.map(r => ({
      id: r.id,
      requestKey: r.request_key,
      audience: r.audience,
      company: r.company,
      name: r.name,
      phone: r.phone,
      email: r.email,
      region: r.region,
      purpose: r.purpose,
      sku: r.sku,
      note: r.note,
      status: r.status,
      createdAt: r.created_at
    }));
  }
  return [];
}

export async function updateRequestStatus(id, newStatus) {
  const sb = getSupabaseConfig();
  if (!sb) {
    const err = new Error('DATABASE_NOT_CONFIGURED');
    err.code = 'DATABASE_NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch(`${sb.url}/rest/v1/cvt_requests?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: sb.headers,
    body: JSON.stringify({ status: newStatus })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DATABASE_UPDATE_FAILED: ${res.status} ${errText}`);
  }
  return true;
}

export async function listEntries(kind = null) {
  const sb = getSupabaseConfig();
  if (!sb) return []; // Read fallback allows defaults without crashing storefront

  try {
    let query = `${sb.url}/rest/v1/cvt_entries?select=*`;
    if (kind) query += `&kind=eq.${encodeURIComponent(kind)}`;
    const res = await fetch(query, { headers: sb.headers });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows)) {
        return rows.map(r => ({
          id: r.id,
          kind: r.kind,
          payload: r.payload,
          published: r.published,
          updatedAt: r.updated_at
        }));
      }
    }
  } catch (e) {
    console.warn('Database listEntries error:', e);
  }
  return [];
}

export async function saveEntry({ id, kind, data, published }) {
  const sb = getSupabaseConfig();
  if (!sb) {
    const err = new Error('DATABASE_NOT_CONFIGURED');
    err.code = 'DATABASE_NOT_CONFIGURED';
    throw err;
  }

  const payloadStr = JSON.stringify(data);
  const now = new Date().toISOString();

  const res = await fetch(`${sb.url}/rest/v1/cvt_entries`, {
    method: 'POST',
    headers: {
      ...sb.headers,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id,
      kind,
      payload: payloadStr,
      published: published ? 1 : 0,
      updated_at: now
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DATABASE_SAVE_ENTRY_FAILED: ${res.status} ${errText}`);
  }
  return true;
}

// ====================================================================
// ATOMIC DISTRIBUTED RATE LIMITING FOR ADMIN LOGIN
// Strictly executes atomic database transactions via PostgREST RPC.
// NO in-memory fallback: If DB is unreachable, strictly throws to trigger 503.
// ====================================================================

export async function checkAtomicLoginRateLimit(ip) {
  const sb = getSupabaseConfig();
  if (!sb) {
    const err = new Error('DATABASE_NOT_CONFIGURED');
    err.code = 'DATABASE_NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch(`${sb.url}/rest/v1/rpc/cvt_check_login_rate_limit`, {
    method: 'POST',
    headers: sb.headers,
    body: JSON.stringify({ p_ip: ip })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DATABASE_RPC_CHECK_FAILED: ${res.status} ${errText}`);
  }

  const rows = await res.json();
  const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!result) {
    // FAIL-CLOSED: Empty result from RPC indicates DB error or invalid response format.
    // Strictly throw to trigger HTTP 503 instead of erroneously allowing bypass!
    throw new Error('DATABASE_RPC_EMPTY_RESPONSE: cvt_check_login_rate_limit returned no rows');
  }

  return {
    allowed: !!result.allowed,
    attempts: Number(result.current_attempts || 0),
    remainingSec: Number(result.remaining_seconds || 0)
  };
}

export async function recordAtomicFailedLogin(ip) {
  const sb = getSupabaseConfig();
  if (!sb) {
    const err = new Error('DATABASE_NOT_CONFIGURED');
    err.code = 'DATABASE_NOT_CONFIGURED';
    throw err;
  }

  // Atomic row-locked RPC execution in PostgreSQL:
  // Reads FOR UPDATE, checks 15-minute window, resets if expired, increments counter, locks if >= 5
  const res = await fetch(`${sb.url}/rest/v1/rpc/cvt_record_login_failure`, {
    method: 'POST',
    headers: sb.headers,
    body: JSON.stringify({
      p_ip: ip,
      p_max_attempts: 5
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DATABASE_RPC_RECORD_FAILED: ${res.status} ${errText}`);
  }

  const rows = await res.json();
  const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!result) {
    // FAIL-CLOSED: Empty result from RPC indicates DB error or invalid response format.
    // Strictly throw to trigger HTTP 503 instead of erroneously allowing bypass!
    throw new Error('DATABASE_RPC_EMPTY_RESPONSE: cvt_record_login_failure returned no rows');
  }

  return {
    allowed: !!result.allowed,
    attempts: Number(result.current_attempts || 1),
    remainingSec: Number(result.remaining_seconds || 0)
  };
}

export async function clearAtomicLoginAttempts(ip) {
  const sb = getSupabaseConfig();
  if (!sb) {
    const err = new Error('DATABASE_NOT_CONFIGURED');
    err.code = 'DATABASE_NOT_CONFIGURED';
    throw err;
  }

  const res = await fetch(`${sb.url}/rest/v1/cvt_admin_attempts?ip=eq.${encodeURIComponent(ip)}`, {
    method: 'DELETE',
    headers: sb.headers
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn(`DATABASE_CLEAR_ATTEMPTS_WARNING: ${res.status} ${errText}`);
  }
  return true;
}
