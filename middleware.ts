// Vercel Routing Middleware: serves each page's Markdown twin to AI agents
// (Dualmark / AEO Spec v1.0). The twins (/slug.md) and /llms.txt are written to
// dist at build time by src/integrations/markdown-twins.mjs.
//
//   GET /best-whey-protein-powder.md          -> Markdown, with AEO headers
//   GET /best-whey-protein-powder/
//       Accept: text/markdown                 -> Markdown
//       User-Agent: GPTBot, ClaudeBot, ...    -> Markdown (if they accept it)
//       anyone else                           -> HTML, plus a Link header that
//                                                points at the Markdown twin
//       Accept: image/png (neither format)    -> 406
//
// Search crawlers such as Googlebot and Bingbot are not on the AI bot list and
// always get HTML.
import { next } from "@vercel/functions";
import {
  detectAIBot,
  markdownResponse,
  negotiateFormat,
  shouldServeMarkdown,
  toMarkdownPath,
} from "@dualmark/core";

// Reading a .md file is a fetch to this same deployment, which runs this
// middleware again. The header marks that inner request so it passes straight
// through to the static file.
const SUBREQUEST_HEADER = "x-dualmark-subrequest";

export const config = {
  // Pages and .md files only: skip build assets and every other file type.
  matcher: [
    "/((?!_astro/|_vercel/|.*\\.(?:js|mjs|css|map|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|xml|json|txt|pdf|webmanifest)$).*)",
  ],
};

async function readMarkdown(origin: string, path: string): Promise<string | null> {
  try {
    const res = await fetch(new URL(path, origin), {
      headers: { [SUBREQUEST_HEADER]: "1" },
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

export default async function middleware(request: Request): Promise<Response> {
  // Fail open: this runs in front of every page, so if anything here throws,
  // serve the normal static page rather than an error.
  try {
    return await handle(request);
  } catch (error) {
    console.error("[aeo-middleware]", error);
    return next();
  }
}

async function handle(request: Request): Promise<Response> {
  if (request.headers.get(SUBREQUEST_HEADER)) return next();
  if (request.method !== "GET" && request.method !== "HEAD") return next();

  const url = new URL(request.url);
  const { pathname, origin } = url;

  // Direct request for a twin: add the AEO headers (Content-Type, token count,
  // noindex, Vary, spec version). A missing twin falls through to the 404 page.
  if (pathname.endsWith(".md")) {
    const body = await readMarkdown(origin, pathname);
    return body === null ? next() : markdownResponse(body);
  }

  const accept = request.headers.get("accept") ?? "";
  const bot = detectAIBot(request.headers.get("user-agent") ?? "");

  // The client accepts neither HTML nor Markdown (e.g. "Accept: image/png").
  if (accept && negotiateFormat(accept) === null) {
    return new Response("Not Acceptable\n\nSupported types: text/html, text/markdown\n", {
      status: 406,
      headers: { "Content-Type": "text/plain; charset=utf-8", Vary: "Accept" },
    });
  }

  const markdownPath = toMarkdownPath(pathname);

  if (shouldServeMarkdown(accept, bot.isBot)) {
    const body = await readMarkdown(origin, markdownPath);
    if (body !== null) {
      return markdownResponse(body, {
        extraHeaders: { "Content-Location": markdownPath },
      });
    }
  }

  // Everyone else gets the normal page, which advertises its twin.
  return next({
    headers: {
      Link: `<${markdownPath}>; rel="alternate"; type="text/markdown"`,
      Vary: "Accept",
    },
  });
}
