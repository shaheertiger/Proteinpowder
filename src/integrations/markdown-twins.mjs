// Markdown twins for AI agents (Dualmark / AEO Spec v1.0).
//
// After `astro build`, every HTML page gets a clean Markdown copy next to it:
//
//   /                           -> /index.md
//   /best-whey-protein-powder/  -> /best-whey-protein-powder.md
//   /authors/editorial-team/    -> /authors/editorial-team.md
//
// plus /llms.txt, an index of every page, and /llms-full.txt, the guide for AI
// assistants: the hand-written src/data/llms-full-intro.md followed by a
// generated index of every URL in the sitemap. The root middleware.ts serves these
// files with the AEO headers, hands them to AI crawlers and to any request that
// asks for text/markdown, and advertises them on HTML responses.
//
// The Markdown is built from the rendered HTML rather than from page source, so
// every page type is covered and the twin always matches what people see.
// Product cards and the picks carousel carry data-md attributes (see
// ProductCard.astro and QuickPicks.astro) so they convert to tidy structured
// blocks instead of a dump of their markup.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import domino from '@mixmark-io/domino';
import TurndownService from 'turndown';
import { tables, strikethrough } from 'turndown-plugin-gfm';
import { cleanBody, renderLlmsTxt, toMarkdownPath } from '@dualmark/core';
import { SITE_HOST, SITE_NAME, SITE_URL } from '../../site.config.mjs';

// The hand-written part of /llms-full.txt. Edit that file, not this one.
const LLMS_FULL_INTRO = fileURLToPath(new URL('../data/llms-full-intro.md', import.meta.url));

// Pages with no useful content for an agent.
const SKIP = new Set(['/404/']);

// Layout chrome and interactive bits that mean nothing in a text document.
const STRIP = [
  'script', 'style', 'noscript', 'template', 'svg', 'button', 'ins', 'iframe', 'img',
  '[aria-hidden="true"]', '.sr-only',
  '.top-ad', '.qp-ad', '.article-top-ad', '[data-qp-sticky]', '[data-layout-sticky]',
  '[data-controls]', '[data-tablist]', '.table-hint', '[data-toc]',
];

// domino's NodeLists are not iterable, so always go through Array.from.
const $$ = (root, sel) => Array.from(root.querySelectorAll(sel));
const kids = (el) => Array.from(el.children);
const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function absolutize(doc, pageUrl) {
  for (const a of $$(doc, 'a[href]')) {
    const href = a.getAttribute('href');
    if (!href || /^(https?:|mailto:|tel:)/i.test(href)) continue;
    try {
      a.setAttribute('href', new URL(href, pageUrl).toString());
    } catch {
      /* leave malformed hrefs alone */
    }
  }
}

function productCardMarkdown(card) {
  const get = (k) => card.querySelector(`[data-md="${k}"]`);
  const rank = text(card.querySelector('h3 > span:first-child')).replace(/\.$/, '');
  const lines = [`### ${rank ? `${rank}. ` : ''}${text(get('name'))}`, ''];
  const meta = [];
  if (get('award')) meta.push(`**Award:** ${text(get('award'))}`);
  if (get('category')) meta.push(`**Type:** ${text(get('category'))}`);
  if (get('rating')) meta.push(`**Rating:** ${text(get('rating'))}`);
  if (meta.length) lines.push(meta.join(' | '), '');
  const specs = get('specs');
  if (specs) {
    for (const li of $$(specs, 'li')) {
      const label = text(li.querySelector('strong')).replace(/:$/, '');
      const value = text(li).replace(text(li.querySelector('strong')), '').trim();
      lines.push(label ? `- **${label}:** ${value}` : `- ${text(li)}`);
    }
    lines.push('');
  }
  if (get('description')) lines.push(text(get('description')), '');
  if (get('bottom-line')) lines.push(`**Bottom line:** ${text(get('bottom-line'))}`, '');
  for (const [key, label] of [['pros', 'Pros'], ['cons', 'Cons']]) {
    const list = get(key);
    if (!list) continue;
    lines.push(`**${label}:**`, '');
    for (const li of $$(list, 'li')) lines.push(`- ${text(li)}`);
    lines.push('');
  }
  const buy = get('buy');
  if (buy) lines.push(`[Check price on Amazon](${buy.getAttribute('href')})`);
  return `\n\n${lines.join('\n').trim()}\n\n`;
}

