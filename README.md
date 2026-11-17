# Marichoo Illustrations

> **Public code showcase.** This is a copy of the code behind [marichoo.com](https://marichoo.com), built by
> [Tin Banožić](https://tin-banozic.from.hr/). The artwork, client logos and documents are not included: they are
> © Marija Knezić Banožić and her clients and may not be reused. The site still builds, just without pictures.

Static portfolio site for Marija Knezić Banožić (Marichoo), rebuilt from the WordPress site with [Astro](https://astro.build).
No server, database, CMS or contact form: the build produces plain HTML, CSS and optimised images.

## Working locally

Requires Node.js 22 or newer.

```sh
npm install        # once
npm run dev        # live-reloading dev server at http://localhost:4321
npm run build      # production build into dist/
npm run preview    # serve dist/ at http://localhost:4321 to check the real build
```

## Deploying (Cloudflare Workers)

The site deploys automatically from GitHub: every push to `main` rebuilds and publishes it.
It runs as a Cloudflare Worker that only serves static files; the settings are in `wrangler.jsonc`.

One-time setup:

1. Push this repository to GitHub.
2. In the Cloudflare dashboard go to **Workers & Pages → Create → Continue with GitHub** and pick the repository.
3. Keep the suggested commands: build command `npm run build`, deploy command `npx wrangler deploy`.
   The Node version comes from `.node-version`.
4. After the first deploy, open the Worker's **Settings → Domains & Routes** and add `marichoo.com` (and `www.marichoo.com`).

To try the Cloudflare setup locally: `npm run build`, then `npx wrangler dev`.

Before pointing the domain at Cloudflare, copy every existing DNS record from the current provider,
especially the **MX/TXT records for the info@marichoo.com mailbox**, or email will stop working.

`public/_headers` sets the security headers (CSP, HSTS, etc.) and long-term caching for hashed assets.

## Where things are

| Path | What |
| --- | --- |
| `src/data/site.json` | Project content and the About page text (imported once from WordPress; edit it directly). |
| `src/pages/index.astro` | Homepage: featured projects, client names and "What I do" are listed at the top of the file. |
| `src/pages/services.astro`, `src/pages/contact.astro` | Services and Contact text, listed at the top of each file. |
| `src/assets/media/` | Images. Astro turns them into responsive WebP at build time. |
| `public/media/` | Files served as-is: PDFs, GIFs and the two press-clipping JPEGs linked from About. |
| `src/lib/content.ts` | Navigation, social links, client logos, SEO titles and descriptions for the main pages. |
| `src/lib/images.ts` | Image optimisation for the HTML in `site.json`. |
| `src/styles/global.css` | All styles ("Ink & paper" design; colours and fonts are set at the top). |

### Adding a project

Add an image to `src/assets/media/`, then add an entry to `projects` in `src/data/site.json`
(copy an existing one; images are referenced as `/media/<file name>`). Projects are listed newest first by `date`.
