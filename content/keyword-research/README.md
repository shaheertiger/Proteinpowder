# Keyword research exports

Bing Webmaster Tools **Keyword Research** exports (`Keyword, Trends, Impressions`).
These are market-wide search volumes, not this site's own impressions, so they live
here rather than in `content/search-console/` — the `npm run gsc` parser would read
them as queries the site already appears for.

Use them to size demand when choosing topics, and to check brand and product queries
against existing slugs before writing a new page.

## US keyword list

`protein-powder_all-keywords_us_2026-11-11.csv` is a US keyword export for "protein
powder" (`Keyword, Intent, Volume, Keyword Difficulty, CPC (USD), SERP Features`), about
26,500 rows. Volume is estimated monthly US searches. Use it to choose which intents to
write for the day's pillar and to set each article's primary keyword. When a newer
export arrives, add it alongside this one with its date in the filename. The daily run
uses the newest file.