function picksMarkdown(box) {
  const heading = text(box.querySelector('[data-md="heading"]')) || 'Our Top Picks';
  const rows = $$(box, '[data-track] > li').map((li) => {
    const link = li.querySelector('[data-md="name"]');
    const name = text(link).replace(/^\d+\.\s*/, '').replace(/\|/g, '/');
    const href = link?.getAttribute('href') ?? '';
    const award = text(li.querySelector('[data-md="award"]')).replace(/\|/g, '/');
    const why = text(li.querySelector('[data-md="summary"]')).replace(/\|/g, '/');
    return `| ${award} | [${name}](${href}) | ${why} |`;
  });
  return `\n\n## ${heading}\n\n| Award | Product | Why |\n| --- | --- | --- |\n${rows.join('\n')}\n\n`;
}

// A block whose children are all links (related-guide grids, "More in" lists)
// reads best as a bulleted list: title, then the card's blurb if it has one.
function isLinkGrid(node) {
  if (node.nodeName !== 'DIV' && node.nodeName !== 'NAV') return false;
  const children = kids(node);
  return children.length >= 2 && children.every((k) => k.nodeName === 'A');
}

function linkGridMarkdown(node) {
  const items = kids(node).map((a) => {
    const title = text(a.querySelector('h3, h4, strong, span.font-bold, span.font-black')) || text(a);
    const ps = $$(a, 'p').map(text).filter(Boolean);
    const blurb = ps.length > 1 ? ps[ps.length - 1] : '';
    return `- [${title}](${a.getAttribute('href')})${blurb ? `: ${blurb}` : ''}`;
  });
  return `\n\n${items.join('\n')}\n\n`;
}

function makeTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    linkStyle: 'inlined',
  });
  td.use([tables, strikethrough]);
  td.addRule('productCard', {
    filter: (n) => n.nodeName === 'SECTION' && n.classList.contains('product-card'),
    replacement: (_c, n) => productCardMarkdown(n),
  });
  td.addRule('quickPicks', {
    filter: (n) => n.nodeType === 1 && n.hasAttribute('data-carousel'),
    replacement: (_c, n) => picksMarkdown(n),
  });
  td.addRule('linkGrid', { filter: isLinkGrid, replacement: (_c, n) => linkGridMarkdown(n) });
  td.addRule('faq', {
    filter: (n) => n.nodeName === 'DETAILS',
    replacement: (_c, n) => {
      const q = text(n.querySelector('summary'));
      const answer = n.querySelector('.faq-answer') ?? n;
      const a = td.turndown(answer.innerHTML).trim();
      return `\n\n### ${q}\n\n${a}\n\n`;
    },
  });
  // Headings on one line, even when the page breaks them with <br>.
  td.addRule('heading', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: (c, n) => {
      const level = Number(n.nodeName.charAt(1));
      const t = c.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
      return t ? `\n\n${'#'.repeat(level)} ${t}\n\n` : '';
    },
  });
  // "- item" rather than turndown's "-   item"; a card-like item with several
  // short blocks ("Protein per scoop" / "and as a share of ...") reads as one line.
  td.addRule('listItem', {
    filter: 'li',
    replacement: (c, n) => {
      const parent = n.parentNode;
      const ordered = parent.nodeName === 'OL';
      const index = Array.prototype.indexOf.call(parent.children, n);
      const marker = ordered ? `${(Number(parent.getAttribute('start')) || 1) + index}. ` : '- ';
      const nested = n.querySelector('ul, ol, table, pre');
      let body = c.replace(/^\n+/, '').replace(/\n+$/, '');
      body = nested
        ? body.replace(/\n/g, `\n${' '.repeat(marker.length)}`)
        : body.replace(/\s*\n+\s*/g, ' - ');
      return `${marker}${body}${n.nextSibling ? '\n' : ''}`;
    },
  });
  // A link wrapped around a whole card: the first line is the title and the
  // rest a short description.
  td.addRule('cardLink', {
    filter: (n) => n.nodeName === 'A' && !!n.querySelector('p, div, h2, h3, h4, span.block'),
    replacement: (_c, n) => {
      const blocks = $$(n, 'p, h2, h3, h4, span, div')
        .filter((el) => !el.querySelector('p, h2, h3, h4, span, div'))
        .map(text)
        .filter(Boolean);
      const [title = text(n), ...rest] = blocks;
      const desc = rest.join(' - ');
      return `\n- [${title}](${n.getAttribute('href')})${desc ? `: ${desc}` : ''}\n`;
    },
  });
  // Dark callout and stat boxes inside the article become blockquotes. The
  // closing "The Bottom Line" box has its own h2 and stays a normal section.
  td.addRule('callout', {
    filter: (n) =>
      n.nodeName === 'DIV' &&
      n.classList.contains('bg-gray-900') &&
      n.classList.contains('rounded-2xl') &&
      !n.querySelector('h2'),
    replacement: (_c, n) => {
      const parts = kids(n);
      const kicker = parts[0] && parts[0].nodeName === 'P' ? text(parts[0]) : '';
      const grid = n.querySelector('.grid');
      let inner;
      if (grid) {
        inner = kids(grid)
          .map((cell) => {
            const [value, label] = $$(cell, 'p').map(text);
            return `- **${value}**${label ? `: ${label}` : ''}`;
          })
          .join('\n');
      } else {
        inner = parts
          .slice(kicker ? 1 : 0)
          .map((el, i) => (i === 0 && el.nodeName === 'P' && parts.length > 2 ? `**${text(el)}**` : td.turndown(el.outerHTML).trim()))
          .join('\n\n');
      }
      const quoted = [kicker ? `**${kicker}**` : '', inner]
        .filter(Boolean)
        .join('\n\n')
        .split('\n')
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n');
      return `\n\n${quoted}\n\n`;
    },
  });
  // Section labels the page draws in small caps ("Our Take", "The Bottom Line").
  td.addRule('tabHeading', {
    filter: (n) => n.nodeType === 1 && n.hasAttribute('data-tab-heading'),
    replacement: (c) => `\n\n**${c.trim()}**\n\n`,
  });
  return td;
}

