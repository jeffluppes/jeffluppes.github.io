# jeffluppes.github.io

Personal blog of **Jeffrey Luppes** — Senior AI/ML Engineer. Built with
[Astro](https://astro.build), styled as "light brutalism" (warm paper, hard
borders, monospace metadata, one warm accent), and deployed as a static site to
GitHub Pages.

## Stack

- **Astro 5** — static site generator, near-zero JS shipped to the browser.
- **Content collections** — posts are Markdown in `src/content/blog/`.
- **@astrojs/rss** + **@astrojs/sitemap** — feed and sitemap generated at build.
- Fonts: Space Grotesk (display) + IBM Plex Mono (labels), from Google Fonts.

## Local development

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:4321
npm run build    # build the static site to ./dist
npm run preview  # preview the production build locally
```

## Writing a post

Create a Markdown file in `src/content/blog/`. The filename becomes the URL
slug (`src/content/blog/my-post.md` → `/blog/my-post`). Frontmatter:

```yaml
---
title: "Your title"
description: "One-line summary for cards, SEO, and the RSS feed."
pubDate: 2026-10-12
category: "Blog"          # Blog | Projects | Cloud | Academics | ...
tags: ["MLOps", "GCP"]    # optional
draft: false              # optional; true hides it from the build
updatedDate: 2026-10-20   # optional
---

Markdown body goes here.
```

New categories appear automatically on `/blog` and get their own
`/categories/<name>` page.

## Deployment (GitHub Pages)

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys on
every push to `main`. One-time setup in the repo:

1. Push this repo to GitHub as **`jeffluppes.github.io`** (user site → served at
   the root domain).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`. The site builds and deploys automatically.

### Deploying from a project repo instead

If you host this in a repo that is *not* `<user>.github.io` (e.g.
`jeffluppes/blog`), the site lives under a subpath. Set the base in
`astro.config.mjs`:

```js
site: "https://jeffluppes.github.io",
base: "/blog",   // the repo name
```

Astro's `<a href="/...">` links and asset URLs are written with that base in
mind as long as you use root-relative paths, which this project does.

## Notes on content

The initial posts are summaries of articles from the existing
[jeffluppes.nl](https://www.jeffluppes.nl/) blog, rewritten for this site.
Replace or expand them freely — they're plain Markdown.
