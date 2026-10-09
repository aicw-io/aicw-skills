import { randomBytes } from 'node:crypto';
import { isPrivateIP } from './io.mjs';
import { BOOK_SOURCE } from './book.mjs';

export function publicURL(value) {
  const u = new URL(value);
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || u.hash) throw new Error('Use an absolute HTTP(S) URL without credentials or fragments.');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (isPrivateIP(host) || host === 'localhost' || !host.includes('.') || /\.(localhost|local|test|invalid|example)$/.test(host) || host === 'example.com' || host === 'example.org' || host === 'example.net') throw new Error('Submission preparation requires the real public hostname, not a local or example hostname.');
  return u;
}
export function prepareSubmission({ origin, urls, key, sitemap }) {
  const site = publicURL(origin);
  if (site.pathname !== '/' || site.search) throw new Error('--origin must be the website origin without a path or query.');
  const all = [...new Set(urls.map(v => publicURL(v).href))];
  if (!all.length || all.length > 10000) throw new Error('Supply 1 to 10,000 changed URLs.');
  if (all.some(url => new URL(url).origin !== site.origin)) throw new Error('Every changed URL must use the configured website origin.');
  key ??= randomBytes(16).toString('hex');
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) throw new Error('IndexNow key must have 8-128 letters, digits, or hyphens.');
  const sitemapURL = sitemap ? publicURL(sitemap) : null;
  if (sitemapURL && sitemapURL.origin !== site.origin) throw new Error('The sitemap must use the configured origin.');
  return {
    version: 1, book: BOOK_SOURCE, bookPages: '66-70', status: 'prepared-not-submitted', origin: site.origin, sitemap: sitemapURL?.href ?? null,
    keyFile: { name: `${key}.txt`, content: key },
    indexnow: { endpoint: 'https://api.indexnow.org/indexnow', payload: { host: site.hostname, key, keyLocation: new URL(`/${key}.txt`, site).href, urlList: all } },
    steps: [
      'Review changed URLs and their intended public indexability. Deleted URLs are valid IndexNow notifications too.',
      'Publish the UTF-8 key file at the site root through the normal website workflow.',
      'Confirm the public key URL returns the exact key, then send the prepared JSON payload if submission is authorized.',
      'Google: select a verified property, submit the sitemap URL in Sitemaps, then inspect its processing status.',
      'Bing: select a verified site, submit the sitemap, and use IndexNow for changed URLs.',
      'Brave: open https://search.brave.com/submit-url and follow the current form.',
      'Record received, pending, rejected, and confirmed-indexed as separate states. A successful request is not proof of indexing.',
    ],
  };
}
