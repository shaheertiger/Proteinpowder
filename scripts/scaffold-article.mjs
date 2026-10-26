#!/usr/bin/env node
// Turns a content spec (JSON) into a canonical .astro article page.
//
//   node scripts/scaffold-article.mjs spec.json
//
// The writer produces prose as structured JSON; this file owns every piece of
// markup, so pages come out identical in shape to the hand-written ones and
// `format-audit` passes by construction. See .claude/skills/daily-publish/SKILL.md
// for the spec fields and an example.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');
const q = (s) => JSON.stringify(s);
const indent = (json, n) => JSON.stringify(json, null, 2).replace(/\n/g, '\n' + ' '.repeat(n));

function renderBlocks(blocks) {
  return blocks.map((b) => {
    if (b.type === 'p') return `          <p>\n            ${b.text}\n          </p>\n`;
    if (b.type === 'h3') return `          <h3 class="text-2xl font-bold text-gray-900 mt-10 mb-4">${b.text}</h3>\n`;
    if (b.type === 'callout') return `          <div class="bg-gray-900 text-white rounded-2xl p-6 lg:p-8 my-8">
            <p class="text-xs font-black uppercase tracking-widest text-[#38BDF8] mb-3">${b.kicker}</p>
            <p class="text-xl font-bold text-white mb-3">${b.headline}</p>
            <p class="text-gray-300 leading-relaxed m-0">${b.body}</p>
          </div>\n`;
    if (b.type === 'stats') return `          <div class="bg-gray-900 text-white rounded-2xl p-6 lg:p-8 my-8">
            <p class="text-xs font-black uppercase tracking-widest text-[#38BDF8] mb-4">${b.kicker}</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
${b.stats.map((s, i) => `              <div>
                <p class="text-3xl font-black ${i % 2 ? 'text-[#38BDF8]' : 'text-white'}">${s.value}</p>
                <p class="text-gray-400 text-xs mt-1">${s.label}</p>
              </div>`).join('\n')}
            </div>
          </div>\n`;
    if (b.type === 'table') return `          <div class="overflow-hidden border border-gray-200 rounded-2xl my-8">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
${b.headers.map((h) => `                    <th class="px-4 py-4 font-bold text-gray-600 text-sm">${h}</th>`).join('\n')}
                  </tr>
                </thead>
                <tbody>
${b.rows.map((row, i) => `                  <tr class="${i % 2 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100">
${row.map((cell, j) => `                    <td class="px-4 py-4 ${j === 0 ? 'font-black text-gray-900' : 'text-gray-700'}">${cell}</td>`).join('\n')}
                  </tr>`).join('\n')}
                </tbody>
              </table>
            </div>
          </div>\n`;
    throw new Error(`Unknown block type: ${b.type}`);
  }).join('\n');
}

