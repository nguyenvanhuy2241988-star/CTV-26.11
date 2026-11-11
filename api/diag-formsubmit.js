export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const tests = {};

  // Test 1: As in _email-queue.js (No User-Agent)
  try {
    const r1 = await fetch('https://formsubmit.co/ajax/lyhu.vn@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://www.cvt.com.vn',
        'Referer': 'https://www.cvt.com.vn/dang-ky.html'
      },
      body: JSON.stringify({
        _subject: '[CVT Diag 1] Test No UA',
        test: 'diag1',
        _template: 'table'
      }),
      signal: AbortSignal.timeout(8000)
    });
    tests.test1_no_ua = {
      status: r1.status,
      headers: Object.fromEntries(r1.headers.entries()),
      body: (await r1.text()).slice(0, 500)
    };
  } catch (e) {
    tests.test1_no_ua = { error: e.message };
  }

  // Test 2: With Browser User-Agent
  try {
    const r2 = await fetch('https://formsubmit.co/ajax/lyhu.vn@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Origin': 'https://www.cvt.com.vn',
        'Referer': 'https://www.cvt.com.vn/dang-ky.html'
      },
      body: JSON.stringify({
        _subject: '[CVT Diag 2] Test With UA',
        test: 'diag2',
        _template: 'table'
      }),
      signal: AbortSignal.timeout(8000)
    });
    tests.test2_with_ua = {
      status: r2.status,
      headers: Object.fromEntries(r2.headers.entries()),
      body: (await r2.text()).slice(0, 500)
    };
  } catch (e) {
    tests.test2_with_ua = { error: e.message };
  }

  // Test 3: FormSubmit with _captcha: "false" and User-Agent
  try {
    const r3 = await fetch('https://formsubmit.co/ajax/lyhu.vn@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        _subject: '[CVT Diag 3] Test With Captcha False',
        _captcha: 'false',
        test: 'diag3',
        _template: 'table'
      }),
      signal: AbortSignal.timeout(8000)
    });
    tests.test3_captcha_false = {
      status: r3.status,
      headers: Object.fromEntries(r3.headers.entries()),
      body: (await r3.text()).slice(0, 500)
    };
  } catch (e) {
    tests.test3_captcha_false = { error: e.message };
  }

  return res.status(200).json({ ok: true, tests });
}
