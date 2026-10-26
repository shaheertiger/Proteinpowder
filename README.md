# Best Protein Powder

Source for [www.best-proteinpowder.com](https://www.best-proteinpowder.com) — independent
protein powder buying guides and explainers. Astro + Tailwind, static output, deployed on
Vercel.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # runs every content gate, then astro build
npm run preview
```

## How the site is organised

| Path | What it is |
| --- | --- |
| `site.config.mjs` | Domain, brand name and IndexNow key — shared by Astro, the scripts and `src/data/site.ts` |
| `src/pages/best-*.astro` | **Pillars** — roundup buying guides with a `PRODUCTS` array |
| `src/pages/*.astro` (others) | **Spokes** — supporting articles; each one's sticky CTA points at its pillar |
| `src/pages/best-of.astro` | The index of every guide, by category |
| `src/pages/protein-calculator.astro` | Daily protein calculator (`src/components/ProteinCalculator.tsx`) |
| `middleware.ts` | Serves Markdown twins of every page to AI agents (see "Markdown for AI agents") |
| `src/data/` | Site constants, authors, nav, affiliate link resolver, product ASIN/image maps |
| `src/components/` | Shared template: ArticleHeader, TableOfContents, QuickPicks, ProductCard, AuthorBio, AdUnit, SEO, … |
| `src/styles/global.css` | Reading styles for article bodies (spacing, links, tables, FAQ accordions) |
| `scripts/` | Scaffolders, validators, IndexNow, Search Console and affiliate tooling |
| `content/` | Search Console and analytics exports the topic picker reads |
| `.claude/skills/daily-publish/` | The daily publishing run (five articles into the thinnest cluster) |

## Writing pages

Pages are generated from JSON specs so every article shares one canonical layout:

```bash
node scripts/scaffold-article.mjs spec.json   # supporting article
node scripts/scaffold-roundup.mjs spec.json   # pillar roundup
```

The spec format is documented in `.claude/skills/daily-publish/SKILL.md`.

## Gates (run by `npm run build`)

```bash
npm run validate:all
```

- `validate:words` — every article has at least 2,500 words of body prose
- `validate:links` — every internal link resolves to a real page and has a trailing slash
- `validate:format` — every article matches the canonical layout
- `validate:new` — new pages: no duplicate titles, no keyword cannibalisation, no orphans, links to a pillar

## Planning content

```bash
npm run clusters   # pillars ranked by how many supporting articles they have
npm run topics     # today's cluster and the search intents it is missing
npm run gsc        # opportunity report from Search Console exports in content/search-console/
```

## Markdown for AI agents (AEO)

Every page has a Markdown twin for answer engines (ChatGPT, Claude, Perplexity and
others), following the [Dualmark](https://github.com/dodopayments/dualmark) AEO Spec v1.0:

| URL | What it returns |
| --- | --- |
| `/best-whey-protein-powder.md` (and `/index.md` for the home page) | The page as clean Markdown |
| `/best-whey-protein-powder/` with `Accept: text/markdown` | Markdown |
| `/best-whey-protein-powder/` from an AI crawler (GPTBot, ClaudeBot, PerplexityBot, …) | Markdown |
| `/best-whey-protein-powder/` from a browser or a search crawler (Googlebot, Bingbot) | HTML, with a `Link: <…md>; rel="alternate"; type="text/markdown"` header |
| `/llms.txt` | An index of every page, grouped by type |

- `src/integrations/markdown-twins.mjs` writes the `.md` files and `llms.txt` into `dist/`
  at the end of `astro build`, converting each rendered page. Product cards and the picks
  carousel carry `data-md` attributes so they convert to structured blocks; keep them when
  editing those components.
- `middleware.ts` (Vercel Routing Middleware) serves the twins with the spec headers
  (`Content-Type: text/markdown`, `X-Markdown-Tokens`, `X-Robots-Tag: noindex`,
  `Vary: Accept`, `X-AEO-Version`), does the content negotiation, and returns 406 when a
  request accepts neither HTML nor Markdown. It uses `@dualmark/core`, pinned to an exact
  version because the package is pre-1.0.

Check a deployed page with `npx @dualmark/cli verify https://www.best-proteinpowder.com/best-whey-protein-powder/`
(125/125 is a full pass).

## IndexNow

The key is set in `site.config.mjs` and its key file is
`public/fa19d991837f488e96681c6939b4f0dd.txt` (the older `0f4b3b05…` key file is kept so
earlier verification keeps working). After every Vercel
**production** build, the `postbuild` hook submits every sitemap URL to IndexNow
automatically (local and preview builds are skipped). To submit by hand:

```bash
npm run indexnow             # URLs from the local dist/ sitemap
npm run indexnow -- --live   # URLs from the live sitemap
```

## Affiliate links

Outbound product links go through `amazonLink()` in `src/data/affiliate.ts`, which uses a
direct `/dp/<ASIN>` link when one is known and a tagged Amazon search otherwise. To fill in
ASINs and product images, copy `.env.example` to `.env`, add Amazon Creators API
credentials, and run `npm run images:fetch:all`, then `npm run images:review`.

## Before launch

- Set `GA_MEASUREMENT_ID` in `src/data/site.ts` (analytics is off until it is set).
- Confirm the AdSense publisher ID in `src/data/site.ts` and `public/ads.txt`, and add the
  site in AdSense.
- Confirm the Amazon Associates tag in `src/data/affiliate.ts` and add the site to the
  Associates account.
- Confirm `CONTACT_EMAIL` in `src/data/site.ts` is a real mailbox.
- Replace or extend the author in `src/data/authors.ts` with the real person behind the
  guides (no invented credentials).
- Point the domain at Vercel; `vercel.json` redirects the apex to `www`.
