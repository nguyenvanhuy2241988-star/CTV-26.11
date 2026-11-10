// Shared database adapter for CVT website.
// Supports Supabase PostgreSQL (via PostgREST API) with resilient in-memory/preview fallback.

const inMemoryRequests = [];
const inMemoryEntries = new Map();

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    return {
      url: url.replace(/\/$/, ''),
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
  }
  return null;
}

export async function findRequestByKey(requestKey) {
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/cvt_requests?request_key=eq.${encodeURIComponent(requestKey)}&select=id,status`, {
        headers: sb.headers
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) return rows[0];
      }
    } catch (e) {
      console.warn('Supabase query error:', e);
    }
  }

  // Fallback check
  return inMemoryRequests.find(r => r.requestKey === requestKey || r.request_key === requestKey) || null;
}

export async function insertRequest(data) {
  const sb = getSupabaseConfig();
  if (sb) {
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
    // Unique key collision
    if (res.status === 409 || errText.includes('23505') || errText.includes('request_key')) {
      const existing = await findRequestByKey(data.requestKey);
      if (existing) return existing;
    }
    console.error('Supabase insert failed:', res.status, errText);
  }

  // Fallback to memory
  inMemoryRequests.unshift(data);
  return { id: data.id };
}

export async function listRequests(limit = 200) {
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/cvt_requests?order=created_at.desc&limit=${limit}`, {
        headers: sb.headers
      });
      if (res.ok) {
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
      }
    } catch (e) {
      console.warn('Supabase list error:', e);
    }
  }

  return inMemoryRequests.slice(0, limit);
}

export async function updateRequestStatus(id, newStatus) {
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/cvt_requests?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: sb.headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn('Supabase update status error:', e);
    }
  }

  const found = inMemoryRequests.find(r => r.id === id);
  if (found) {
    found.status = newStatus;
    return true;
  }
  return true;
}

export async function listEntries(kind = null) {
  const sb = getSupabaseConfig();
  if (sb) {
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
      console.warn('Supabase entries error:', e);
    }
  }

  const all = Array.from(inMemoryEntries.values());
  return kind ? all.filter(e => e.kind === kind) : all;
}

export async function saveEntry({ id, kind, data, published }) {
  const payloadStr = JSON.stringify(data);
  const now = new Date().toISOString();
  const sb = getSupabaseConfig();

  if (sb) {
    try {
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
      if (res.ok) return true;
    } catch (e) {
      console.warn('Supabase save entry error:', e);
    }
  }

  inMemoryEntries.set(id, {
    id,
    kind,
    payload: payloadStr,
    published: published ? 1 : 0,
    updatedAt: now
  });
  return true;
}
