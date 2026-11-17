import type { APIRoute } from 'astro';
import { site, SITE_URL } from '../lib/content';
import { responsive } from '../lib/images';

// An image sitemap so Google Images can find every picture in every project.
// It lists each project page with its cover and all images in its content. Linked from robots.txt.

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function imageUrl(src: string): Promise<string> {
  // Optimised images get their largest WebP version; other files (GIFs, files in public/) keep their own address.
  const image = await responsive(src);
  return new URL(image?.src ?? src, SITE_URL).toString();
}

export const GET: APIRoute = async () => {
  const entries = await Promise.all(
    site.projects.map(async (project) => {
      const sources = [project.image?.src, ...[...project.content.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1])];
      const unique = [...new Set(sources.filter((src): src is string => Boolean(src)))];
      const urls = [...new Set(await Promise.all(unique.map(imageUrl)))];
      const images = urls.map((url) => `<image:image><image:loc>${escapeXml(url)}</image:loc></image:image>`).join('');
      return `<url><loc>${SITE_URL}/${project.slug}</loc>${images}</url>`;
    }),
  );
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' +
    entries.join('') +
    '</urlset>';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
