import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const excluded = new Set(['404', 'quan-tri', 'HANDOFF-NOTICE', 'dang-ky']);
const files = readdirSync(dist).filter(f => f.endsWith('.html'));
const pages = files.filter(f => !excluded.has(f.slice(0, -5)));
const read = f => readFileSync(resolve(dist, f), 'utf8');
const base = 'https://www.cvt.com.vn';
const canonical = f => base + (f === 'index.html' ? '/' : '/' + f.slice(0, -5));

test('all public pages have unique metadata and self-referencing canonical URLs', () => {
  assert.equal(files.length, 24);
  const titles = new Set();
  for (const f of pages) {
    const html = read(f);
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    assert.ok(title, f);
    assert.ok(!titles.has(title), `duplicate title: ${f}`);
    titles.add(title);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, f);
    assert.ok(html.includes(`href="${canonical(f)}"`), f);
    assert.ok(html.includes(`property="og:url" content="${canonical(f)}"`), f);
    assert.ok(/name="description" content="[^"]+"/.test(html), f);
    assert.ok(!/<meta[^>]+noindex/.test(html), f);
    const graphs = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
    assert.equal(graphs.length, 1, f);
    const graph = JSON.parse(graphs[0][1])['@graph'];
    assert.ok(graph.some(n => n['@type'] === 'WebPage' && n.url === canonical(f)), f);
  }
});

test('sitemap matches all indexable HTML pages and excludes utility pages', () => {
  const urls = [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(x => x[1]);
  assert.deepEqual(urls.sort(), pages.map(canonical).sort());
  for (const name of excluded) assert.match(read(name + '.html'), /name="robots" content="noindex, nofollow"/);
});

test('public internal links resolve, without .html redirect hops', () => {
  for (const f of pages) for (const [, href] of read(f).matchAll(/href="(\/[^"\s]*)"/g)) {
    assert.ok(!/\.html(?:[?#]|$)/.test(href), `${f}: ${href}`);
    const path = href.split(/[?#]/)[0];
    if (path === '/' || path.startsWith('//') || path.startsWith('/api/')) continue;
    assert.ok(existsSync(resolve(dist, '.' + path)) || existsSync(resolve(dist, '.' + path + '.html')), `${f}: ${href}`);
  }
});

test('product schema matches catalog sizes and real images; no invented offers or ratings', () => {
  const catalog = JSON.parse(read('assets/cvt-products.json'));
  for (const p of catalog) {
    const html = read(p.link + '.html');
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
    const product = graph.find(n => n['@type'] === 'ProductGroup');
    assert.deepEqual(product.hasVariant.map(v => v.weight.value), p.sizes);
    for (const variant of product.hasVariant) {
      assert.ok(existsSync(resolve(dist, variant.image.replace(base + '/', ''))));
      assert.ok(!variant.offers && !variant.aggregateRating && !variant.review);
    }
    for (const other of catalog) assert.ok(html.includes(`href="/${other.link}"`));
  }
});

test('analytics is injected only once and protected pages remain untracked', () => {
  for (const f of pages) {
    assert.equal((read(f).match(/src="https:\/\/www\.lyhu\.com\.vn\/cvt-analytics.js"/g) || []).length, 1, f);
    assert.equal((read(f).match(/fbq\('init', '1117198146781464'\)/g) || []).length, 1, f);
  }
  for (const f of ['quan-tri.html', 'HANDOFF-NOTICE.html']) assert.ok(!read(f).includes('cvt-analytics.js'));
});