// The page's <title> without the " | Best Protein Powder" brand segment, so
// "How We Test | Best Protein Powder" lists as "How We Test" and the home page
// as "Independent Protein Powder Reviews". llms.txt and llms-full.txt both use
// it; the Markdown twin itself keeps the on-page h1 as its heading.
function indexTitle(doc) {
  const raw = text(doc.querySelector('title'));
  const parts = raw.split(' | ').filter((p) => p.trim() && p.trim() !== SITE_NAME);
  return parts.join(' | ').trim() || raw || text(doc.querySelector('h1'));
}

// What the indexes need to know about a page, read from its rendered HTML.
function pageMeta(doc, pageUrl) {
  const header = doc.querySelector('[data-article-header]');
  return {
    title: text(doc.querySelector('h1')) || text(doc.querySelector('title')),
    indexTitle: indexTitle(doc),
    description: doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || pageUrl,
    // The small label above an article's h1 ("Buyer's Guide", "Brand Review").
    kicker: header ? text(header.querySelector('p:first-child span')) : '',
  };
}

function convertPage(html, pageUrl, td) {
  const doc = domino.createDocument(html);
  const { title, indexTitle: listTitle, description, canonical, kicker } = pageMeta(doc, pageUrl);
  const header = doc.querySelector('[data-article-header]');

  absolutize(doc, canonical);
  for (const sel of STRIP) for (const el of $$(doc, sel)) el.remove();

  const meta = [`- **URL**: ${canonical}`];
  let intro = '';
  if (header) {
    const time = header.querySelector('time');
    const author = header.querySelector('a[href*="/authors/"]');
    if (time) meta.push(`- **Updated**: ${time.getAttribute('datetime')}`);
    if (author) meta.push(`- **Author**: [${text(author)}](${author.getAttribute('href')})`);
    meta.push(`- **Publisher**: [${SITE_NAME}](${SITE_URL}/)`);
    const ps = $$(header, 'p');
    const dek = text(header.querySelector('h1 + p'));
    const method = ps.find((p) => /\bon the label\b/i.test(p.textContent));
    intro = [dek, method ? `**How we rank:** ${td.turndown(method.innerHTML).trim()}` : '']
      .filter(Boolean)
      .join('\n\n');
    header.remove();
  }

  // Article pages keep their body in .prose; every other page in <main>.
  const root = doc.querySelector('article .prose') ?? doc.querySelector('main') ?? doc.body;
  for (const h1 of $$(root, 'h1')) h1.remove();

  let body = td.turndown(root.innerHTML);
  // Turndown escapes "1." at the start of a line so it is not read as a list;
  // in a heading that is never ambiguous, so put the plain number back.
  body = body.replace(/^(#{1,6} \d+)\\\./gm, '$1.');

  const md = [
    `# ${title}`,
    description ? `\n> ${description}` : '',
    `\n${meta.join('\n')}`,
    '\n---\n',
    intro ? `${intro}\n` : '',
    body,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    md: cleanBody(md, { stripImages: true }) + '\n',
    title,
    indexTitle: listTitle,
    description,
    canonical,
    kicker,
  };
}

function walkHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkHtml(full));
    else if (name === 'index.html') out.push(full);
  }
  return out;
}

