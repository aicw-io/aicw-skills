import { parse } from 'parse5';

export const compact = value => String(value ?? '').replace(/\s+/gu, ' ').trim();
export const attr = (node, key) => node.attrs?.find(a => a.name === key)?.value;
function hidden(node) {
  return attr(node, 'hidden') !== undefined || attr(node, 'aria-hidden') === 'true' ||
    /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attr(node, 'style') ?? '');
}
function hiddenByParent(node) {
  for (let n = node; n; n = n.parentNode) if (hidden(n)) return true;
  return false;
}
export function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
}
export function textOf(node, { visible = false } = {}) {
  if (visible && (['script', 'style', 'template', 'nav', 'footer'].includes(node.tagName) ||
    hidden(node))) return '';
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes ?? []).map(n => textOf(n, { visible })).join(' ');
}
export function inspectHTML(html, source) {
  const tree = parse(html, { sourceCodeLocationInfo: true });
  const elements = [];
  walk(tree, n => { if (n.tagName) elements.push(n); });
  const tags = tag => elements.filter(n => n.tagName === tag);
  const main = tags('main')[0] ?? tags('article')[0] ?? tags('body')[0] ?? tree;
  const meta = tags('meta').map(n => ({ name: (attr(n, 'name') ?? attr(n, 'property') ?? '').toLowerCase(), content: attr(n, 'content') ?? '', line: n.sourceCodeLocation?.startLine }));
  const blocks = tags('script').filter(n => attr(n, 'type')?.trim().toLowerCase() === 'application/ld+json').map((n, index) => {
    const raw = textOf(n);
    try { return { index, line: n.sourceCodeLocation?.startLine, data: JSON.parse(raw) }; }
    catch (e) { return { index, line: n.sourceCodeLocation?.startLine, error: e.message, excerpt: raw.slice(0, 180) }; }
  });
  return {
    source, title: compact(textOf(tags('title')[0] ?? {})), lang: attr(tags('html')[0] ?? {}, 'lang') ?? '', meta,
    canonicals: tags('link').filter(n => (attr(n, 'rel') ?? '').toLowerCase().split(/\s+/).includes('canonical')).map(n => attr(n, 'href') ?? ''),
    headings: elements.filter(n => /^h[1-6]$/.test(n.tagName) && !hiddenByParent(n)).map(n => ({ level: Number(n.tagName[1]), text: compact(textOf(n, { visible: true })), line: n.sourceCodeLocation?.startLine })).filter(n => n.text),
    text: compact(textOf(main, { visible: true })),
    visibleText: compact(textOf(tags('body')[0] ?? tree, { visible: true })),
    links: tags('a').map(n => ({ href: attr(n, 'href') ?? '', text: compact(textOf(n)), line: n.sourceCodeLocation?.startLine })),
    images: tags('img').map(n => ({ src: attr(n, 'src') ?? '', alt: attr(n, 'alt'), loading: attr(n, 'loading'), line: n.sourceCodeLocation?.startLine })),
    media: { videos: tags('video').length, audio: tags('audio').length, captions: tags('track').filter(n => ['captions', 'subtitles'].includes(attr(n, 'kind'))).length },
    jsonld: blocks,
    bytes: Buffer.byteLength(html),
  };
}
