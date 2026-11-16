/* Writes sitemap.xml at the repo root from the HTML pages in git.
 * Skips pages marked noindex (404 and redirect pages) and folders that are not pages.
 * Run from the repo root after you add or remove a page:  node scripts/build-sitemap.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';

const SITE = 'https://pernekshetra.com';
const SKIP = /^(docs|forms\/og)\//;

const files = execSync('git ls-files "*.html"', { encoding: 'utf8' }).split('\n').filter(Boolean);
const urls = [];
for (const file of files) {
  if (SKIP.test(file) || !file.endsWith('index.html')) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (/<meta name="robots" content="noindex"/.test(html)) continue;
  const path = '/' + file.replace(/index\.html$/, '');
  urls.push({ loc: SITE + path });
}
urls.sort((a, b) => a.loc.split('/').length - b.loc.split('/').length || a.loc.localeCompare(b.loc));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync('sitemap.xml', xml);
console.log(`sitemap.xml: ${urls.length} pages`);
