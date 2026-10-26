// Markdown twins for AI agents (Dualmark / AEO Spec v1.0).
//
// After `astro build`, every HTML page gets a clean Markdown copy next to it:
//
//   /                           -> /index.md
//   /best-whey-protein-powder/  -> /best-whey-protein-powder.md
//   /authors/editorial-team/    -> /authors/editorial-team.md
//
// plus /llms.txt, an index of every page. The root middleware.ts serves these
// files with the AEO headers, hands them to AI crawlers and to any request that
// asks for text/markdown, and advertises them on HTML responses.
//
// The Markdown is built from the rendered HTML rather than from page source, so
// every page type is covered and the twin always matches what people see.
// Product cards and the picks carousel carry data-md attributes (see
// ProductCard.astro and QuickPicks.astro) so they convert to tidy structured
// blocks instead of a dump of their markup.
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import domino from '@mixmark-io/domino';
import TurndownService from 'turndown';
import { tables, strikethrough } from 'turndown-plugin-gfm';
import { cleanBody, renderLlmsTxt, toMarkdownPath } from '@dualmark/core';
import { SITE_NAME, SITE_URL } from '../../site.config.mjs';

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

function convertPage(html, pageUrl, td) {
  const doc = domino.createDocument(html);
  const title = text(doc.querySelector('h1')) || text(doc.querySelector('title'));
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || pageUrl;
  const header = doc.querySelector('[data-article-header]');

  absolutize(doc, canonical);
  for (const sel of STRIP) for (const el of $$(doc, sel)) el.remove();

  const meta = [`- **URL**: ${canonical}`];
  let intro = '';
  let kicker = '';
  if (header) {
    const time = header.querySelector('time');
    const author = header.querySelector('a[href*="/authors/"]');
    kicker = text(header.querySelector('p:first-child span'));
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

  return { md: cleanBody(md, { stripImages: true }) + '\n', title, description, canonical, kicker };
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

const GROUPS = [
  ['Start here', (p) => p.path === '/' || p.path === '/best-of/'],
  ['Buying guides', (p) => p.kicker === "Buyer's Guide"],
  ['Brand reviews', (p) => p.kicker === 'Brand Review'],
  ['Tools', (p) => p.path === '/protein-calculator/'],
  ['About this site', (p) => !p.kicker],
  ['Guides and explainers', () => true],
];

function llmsTxt(pages) {
  const sections = GROUPS.map(([title]) => ({ title, links: [] }));
  for (const page of pages.sort((a, b) => a.title.localeCompare(b.title))) {
    const i = GROUPS.findIndex(([, test]) => test(page));
    sections[i].links.push({
      title: page.title.replace(/[[\]]/g, ''),
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
      },
    },
  };
}