// Page categories for llms.txt and the llms-full.txt URL index, first match
// wins. Articles are sorted by the kicker above their h1, so a page the daily
// run adds lands in the right group with no edit here; a new kicker falls
// through to "Guides and explainers".
const GROUPS = [
  ['Start here', (p) => p.path === '/' || p.path === '/best-of/'],
  ['Buying guides', (p) => p.kicker === "Buyer's Guide" || p.kicker === 'Shopping Guide'],
  ['Brand and product reviews', (p) => /\bReview$/.test(p.kicker)],
  ['Comparisons', (p) => p.kicker === 'Comparison'],
  ['Tools', (p) => p.path === '/protein-calculator/'],
  ['About this site', (p) => !p.kicker],
  ['Guides and explainers', () => true],
];

const groupOf = (page) => GROUPS[GROUPS.findIndex(([, test]) => test(page))][0];
const linkTitle = (title) => title.replace(/[[\]]/g, '');

function llmsTxt(pages) {
  const sections = GROUPS.map(([title]) => ({ title, links: [] }));
  for (const page of [...pages].sort((a, b) => a.indexTitle.localeCompare(b.indexTitle))) {
    sections.find((s) => s.title === groupOf(page)).links.push({
      title: linkTitle(page.indexTitle),
      href: page.canonical,
      description: page.description,
    });
  }
  const intro = renderLlmsTxt({
    brandName: SITE_NAME,
    description:
      'Independent protein powder buying guides and explainers. Every powder is judged on its label: protein per scoop, cost per 25 g of protein, the full ingredient list and third-party testing. No paid placements.',
    sections: [
      {
        title: 'Full guide for AI assistants',
        description:
          'Which page answers which question, how to present our picks accurately, our methodology and affiliate disclosure, and every indexable URL:',
        links: [{ title: 'llms-full.txt', href: `${SITE_URL}/llms-full.txt` }],
      },
      {
        title: 'Markdown versions',
        description:
          'Every page below has a Markdown twin: drop the trailing slash and add .md (for example /best-whey-protein-powder.md), or request the page with "Accept: text/markdown".',
        links: [],
      },
      ...sections.filter((s) => s.links.length),
    ],
  });
  return intro;
}

// ---------------------------------------------------------------------------
// /llms-full.txt
// ---------------------------------------------------------------------------

// Every URL in the built sitemap. @astrojs/sitemap writes it in its own
// astro:build:done hook, which runs before this one because sitemap() is
// registered first in astro.config.mjs.
function sitemapUrls(outDir) {
  const files = readdirSync(outDir).filter((f) => /^sitemap-.*\.xml$/.test(f) && f !== 'sitemap-index.xml');
  const urls = [];
  for (const file of files) {
    const xml = readFileSync(join(outDir, file), 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1].trim());
  }
  return [...new Set(urls)];
}

// The file in dist that serves a site URL path.
function distFile(outDir, path) {
  if (/\.[a-z0-9]+$/i.test(path)) return join(outDir, path);
  return join(outDir, path, 'index.html');
}

