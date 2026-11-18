# SEO implementation — 19 November 2026

## Scope
- Preserve the production routes. Vercel already redirects `.html` requests to extensionless URLs; canonical, Open Graph URLs, static internal links, client product links and sitemap now use the final destinations.
- Sitemap covers 20 public pages, including the three existing guides and buying instructions. Admin, registration duplicate, handoff and error pages have `noindex` and are excluded.
- Unique descriptive titles and descriptions, Vietnamese social locale, Organization/WebSite/WebPage/BreadcrumbList data. Existing guides include Article data without fabricated publication dates.
- Five ProductGroup entities reflect the ten package images in the existing catalog. No invented GTIN, stock, review, rating or offer data. Reference prices are not live merchant offers; this release does not claim eligibility for Google product rich results.
- Added crawlable flavor/size links and relevant guide/purchase/distributor paths. Clarified the size guide using the existing product catalog.
- Prioritize hero image loading; preconnect font hosts. Prevent duplicate analytics script insertion when the source already includes it. Analytics classification logic is unchanged.
- Preserve original product images, prices, forms, backend APIs, Meta Pixel ID, contact details and admin authentication.

## Verification
Run `npm ci`, `npm run build`, then `node --test tests/seo.test.mjs`.
The checks cover all 24 build outputs, metadata, sitemap membership, public links, catalog/schema consistency, images and single analytics/Pixel initialization.
Before release, verify preview layout on desktop/mobile, product size/flavor selection and existing form rendering without submitting test leads.
After release, verify final HTTP destinations, canonical metadata, robots/sitemap and representative product/buying/guide pages on `https://www.cvt.com.vn`.

## Content priorities
Use the existing five product landing pages for flavor-specific purchase searches. Use `/san-pham` for general khoai môn CVT searches, `/noi-mua` for purchase intent, `/hop-tac` for wholesale/distribution intent. Supporting guides cover package selection and storage; avoid creating multiple near-identical keyword pages.

## Measurement and external follow-up
Search Console indexing/ranking changes are not immediate. Submit or confirm `https://www.cvt.com.vn/sitemap.xml` in the verified CVT property, inspect the home/product/category URLs and review search queries, clicks and indexed pages after crawling. This repository change cannot itself authorize Search Console or guarantee indexing/rankings.
Do not use historical analytics visitor totals as SEO success evidence: previous traffic classification issues require a separate audit. Use Search Console organic clicks and actual purchase/contact actions with validated collection.

## Maintenance
Update visible product information first, then corresponding metadata and structured data. Do not publish unverified discounts, stock, nutrition claims or ratings. Keep old inbound `.html` URLs redirecting, rather than deleting them. Re-run SEO checks after catalog or route changes.
