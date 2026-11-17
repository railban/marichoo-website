import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import siteData from './src/data/site.json' with { type: 'json' };

const SITE = 'https://marichoo.com';
const projectDates = new Map(siteData.projects.map((project) => [`${SITE}/${project.slug}`, project.date]));

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  // about.html instead of about/index.html, so hosts serve /about without redirecting to /about/.
  build: { format: 'file' },
  // Emit scripts as files instead of inlining them, so the Content-Security-Policy can forbid inline scripts.
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [
    sitemap({
      // Tag pages duplicate the categories and are marked noindex.
      filter: (page) => !page.includes('/tag/') && !page.endsWith('/404'),
      serialize(item) {
        const date = projectDates.get(item.url);
        return date ? { ...item, lastmod: new Date(date).toISOString() } : item;
      },
    }),
  ],
});
