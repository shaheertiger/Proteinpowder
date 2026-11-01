// Which hand-written roundups rank a product, and at what position. Read from
// the page sources at build time, so a product page's "Ranked #3 in …" line is
// always what the roundup actually says.
import { PRODUCT_BY_ALIAS } from "./db.mjs";

const SOURCES = import.meta.glob("/src/pages/*.astro", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export interface RoundupPlacement {
  url: string;
  title: string;
  position: number;
  badge: string | null;
  of: number;
}

const BY_PRODUCT = new Map<string, RoundupPlacement[]>();

for (const [file, src] of Object.entries(SOURCES)) {
  const slug = file.replace(/^.*\/|\.astro$/g, "");
  const block = src.match(/const PRODUCTS[\s\S]*?=\s*\[([\s\S]*?)\n\];/);
  if (!block) continue;
  const title = (src.match(/const title =\s*\n?\s*"(.+?)";/) || [])[1] || slug;
  const entries = [...block[1].matchAll(/"id":\s*"([^"]+)"[\s\S]*?"badge":\s*"([^"]*)"/g)];
  entries.forEach(([, id, badge], i) => {
    const product = PRODUCT_BY_ALIAS.get(id);
    if (!product) return;
    const list = BY_PRODUCT.get(product.slug) || [];
    if (!list.some((r) => r.url === `/${slug}/`)) {
      list.push({ url: `/${slug}/`, title: title.split(":")[0], position: i + 1, badge: badge || null, of: entries.length });
    }
    BY_PRODUCT.set(product.slug, list);
  });
}

export function roundupsFor(slug: string): RoundupPlacement[] {
  return (BY_PRODUCT.get(slug) || []).sort((a, b) => a.position - b.position);
}
