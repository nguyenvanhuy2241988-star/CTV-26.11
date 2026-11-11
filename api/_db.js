// Shared database adapter for CVT website.
// Strictly communicates with persistent Supabase PostgreSQL via PostgREST API.
// NO in-memory fallback for customer leads or CMS mutations to prevent data loss on serverless environments.

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
// PERSISTENT DISTRIBUTED RATE LIMITING FOR ADMIN LOGIN
// Shared across all serverless lambda instances via cvt_admin_attempts table
// ====================================================================

const memoryRateLimit = new Map(); // Local backup only if DB table isn't created yet
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 mins
const LOCKOUT_MS = 15 * 60 * 1000; // 15 mins

export async function checkPersistentLoginRateLimit(ip) {
  const sb = getSupabaseConfig();
  const now = Date.now();

  if (sb) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/cvt_admin_attempts?ip=eq.${encodeURIComponent(ip)}&select=*`, {
        headers: sb.headers
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const record = rows[0];
          const lockedUntil = record.locked_until ? new Date(record.locked_until).getTime() : 0;
          if (lockedUntil > now) {
            const remainingSec = Math.ceil((lockedUntil - now) / 1000);
            return { allowed: false, remainingSec };
          }
          const firstAttempt = new Date(record.first_attempt).getTime();
          if (now - firstAttempt > WINDOW_MS) {
            // Expired window, allow
            return { allowed: true, attempts: 0 };
          }
          if (record.attempts >= MAX_ATTEMPTS) {
            return { allowed: false, remainingSec: Math.ceil(LOCKOUT_MS / 1000) };
          }
          return { allowed: true, attempts: record.attempts };
        }
      }
    } catch (e) {
      console.warn('Persistent rate limit query warning:', e);
    }
  }

  // In-memory fallback
  const mem = memoryRateLimit.get(ip);
  if (!mem) return { allowed: true, attempts: 0 };
  if (mem.lockedUntil && now < mem.lockedUntil) {
    return { allowed: false, remainingSec: Math.ceil((mem.lockedUntil - now) / 1000) };
  }
  if (now - mem.firstAttempt > WINDOW_MS) {
    memoryRateLimit.delete(ip);
    return { allowed: true, attempts: 0 };
  }
  if (mem.count >= MAX_ATTEMPTS) {
    mem.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, remainingSec: Math.ceil(LOCKOUT_MS / 1000) };
  }
  return { allowed: true, attempts: mem.count };
}

export async function recordPersistentFailedLogin(ip) {
  const sb = getSupabaseConfig();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // Local backup
  const mem = memoryRateLimit.get(ip) || { count: 0, firstAttempt: now, lockedUntil: 0 };
  mem.count += 1;
  if (mem.count >= MAX_ATTEMPTS) {
    mem.lockedUntil = now + LOCKOUT_MS;
  }
  memoryRateLimit.set(ip, mem);

  if (sb) {
    try {
      const checkRes = await fetch(`${sb.url}/rest/v1/cvt_admin_attempts?ip=eq.${encodeURIComponent(ip)}&select=*`, {
        headers: sb.headers
      });
      if (checkRes.ok) {
        const rows = await checkRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const rec = rows[0];
          const newAttempts = (rec.attempts || 0) + 1;
          const lockedUntilIso = newAttempts >= MAX_ATTEMPTS ? new Date(now + LOCKOUT_MS).toISOString() : null;
          await fetch(`${sb.url}/rest/v1/cvt_admin_attempts?ip=eq.${encodeURIComponent(ip)}`, {
            method: 'PATCH',
            headers: sb.headers,
            body: JSON.stringify({
              attempts: newAttempts,
              locked_until: lockedUntilIso,
              updated_at: nowIso
            })
          });
          return newAttempts;
        }
      }

      // First failed attempt insert
      await fetch(`${sb.url}/rest/v1/cvt_admin_attempts`, {
        method: 'POST',
        headers: {
          ...sb.headers,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          ip,
          attempts: 1,
          first_attempt: nowIso,
          locked_until: null,
          updated_at: nowIso
        })
      });
      return 1;
    } catch (e) {
      console.warn('Persistent recordFailedLogin error:', e);
    }
  }

  return mem.count;
}

export async function clearPersistentLoginAttempts(ip) {
  memoryRateLimit.delete(ip);
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      await fetch(`${sb.url}/rest/v1/cvt_admin_attempts?ip=eq.${encodeURIComponent(ip)}`, {
        method: 'DELETE',
        headers: sb.headers
      });
    } catch (e) {
      console.warn('Persistent clearLoginAttempts error:', e);
    }
  }
}
