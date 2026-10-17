import { ApiClient, TypedDefaultApi, SearchItemsRequestContent } from "amazon-creators-api";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const requiredEnvVars = ["AMAZON_CREATORS_CLIENT_ID", "AMAZON_CREATORS_CLIENT_SECRET", "AMAZON_CREATORS_PARTNER_TAG"];
for (const name of requiredEnvVars) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  // A value pasted with its template brackets, e.g. <amzn1.oa2-cs.v1.xxx>, makes
  // Amazon's token endpoint answer 401 for every product. Say so up front.
  if (/^<.*>$/s.test(process.env[name].trim())) {
    console.error(`${name} is wrapped in <angle brackets>. Remove them from the value and run again.`);
    process.exit(1);
  }
}

const client = new ApiClient();
client.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID;
client.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
client.version = process.env.AMAZON_CREATORS_VERSION || "3.1";
client.marketplace = process.env.AMAZON_CREATORS_MARKETPLACE || "www.amazon.com";
const api = new TypedDefaultApi(client);

const PRODUCTS_PATH = join(import.meta.dirname, "all-products.json");
const OUTPUT_PATH = join(import.meta.dirname, "..", "src", "data", "product-images.json");
const ASIN_PATH = join(import.meta.dirname, "..", "src", "data", "product-asins.json");
const REPORT_PATH = join(import.meta.dirname, "all-products-match-report.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The API throws plain objects ({ status, body }), not Error instances.
function describeError(err) {
  if (err instanceof Error) return err.message;
  const detail = err?.body?.message || err?.body?.errors?.[0]?.message || err?.statusText || "";
  return err?.status ? `HTTP ${err.status}${detail ? ` ${detail}` : ""}` : JSON.stringify(err);
}

// Amazon rate-limits bursts with 429. Back off and retry instead of recording an error.
async function searchWithRetry(req, attempts = 4) {
  for (let n = 1; ; n++) {
    try {
      return await api.searchItems(client.marketplace, req);
    } catch (err) {
      if (err?.status !== 429 || n >= attempts) throw err;
      await sleep(2000 * 2 ** (n - 1));
    }
  }
}

const products = JSON.parse(readFileSync(PRODUCTS_PATH, "utf-8"));
const existingImages = existsSync(OUTPUT_PATH) ? JSON.parse(readFileSync(OUTPUT_PATH, "utf-8")) : {};
// ASINs are what turn a tagged search link into a direct /dp/ product link.
const asins = existsSync(ASIN_PATH) ? JSON.parse(readFileSync(ASIN_PATH, "utf-8")) : {};
// Keep earlier accepted matches in the report, so `npm run images:review` still sees
// them after a re-run skips them as cached.
// Quarantined products were rejected by a person. Matching them again would bring the
// wrong product's image straight back, so leave them alone.
const QUARANTINE_PATH = join(import.meta.dirname, "..", "src", "data", "asin-quarantine.json");
const quarantined = new Set(Object.keys(existsSync(QUARANTINE_PATH) ? JSON.parse(readFileSync(QUARANTINE_PATH, "utf-8")) : {}));
const previousReport = existsSync(REPORT_PATH) ? JSON.parse(readFileSync(REPORT_PATH, "utf-8")) : [];
const previousMatch = new Map(previousReport.filter((r) => r.status === "accepted").map((r) => [r.id, r]));

const STOPWORDS = new Set(["the", "best", "premium", "pro", "advanced", "original", "for", "and", "with", "in", "of", "a"]);

// Strip punctuation from both our name and Amazon's title. Stripping it from ours
// only turned "Anthony's" into "anthonys", which never matched Amazon's "anthony's".
const normalize = (s) => s.replace(/[^a-zA-Z0-9&\s-]/g, "");

function brandTokens(name) {
  // Take leading words until we hit a stopword or a number, cap at 2 tokens.
  const words = name.split(/\s+/);
  const tokens = [];
  for (const w of words) {
    const clean = normalize(w);
    if (!clean) continue;
    if (STOPWORDS.has(clean.toLowerCase())) break;
    if (/^\d+$/.test(clean)) break;
    tokens.push(clean.toLowerCase());
    if (tokens.length === 2) break;
  }
  return tokens.length ? tokens : [words[0]?.toLowerCase()].filter(Boolean);
}

function isConfidentMatch(queryName, resultTitle) {
  if (!resultTitle) return false;
  const title = normalize(resultTitle).toLowerCase();
  const tokens = brandTokens(queryName);
  // Require at least one brand token (min length 3) to appear in the result title.
  return tokens.some((t) => t.length >= 3 && title.includes(t));
}

const images = { ...existingImages };
const report = [];

for (let i = 0; i < products.length; i++) {
  const { id, name, file } = products[i];
  // Skip only when BOTH the image and the ASIN are known. Checking the image alone
  // stranded every product matched before ASIN capture existed: it has a picture, so
  // it was skipped, so it never got the /dp/ link that pays better than a search link.
  if (quarantined.has(id)) {
    report.push({ id, name, file, status: "quarantined" });
    continue;
  }
  if (images[id] && asins[id]) {
    const prior = previousMatch.get(id);
    report.push(prior ? { ...prior, name, file, cached: true } : { id, name, file, status: "already-cached" });
    continue;
  }
  try {
    const req = new SearchItemsRequestContent();
    req.partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG;
    req.keywords = name;
    req.itemCount = 3;
    req.searchIndex = "All";
    req.resources = ["itemInfo.title", "images.primary.medium"];
    const result = await searchWithRetry(req);
    const items = result?.searchResult?.items || [];
    const match = items.find((it) => isConfidentMatch(name, it?.itemInfo?.title?.displayValue));

    if (match) {
      images[id] = match.images.primary.medium.url;
      if (match.asin) asins[id] = match.asin;
      report.push({ id, name, file, status: "accepted", matchedTitle: match.itemInfo.title.displayValue, asin: match.asin });
    } else {
      report.push({ id, name, file, status: "rejected", topResultTitle: items[0]?.itemInfo?.title?.displayValue || null });
    }
  } catch (err) {
    report.push({ id, name, file, status: "error", error: describeError(err) });
  }

  if (i % 10 === 0) console.log(`${i + 1}/${products.length}...`);
  await sleep(300);
}

writeFileSync(OUTPUT_PATH, JSON.stringify(images, null, 2) + "\n");
writeFileSync(ASIN_PATH, JSON.stringify(asins, null, 2) + "\n");
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

const accepted = report.filter((r) => r.status === "accepted" && !r.cached).length;
const rejected = report.filter((r) => r.status === "rejected").length;
const errors = report.filter((r) => r.status === "error").length;
console.log(`Done. accepted=${accepted} rejected=${rejected} errors=${errors} total_images=${Object.keys(images).length} total_asins=${Object.keys(asins).length}`);
