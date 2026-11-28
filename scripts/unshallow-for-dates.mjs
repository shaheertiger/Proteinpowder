#!/usr/bin/env node
// Page dates (src/data/dates.ts) come from git history. Vercel builds from a
// shallow clone, which makes every file look newly added in the oldest commit
// it has, so every page claimed to be published and modified on build day.
//
// This step fetches the full commit history (commits and trees only, no file
// contents, so it takes about a second) before the build reads the dates. The
// repository is public, so no credentials are needed. It never fails the build:
// if the fetch does not work, dates.ts skips the shallow boundary commit and
// falls back to the dates declared on each page.
import { execSync } from 'node:child_process';

const run = (cmd, opts = {}) =>
  execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();

try {
  if (run('git rev-parse --is-shallow-repository') !== 'true') {
    console.log('[unshallow] Full git history present; page dates will be exact.');
    process.exit(0);
  }
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const slug = process.env.VERCEL_GIT_REPO_SLUG;
  const url = owner && slug
    ? `https://github.com/${owner}/${slug}.git`
    : run('git config --get remote.origin.url');
  run(`git fetch --quiet --unshallow --filter=blob:none ${url}`, { timeout: 120_000 });
  const shallow = run('git rev-parse --is-shallow-repository');
  console.log(shallow === 'false'
    ? '[unshallow] Fetched full history; page dates will be exact.'
    : '[unshallow] History still shallow; pages fall back to their declared dates.');
} catch (err) {
  console.log(`[unshallow] Could not fetch history (${String(err.message || err).split('\n')[0]}); pages fall back to their declared dates.`);
}
