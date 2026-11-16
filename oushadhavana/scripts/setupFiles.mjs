/* Creates or updates oushadhavana/<plant>/index.html for every plant in data.mjs,
 * from the ../base.htmx template. Run it again after any change to base.htmx or data.mjs.
 * Each page gets its own title, description, canonical URL and share image.
 */
import fs from 'fs';
import plants from '../data.mjs';
import plantImages from '../plantImages.mjs';

const SITE = 'https://pernekshetra.com';
const DEFAULT_IMAGE = `${SITE}/Resource/Oushadhavana/logo.jpg`;
const template = fs.readFileSync('../base.htmx', 'utf8');

// Same rule as scripts/details.js and listing.js: the folder name is the lower-case Sanskrit name.
const slugOf = (plant) => plant['Sanskrit Name'].toLowerCase().replace(/\s+/g, '_');
const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();
const escapeAttr = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function describe(plant) {
  const name = clean(plant['Sanskrit Name']);
  const botanical = clean(plant['Botanical name']);
  const english = clean(plant['English name']);
  const names = [botanical, english].filter(Boolean).join(', ');
  let text = `${name}${names ? ` (${names})` : ''}: a medicinal plant in the Oushadhavana of Perne Kshetra.`;
  const firstSentence = clean(plant['Description']).split(/(?<=\.)\s/)[0];
  if (firstSentence && text.length + firstSentence.length < 230) text += ` ${firstSentence}`;
  return text;
}

const seen = new Set();
let written = 0;
for (const plant of plants) {
  const slug = slugOf(plant);
  // details.js shows the first plant with this folder name, so describe that one.
  if (seen.has(slug)) continue;
  seen.add(slug);

  const url = `${SITE}/oushadhavana/${slug}/`;
  const images = plantImages[slug];
  const image = images && images.length ? `${SITE}/oushadhavana/images/${slug}/${images[0]}` : DEFAULT_IMAGE;
  const title = `${clean(plant['Sanskrit Name'])} Oushadhavana - Perne`;

  const html = template
    .replace(/%%TITLE%%/g, escapeAttr(title))
    .replace(/%%DESCRIPTION%%/g, escapeAttr(describe(plant)))
    .replace(/%%URL%%/g, url)
    .replace(/%%IMAGE%%/g, image)
    .replace(/[ \t]*<!-- %%TOKENS%%.*-->\n/, '');

  fs.mkdirSync(`../${slug}`, { recursive: true });
  fs.writeFileSync(`../${slug}/index.html`, html);
  written++;
}
console.log(`Wrote ${written} plant pages.`);
