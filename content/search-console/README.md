# Search Console exports

Drop exports here and the publishing system uses them. Nothing else is required —
no API, no connector, no auth. If this folder is empty the daily job still runs; it
just picks clusters on coverage alone.

## What to export

In Search Console: **Performance → Search results**, set the date range (last 3
months is a good default), then **Export → Download CSV**. That gives you a zip.
Unzip it and copy two files into this folder:

- `Queries.csv` — what people searched for
- `Pages.csv` — which of your URLs got the impressions

Leave the filenames as they are. The parser reads Search Console's own format,
including the `%` in the CTR column, and takes the newest file of each type.

## What to run

```bash
npm run gsc              # the opportunity report
npm run gsc -- --save    # also writes demand.json, which the topic picker reads
```

## What it tells you

1. **Improve first** — pages sitting at positions 5-20 with real impressions.
   Moving one of these up a few places is worth more than a new article, and this
   list is the single most valuable output here.
2. **Rewrite title/meta** — pages ranking on page one with a poor click-through
   rate. That is a title and description problem, not a content problem, and it is
   the cheapest fix available.
3. **Thin clusters with proven demand** — which of the under-built clusters people
   actually search for. `--save` writes this to `demand.json`, and `npm run topics`
   then uses it to break ties between equally thin clusters.
4. **Queries with no page** — search terms pulling impressions that no existing
   page was built for. Treat these as candidates to verify, not instructions: the
   matcher is deliberately generous, so anything listed here is worth a look but
   may already be covered by a page it failed to match.

## Cadence

Monthly is plenty. Search Console data is noisy over short windows, and a fresh
export every day would mostly re-rank the same clusters. Re-run with `--save`
whenever you drop a new export so the topic picker sees current numbers.

The CSVs are committed deliberately — they are the record of what the job was
working from when it made a given decision.