export function render(spec) {
  const tocItems = [...spec.toc.map(([a, l]) => [a, l]), ['mistakes', 'Common Mistakes'], ['faq', 'FAQ']];
  const toc = tocItems.map(([a, l]) => `      <a href="#${a}">${l}</a>`).join('\n');

  const sections = spec.sections.map((s, i) =>
`        <div id="${s.anchor}" class="scroll-mt-24">
          <h2 class="text-3xl font-black text-gray-900 mt-16 mb-6">
            ${i + 1}. ${s.heading}
          </h2>

${renderBlocks(s.blocks)}        </div>
`).join('\n');

  const faqSchema = indent(spec.faq.map(([name, text]) => ({
    '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text },
  })), 6);

  const faqHtml = spec.faq.map(([question, answer]) =>
`            <details class="faq-item">
              <summary><h3>${question}</h3></summary>
              <div class="faq-answer">
                <p>
                  ${answer}
                </p>
              </div>
            </details>
`).join('\n');

  const mistakesHtml = spec.mistakes.map(([heading, body]) =>
`            <div class="bg-red-50 border border-red-100 rounded-2xl p-6">
              <h3 class="text-lg font-bold text-red-900 mt-0 mb-2">${heading}</h3>
              <p class="text-gray-700 text-sm m-0">
                ${body}
              </p>
            </div>`).join('\n');

  const relatedHtml = spec.related.map(({ url, color, kicker, name, blurb }) =>
`            <a href="${url}" class="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow no-underline group">
              <p class="${color} font-black text-xs uppercase tracking-widest mb-2">${kicker}</p>
              <h3 class="text-gray-900 font-bold text-lg group-hover:text-[#1E90FF] transition-colors">${name}</h3>
              <p class="text-gray-500 text-sm mt-2">${blurb}</p>
            </a>`).join('\n');

  const closing = spec.closing.map((t) =>
    `          <p class="text-gray-300 leading-relaxed mb-4">\n            ${t}\n          </p>`).join('\n');

  const n = spec.sections.length;

  return `---
import Layout from "../layouts/Layout.astro";
import ArticleHeader from "../components/ArticleHeader.astro";
import TableOfContents from "../components/TableOfContents.astro";
import MoreInCategory from "../components/MoreInCategory.astro";
import AuthorBio from "../components/AuthorBio.astro";
import { AUTHORS, DEFAULT_AUTHOR, authorSchema } from "../data/authors";
import { SITE_NAME, SITE_URL } from "../data/site";
import { pageDates } from "../data/dates";

const moreInCategory = ${indent(spec.moreInCategory, 0)};
const author = AUTHORS[DEFAULT_AUTHOR];
const dates = pageDates(Astro.url.pathname, { published: ${q(spec.published)}, modified: ${q(spec.published)} });
const title = ${q(spec.title)};
const description =
  ${q(spec.description)};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: \`\${SITE_URL}/\`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Guides",
          item: \`\${SITE_URL}/best-of/\`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: ${q(spec.crumb)},
          item: \`\${SITE_URL}/${spec.slug}/\`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: ${faqSchema},
    },
    {
      "@type": "Article",
      headline: title,
      description: description,
      author: authorSchema(),
      datePublished: dates.published,
      dateModified: dates.modified,
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
  ],
};
---

<Layout
  title={title}
  description={description}
  ogType="article"
  article={{
    publishedTime: dates.published,
    modifiedTime: dates.modified,
    author: author.name,
    section: ${q(spec.section)},
    tags: ${indent(spec.tags, 4)},
  }}
  jsonLd={schema}
  stickyCta={{
    text: ${q(spec.ctaText)},
    link: ${q(spec.ctaLink)},
  }}
>
  <article class="relative overflow-hidden">
    <ArticleHeader kicker={${q(spec.kicker)}} badge="Research-Backed" author={author} dates={dates} label="Our standards">
      <Fragment slot="title">${spec.h1}</Fragment>
      ${spec.heroLede}
    </ArticleHeader>

    <TableOfContents>
${toc}
    </TableOfContents>

    <!-- Body -->
    <div class="max-w-3xl mx-auto px-4 pb-16 lg:pb-24">
      <div class="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed">
        <p class="lede">
          ${spec.lede}
        </p>

${sections}
        <!-- Common Mistakes -->
        <div id="mistakes" class="scroll-mt-24 mt-16">
          <h2 class="text-3xl font-black text-gray-900 mb-6">
            ${n + 1}. Common Mistakes to Avoid
          </h2>

          <div class="space-y-6 my-8">
${mistakesHtml}
          </div>
        </div>

        <!-- FAQ -->
        <div id="faq" class="scroll-mt-24 mt-16">
          <h2 class="text-3xl font-black text-gray-900 mb-6">
            ${n + 2}. Frequently Asked Questions
          </h2>

          <div class="faq-list">
${faqHtml}
          </div>
        </div>

        <!-- Related Guides -->
        <div class="mt-16">
          <h2 class="text-3xl font-black text-gray-900 mb-6">${spec.relatedHeading}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
${relatedHtml}
          </div>
        </div>

        <!-- Closing -->
        <div class="mt-16 bg-gray-900 text-white rounded-2xl p-6 md:p-8">
          <h2 class="text-2xl font-black text-white mb-4">The Bottom Line</h2>
${closing}
        </div>

        <MoreInCategory category=${q(spec.section)} links={moreInCategory} />

        <AuthorBio />
      </div>
    </div>
  </article>
</Layout>
`;
}

if (import.meta.filename === process.argv[1]) {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error('Usage: node scripts/scaffold-article.mjs <spec.json>');
    process.exit(1);
  }
  const spec = JSON.parse(readFileSync(specPath, 'utf8'));
  const out = join(PAGES_DIR, `${spec.slug}.astro`);
  if (existsSync(out) && !process.argv.includes('--force')) {
    console.error(`Refusing to overwrite existing page: ${spec.slug}.astro (pass --force to replace)`);
    process.exit(1);
  }
  writeFileSync(out, render(spec));
  console.log(`Wrote src/pages/${spec.slug}.astro`);
}