// Every https://www.best-proteinpowder.com/... URL in the hand-written intro must
// be a page in the sitemap (or, for .md/.txt/.xml files, a file in the build),
// and any #fragment must be an id on that page. Curated links cannot rot.
function checkIntroLinks(intro, outDir, sitemap) {
  const host = SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${host}[^\\s\`'"<>)|]*`, 'g');
  const bad = [];
  for (const raw of new Set(intro.match(pattern) ?? [])) {
    const url = new URL(raw);
    let ok;
    if (/\.[a-z0-9]+$/i.test(url.pathname)) {
      ok = url.pathname === '/llms-full.txt' || existsSync(distFile(outDir, url.pathname));
    } else {
      // The site uses trailing slashes; accept the slash-less form too.
      const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
      ok = sitemap.has(`${SITE_URL}${path}`);
      if (ok && url.hash) {
        const html = readFileSync(distFile(outDir, path), 'utf8');
        ok = html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`);
      }
    }
    if (!ok) bad.push(raw);
  }
  if (bad.length) {
    throw new Error(
      `llms-full.txt: src/data/llms-full-intro.md links to ${bad.length} URL(s) that are not in the built sitemap ` +
        `(or whose #anchor is not on the page). Fix or remove them:\n${bad.map((u) => `  - ${u}`).join('\n')}`,
    );
  }
}

function llmsFullTxt(pages, outDir) {
  const urls = sitemapUrls(outDir);
  if (!urls.length) {
    throw new Error('llms-full.txt: no URLs found in dist/sitemap-*.xml. Is sitemap() registered before markdownTwins()?');
  }
  const sitemap = new Set(urls);
  const intro = readFileSync(LLMS_FULL_INTRO, 'utf8').trim();
  checkIntroLinks(intro, outDir, sitemap);

  const byUrl = new Map(pages.map((p) => [p.canonical, p]));
  const sections = GROUPS.map(([title]) => ({ title, entries: [] }));
  const other = { title: 'Other pages', entries: [] };
  for (const url of urls) {
    let page = byUrl.get(url);
    if (!page) {
      // In the sitemap but skipped above (noindex, say): read its title directly.
      const path = url.slice(SITE_URL.length) || '/';
      const file = distFile(outDir, path);
      if (url.startsWith(SITE_URL) && existsSync(file)) {
        page = { ...pageMeta(domino.createDocument(readFileSync(file, 'utf8')), url), path };
      }
    }
    const section = page ? sections.find((s) => s.title === groupOf(page)) : other;
    const title = page?.indexTitle ? linkTitle(page.indexTitle) : '';
    section.entries.push({ sort: title || url, line: title ? `- [${title}](${url})` : `- ${url}` });
  }

  const blocks = [...sections, other]
    .filter((s) => s.entries.length)
    .map((s) => {
      const lines = s.entries.sort((a, b) => a.sort.localeCompare(b.sort)).map((e) => e.line);
      return `### ${s.title} (${lines.length})\n\n${lines.join('\n')}`;
    });

  const index = [
    '<!-- GENERATED:URL-INDEX — do not edit by hand, see src/integrations/markdown-twins.mjs -->',
    '## Complete URL Index',
    `Every indexable page on ${SITE_HOST} (${urls.length} URLs), generated from the sitemap.`,
    ...blocks,
    '<!-- /GENERATED:URL-INDEX -->',
  ].join('\n\n');

  return { body: `${intro}\n\n${index}\n`, count: urls.length };
}

export default function markdownTwins() {
  return {
    name: 'markdown-twins',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const td = makeTurndown();
        const pages = [];
        for (const file of walkHtml(outDir)) {
          const rel = relative(outDir, dirname(file)).split(sep).join('/');
          const path = rel ? `/${rel}/` : '/';
          if (SKIP.has(path)) continue;
          const html = readFileSync(file, 'utf8');
          if (/<meta name="robots" content="[^"]*noindex/i.test(html)) continue;
          const page = convertPage(html, `${SITE_URL}${path}`, td);
          const target = join(outDir, toMarkdownPath(path));
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(target, page.md);
          pages.push({ ...page, path });
        }
        writeFileSync(join(outDir, 'llms.txt'), llmsTxt(pages));
        logger.info(`Wrote ${pages.length} Markdown twins and llms.txt`);
        const full = llmsFullTxt(pages, outDir);
        writeFileSync(join(outDir, 'llms-full.txt'), full.body);
        logger.info(`Wrote llms-full.txt (${full.count} URLs in the index)`);
      },
    },
  };
}
