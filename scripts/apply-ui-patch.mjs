import fs from 'fs';
import path from 'path';

const root = 'G:/LYHU/Projects/CTV-26.11';
const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));

let updatedFooterCount = 0;

for (const f of files) {
  const filePath = path.join(root, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Đổi link footer /HANDOFF-NOTICE.html sang /quan-tri.html
  if (content.includes('/HANDOFF-NOTICE.html')) {
    content = content.replaceAll('/HANDOFF-NOTICE.html', '/quan-tri.html');
    changed = true;
    updatedFooterCount++;
  }

  // 2. Trong dang-ky.html, bỏ thuộc tính checked để khách tự tích đồng ý
  if (f === 'dang-ky.html') {
    if (content.includes('id="consent" required checked')) {
      content = content.replace('id="consent" required checked', 'id="consent" required');
      changed = true;
      console.log('dang-ky.html: Removed checked attribute from consent checkbox.');
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log(`Updated ${updatedFooterCount} HTML files with /quan-tri.html link in footer.`);

// Verify dang-ky.html
const dangKyContent = fs.readFileSync(path.join(root, 'dang-ky.html'), 'utf8');
const consentMatch = dangKyContent.match(/<input[^>]*consent[^>]*>/i);
console.log('Consent tag in dang-ky.html:', consentMatch ? consentMatch[0] : 'Not found');
