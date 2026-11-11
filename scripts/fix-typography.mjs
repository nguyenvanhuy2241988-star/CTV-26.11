import fs from 'fs';
import path from 'path';

const root = 'G:/LYHU/Projects/CTV-26.11';

// 1. Fix missing spaces before weights in HTML files
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
let fixedSpaceCount = 0;

for (const f of htmlFiles) {
  const filePath = path.join(root, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const regex = /([a-zA-Z\u00C0-\u1EF9]+)([0-9]{2,3}g)/g;
  if (regex.test(content)) {
    content = content.replace(regex, (match, p1, p2) => {
      fixedSpaceCount++;
      return `${p1} ${p2}`;
    });
    changed = true;
  }

  // Ensure space in index.html main heading
  if (f === 'index.html' && content.includes('Mở gói giòn.<span>')) {
    content = content.replace('Mở gói giòn.<span>', 'Mở gói giòn. <span>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
console.log(`Fixed ${fixedSpaceCount} stuck word-weight occurrences across HTML files.`);

// 2. Add Typography Hardening to brand.css
const brandCssPath = path.join(root, 'public/assets/brand.css');
let brandCss = fs.readFileSync(brandCssPath, 'utf8');

const typographyRule = `
/* ====================================================================
   VIETNAMESE TYPOGRAPHY HARDENING: PREVENT OVERLAPPING CHARACTERS & LINES
   ==================================================================== */
h1, h2, h3, h4,
.home-cover h1,
.page-banner h1,
.product-hero h1,
.product-copy h1,
.partner-hero h1,
.catalog-hero h1,
.about-hero h1,
.cvt-story-hero h1,
.cvt-show-head h1,
.cvt-show-head h2,
.hero-v2 h1,
.premium-main h1,
.premium-main h2,
.premium-main h3 {
  letter-spacing: -0.015em !important;
  line-height: 1.22 !important;
  word-break: break-word;
  overflow-wrap: break-word;
}

h1 i, h1 em, h2 i, h2 em {
  letter-spacing: -0.01em !important;
}

.home-cover h1 span {
  margin-top: 8px;
}

.cvt-show-head h1,
.cvt-show-head h2 {
  line-height: 1.25 !important;
  letter-spacing: -0.015em !important;
  margin-bottom: 22px !important;
}
`;

if (!brandCss.includes('VIETNAMESE TYPOGRAPHY HARDENING')) {
  brandCss += typographyRule;
  fs.writeFileSync(brandCssPath, brandCss, 'utf8');
  console.log('Appended typography hardening to brand.css.');
}

// 3. Add to cvt-product-studio.css as well
const studioCssPath = path.join(root, 'public/assets/cvt-product-studio.css');
let studioCss = fs.readFileSync(studioCssPath, 'utf8');

const studioRule = `
/* VIETNAMESE TYPOGRAPHY OVERRIDE */
.cvt-show-head h1,
.cvt-show-head h2 {
  line-height: 1.22 !important;
  letter-spacing: -0.015em !important;
}
`;

if (!studioCss.includes('VIETNAMESE TYPOGRAPHY OVERRIDE')) {
  studioCss += studioRule;
  fs.writeFileSync(studioCssPath, studioCss, 'utf8');
  console.log('Appended typography hardening to cvt-product-studio.css.');
}
