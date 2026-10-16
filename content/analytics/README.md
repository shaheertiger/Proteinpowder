# Analytics exports

Traffic exports (Page / Visitors / Total) from the site analytics dashboard, kept as
the record of what a publishing run was working from.

These are **not** Search Console exports and must not be dropped into
`content/search-console/` — that parser expects clicks, impressions, CTR and
position columns and would read a zero for every row here.

Search Console tells you what people looked for. These files tell you what they
actually read once they arrived, which is the better signal for deciding which
existing cluster deserves more supporting articles.
