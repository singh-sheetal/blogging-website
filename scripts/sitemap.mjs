// Writes sitemap.xml next to the prerendered pages. Run after the build (done by `npm run build:prod`).
// Every folder under browser/blog/ is a prerendered story; its date comes from the page's own metadata.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const site = (process.env.SITE_URL ?? 'https://sheetal-blog.firebaseapp.com').replace(/\/$/, '');
const out = process.argv[2] ?? 'dist/blog-site/browser';
const blogDir = join(out, 'blog');

const stories = existsSync(blogDir)
  ? readdirSync(blogDir, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join(blogDir, d.name, 'index.html')))
  : [];
if (stories.length === 0) throw new Error(`No prerendered stories found in ${blogDir}; refusing to write an empty sitemap.`);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
// A story can be prerendered at more than one address (its readable one and its old id one);
// each page names its preferred address in <link rel="canonical">, so list only those, once.
const urls = new Map();
for (const d of stories) {
  const html = readFileSync(join(blogDir, d.name, 'index.html'), 'utf8');
  const loc = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!loc) throw new Error(`blog/${d.name}/index.html has no canonical link`);
  const date = html.match(/property="article:published_time" content="(\d{4}-\d{2}-\d{2})/)?.[1];
  urls.set(loc, date);
}
const entries = [...urls].map(([loc, date]) => `  <url><loc>${esc(loc)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc></url>\n${entries.join('\n')}\n</urlset>\n`;
writeFileSync(join(out, 'sitemap.xml'), xml);
console.log(`sitemap.xml: ${entries.length + 1} URLs`);
